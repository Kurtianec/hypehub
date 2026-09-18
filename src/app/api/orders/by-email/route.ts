import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptSecret, getCustomerSession } from "@/lib/security";

// GET /api/orders/by-email?email=... — get orders by email (for personal account)
export async function GET(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const email = session.email;

  const orders = await db.order.findMany({
    where: { buyerEmail: email.toLowerCase() },
    include: { product: { include: { category: true } }, events: { orderBy: { createdAt: "asc" } }, warrantyClaims: { orderBy: { createdAt: "desc" } } },
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
      updatedAt: o.updatedAt,
      events: o.events,
      warrantyDays: o.product.warrantyDays,
      warrantyUntil: new Date(o.updatedAt.getTime() + o.product.warrantyDays * 86_400_000),
      claims: o.warrantyClaims,
      // Only show credentials if delivered
      ...(o.status === "delivered" && {
        login: decryptSecret(o.deliveryLogin),
        password: decryptSecret(o.deliveryPass),
        deliveryNote: decryptSecret(o.deliveryNote),
      }),
    })),
  });
}
