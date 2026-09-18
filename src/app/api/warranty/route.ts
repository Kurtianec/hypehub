import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCustomerSession, requireAdmin } from "@/lib/security";

export async function GET(req: NextRequest) {
  const admin = new URL(req.url).searchParams.get("admin") === "1";
  if (admin) {
    const denied = await requireAdmin(req); if (denied) return denied;
    return NextResponse.json({ claims: await db.warrantyClaim.findMany({ include: { order: { include: { product: true } } }, orderBy: { createdAt: "desc" }, take: 300 }) });
  }
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  return NextResponse.json({ claims: await db.warrantyClaim.findMany({ where: { order: { buyerEmail: session.email } }, include: { order: { include: { product: true } } }, orderBy: { createdAt: "desc" } }) });
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const parsed = z.object({ orderId: z.string().min(1), reason: z.enum(["login", "password", "verification", "mismatch", "blocked", "other"]), message: z.string().min(10).max(3000) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Опишите проблему подробнее" }, { status: 400 });
  const order = await db.order.findFirst({ where: { id: parsed.data.orderId, buyerEmail: session.email, status: "delivered" }, include: { product: true } });
  if (!order) return NextResponse.json({ error: "Заказ не найден или ещё не выдан" }, { status: 404 });
  const deadline = new Date(order.updatedAt.getTime() + order.product.warrantyDays * 86_400_000);
  if (deadline < new Date()) return NextResponse.json({ error: "Гарантийный срок завершён" }, { status: 409 });
  const claim = await db.warrantyClaim.create({ data: parsed.data });
  await db.orderEvent.create({ data: { orderId: order.id, type: "warranty_claim", label: "Создано гарантийное обращение", actor: "Покупатель", details: JSON.stringify({ claimId: claim.id, reason: claim.reason }) } });
  return NextResponse.json({ claim });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const parsed = z.object({ id: z.string(), status: z.enum(["new", "in_progress", "resolved", "rejected"]), adminNote: z.string().max(3000).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  const claim = await db.warrantyClaim.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status, adminNote: parsed.data.adminNote } });
  await db.adminLog.create({ data: { action: "warranty_updated", entity: "order", entityId: claim.orderId, details: JSON.stringify({ claimId: claim.id, status: claim.status }) } });
  return NextResponse.json({ claim });
}
