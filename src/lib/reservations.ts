import { db } from "@/lib/db";

export const RESERVATION_MS = 15 * 60 * 1000;

export async function releaseExpiredReservations() {
  const now = new Date();
  const expired = await db.product.findMany({ where: { status: "reserved", reservedUntil: { lte: now } }, select: { id: true } });
  if (!expired.length) return 0;
  const ids = expired.map((p) => p.id);
  await db.$transaction([
    db.product.updateMany({ where: { id: { in: ids }, status: "reserved" }, data: { status: "available", reservedUntil: null } }),
    db.order.updateMany({ where: { productId: { in: ids }, status: "pending" }, data: { status: "cancelled" } }),
  ]);
  return ids.length;
}
