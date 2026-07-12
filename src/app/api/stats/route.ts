import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [productsCount, ordersCount, categoriesCount] = await Promise.all([
    db.product.count({ where: { status: "available" } }),
    db.order.count(),
    db.category.count(),
  ]);
  return NextResponse.json({
    products: productsCount,
    orders: ordersCount,
    categories: categoriesCount,
  });
}
