import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// GET /api/orders/archived — archived/delivered orders
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const orders = await db.order.findMany({
    where: { status: { in: ["delivered", "cancelled"] } },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}
