import { consumeRateLimit, createCustomerSession, CUSTOMER_SESSION_COOKIE, decryptSecret, requestIp, requireAdmin } from "@/lib/security";
import { releaseExpiredReservations, RESERVATION_MS } from "@/lib/reservations";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET orders (admin)
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  // Исправляет старые заказы: если товар уже вручную вернули в каталог,
  // заказ больше не должен оставаться активным и попадать в счётчик.
  await db.order.updateMany({ where: { status: "pending", product: { status: "available" } }, data: { status: "cancelled" } });
  const orders = await db.order.findMany({
    where: { status: { in: ["pending", "paid"] } },
    include: { product: { include: { category: true } }, events: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ orders: orders.map((o) => ({ ...o, product: o.product ? { ...o.product, login: decryptSecret(o.product.login), password: decryptSecret(o.product.password), deliveryNote: decryptSecret(o.product.deliveryNote) } : o.product, deliveryLogin: decryptSecret(o.deliveryLogin), deliveryPass: decryptSecret(o.deliveryPass), deliveryNote: decryptSecret(o.deliveryNote) })) });
}

// POST — create new order (public)
export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`order:${ip}`, 5, 15 * 60_000)).allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = z.object({ productId: z.string().min(1), buyerEmail: z.string().email().max(254), buyerContact: z.string().min(3).max(200), paymentMethod: z.enum(["crypto_btc", "crypto_usdt", "crypto_ton"]) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { productId, buyerEmail, buyerContact, paymentMethod } = parsed.data;
  await releaseExpiredReservations();
  const reservedUntil = new Date(Date.now() + RESERVATION_MS);
  const order = await db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("UNAVAILABLE");
    const locked = await tx.product.updateMany({ where: { id: productId, status: "available" }, data: { status: "reserved", reservedUntil } });
    if (locked.count !== 1) throw new Error("UNAVAILABLE");
    return tx.order.create({ data: { productId, buyerEmail: buyerEmail.toLowerCase(), buyerContact, paymentMethod, amount: product.price, currency: product.currency, status: "pending", events: { create: { type: "created", label: "Заказ создан", actor: "Покупатель" } } }, include: { events: true } });
  }).catch((e) => e instanceof Error && e.message === "UNAVAILABLE" ? null : Promise.reject(e));
  if (!order) return NextResponse.json({ error: "Product unavailable" }, { status: 409 });

  const session = await createCustomerSession(order.buyerEmail);
  const response = NextResponse.json({ order, reservedUntil });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: session.expiresAt });
  return response;
}
