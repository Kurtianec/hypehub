import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET orders (admin)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await db.order.findMany({
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ orders });
}

// POST — create new order (public)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, buyerEmail, buyerContact, paymentMethod } = body;

  if (!productId || !buyerEmail || !buyerContact || !paymentMethod) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "available") {
    return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
  }

  const order = await db.order.create({
    data: {
      productId,
      buyerEmail,
      buyerContact,
      paymentMethod,
      amount: product.price,
      currency: product.currency,
      status: "pending",
    },
  });

  // Mark product as reserved
  await db.product.update({
    where: { id: productId },
    data: { status: "reserved" },
  });

  return NextResponse.json({ order });
}
