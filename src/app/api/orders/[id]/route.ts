import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptSecret, encryptSecret, requireAdmin } from "@/lib/security";
import { z } from "zod";

const schema = z.object({ status: z.enum(["pending", "paid", "delivered", "cancelled", "archived"]), restoreProduct: z.boolean().optional() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { id } = await params;
  const current = await db.order.findUnique({ where: { id }, include: { product: true } });
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const { status, restoreProduct } = parsed.data;
  const order = await db.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id }, data: {
      status,
      ...(status === "delivered" ? {
        deliveryLogin: encryptSecret(decryptSecret(current.product.login)),
        deliveryPass: encryptSecret(decryptSecret(current.product.password)),
        deliveryNote: current.product.deliveryNote ? encryptSecret(decryptSecret(current.product.deliveryNote)) : null,
      } : {}),
    }});
    if (status === "delivered") await tx.product.update({ where: { id: current.productId }, data: { status: "sold", reservedUntil: null } });
    if (restoreProduct || status === "cancelled") await tx.product.update({ where: { id: current.productId }, data: { status: "available", reservedUntil: null } });
    return updated;
  });
  await db.adminLog.create({ data: { action: "order_status", entity: "order", entityId: id, details: JSON.stringify({ from: current.status, to: status, restoreProduct: !!restoreProduct }) } });
  return NextResponse.json({ ok: true, order });
}
