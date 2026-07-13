import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// GET /api/orders/archived — archived/delivered orders
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    where: { status: { in: ["delivered", "cancelled"] } },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}
