import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/related?productId=...&limit=3
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const limit = parseInt(searchParams.get("limit") || "3");

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, id: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const related = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: "available",
      id: { not: product.id },
    },
    include: { category: true },
    take: limit,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
  });

  const safe = related.map(({ login, password, deliveryNote, ...rest }) => rest);
  return NextResponse.json({ products: safe });
}
