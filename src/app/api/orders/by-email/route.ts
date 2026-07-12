import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/orders/by-email?email=... — get orders by email (for personal account)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const orders = await db.order.findMany({
    where: { buyerEmail: email.toLowerCase() },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Only return safe fields (no login/password unless delivered)
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      productTitle: o.product?.title,
      productCategory: o.product?.category?.name,
      amount: o.amount,
      currency: o.currency,
      paymentMethod: o.paymentMethod,
      status: o.status,
      createdAt: o.createdAt,
      // Only show credentials if delivered
      ...(o.status === "delivered" && {
        login: o.deliveryLogin,
        password: o.deliveryPass,
        deliveryNote: o.deliveryNote,
      }),
    })),
  });
}
