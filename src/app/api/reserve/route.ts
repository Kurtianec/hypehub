import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeRateLimit, requestIp } from "@/lib/security";
import { releaseExpiredReservations, RESERVATION_MS } from "@/lib/reservations";
import { z } from "zod";

// POST /api/reserve — reserve a product for 24 hours with 10% prepayment
export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`reserve:${ip}`, 3, 15 * 60_000)).allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = z.object({ productId: z.string().min(1), email: z.string().email().max(254), contact: z.string().min(3).max(200) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { productId, email, contact } = parsed.data;
  await releaseExpiredReservations();
  const expiresAt = new Date(Date.now() + RESERVATION_MS);
  const result = await db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("UNAVAILABLE");
    const locked = await tx.product.updateMany({ where: { id: productId, status: "available" }, data: { status: "reserved", reservedUntil: expiresAt } });
    if (locked.count !== 1) throw new Error("UNAVAILABLE");
    const prepaymentAmount = Math.round(product.price * 0.1 * 100) / 100;
    const order = await tx.order.create({ data: { productId, buyerEmail: email.toLowerCase(), buyerContact: contact, paymentMethod: "reserve", amount: prepaymentAmount, currency: product.currency, status: "pending", events: { create: { type: "created", label: "Товар зарезервирован", actor: "Покупатель", details: JSON.stringify({ expiresAt }) } } }, include: { events: true } });
    return { product, prepaymentAmount, order };
  }).catch((e) => e instanceof Error && e.message === "UNAVAILABLE" ? null : Promise.reject(e));
  if (!result) return NextResponse.json({ error: "Product unavailable" }, { status: 409 });

  return NextResponse.json({
    order: result.order,
    prepayment: result.prepaymentAmount,
    fullPrice: result.product.price,
    productTitle: result.product.title,
    expiresIn: RESERVATION_MS / 1000,
  });
}
