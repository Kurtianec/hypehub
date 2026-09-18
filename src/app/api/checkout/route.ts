import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptSecret, encryptSecret, requireAdmin } from "@/lib/security";

// POST /api/checkout — confirm payment and deliver credentials
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const { orderId, txnHash } = body;

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "delivered") {
    // Already paid — re-deliver
    return NextResponse.json({
      status: "delivered",
      login: decryptSecret(order.deliveryLogin),
      password: decryptSecret(order.deliveryPass),
      deliveryNote: decryptSecret(order.deliveryNote),
      productTitle: order.product.title,
    });
  }

  // For demo: auto-confirm payment on submit (in production would verify on blockchain /  API)
  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status: "delivered",
      txnHash: txnHash || null,
      deliveryLogin: encryptSecret(decryptSecret(order.product.login)),
      deliveryPass: encryptSecret(decryptSecret(order.product.password)),
      deliveryNote: order.product.deliveryNote ? encryptSecret(decryptSecret(order.product.deliveryNote)) : null,
    },
  });

  await db.product.update({
    where: { id: order.productId },
    data: { status: "sold" },
  });

  return NextResponse.json({
    status: "delivered",
    login: decryptSecret(updated.deliveryLogin),
    password: decryptSecret(updated.deliveryPass),
    deliveryNote: decryptSecret(updated.deliveryNote),
    productTitle: order.product.title,
  });
}

// GET — check order status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      paymentMethod: true,
      createdAt: true,
      deliveryLogin: true,
      deliveryPass: true,
      deliveryNote: true,
      product: { select: { title: true, status: true, reservedUntil: true, categoryId: true } },
      events: { select: { type: true, label: true, actor: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order: { ...order, deliveryLogin: order.deliveryLogin ? decryptSecret(order.deliveryLogin) : null, deliveryPass: order.deliveryPass ? decryptSecret(order.deliveryPass) : null, deliveryNote: order.deliveryNote ? decryptSecret(order.deliveryNote) : null } });
}
