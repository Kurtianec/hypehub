import { decryptSecret, requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// GET /api/orders/archived — archived/delivered orders
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const orders = await db.order.findMany({
    where: { status: { in: ["delivered", "cancelled", "archived"] } },
    include: { product: { include: { category: true } }, events: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders: orders.map((o) => ({ ...o, deliveryLogin: decryptSecret(o.deliveryLogin), deliveryPass: decryptSecret(o.deliveryPass), deliveryNote: decryptSecret(o.deliveryNote) })) });
}
