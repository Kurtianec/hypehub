import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/reserve — reserve a product for 24 hours with 10% prepayment
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, email, contact } = body;

  if (!productId || !email || !contact) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "available") {
    return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
  }

  // Mark as reserved
  await db.product.update({
    where: { id: productId },
    data: { status: "reserved" },
  });

  // Create order with 10% prepayment amount
  const prepaymentAmount = Math.round(product.price * 0.1 * 100) / 100;
  const order = await db.order.create({
    data: {
      productId,
      buyerEmail: email,
      buyerContact: contact,
      paymentMethod: "reserve",
      amount: prepaymentAmount,
      currency: product.currency,
      status: "pending",
    },
  });

  return NextResponse.json({
    order,
    prepayment: prepaymentAmount,
    fullPrice: product.price,
    productTitle: product.title,
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
  });
}
