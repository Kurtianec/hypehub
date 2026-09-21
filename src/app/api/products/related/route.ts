import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/related?productId=...&limit=3
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const requestedLimit = Number.parseInt(searchParams.get("limit") || "3", 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 8) : 3;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  if (productId.length > 64) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
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
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
    include: { category: true },
    take: limit,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
  });

  const safe = related.map(({ login, password, deliveryNote, internalNote, ...rest }) => { void login; void password; void deliveryNote; void internalNote; return rest; });
  return NextResponse.json({ products: safe });
}
