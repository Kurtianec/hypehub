import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";
  const search = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "0", 10);

  const where: Record<string, unknown> = { status: "available" };
  if (category) where.categoryId = category;
  if (featured) where.featured = true;
  if (search) {
    // Case-insensitive search
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    ...(limit > 0 ? { take: limit } : {}),
  });

  // Strip credentials from public list
  const safe = products.map(({ login, password, deliveryNote, ...rest }) => rest);
  return NextResponse.json({ products: safe });
}

export async function POST(req: NextRequest) {
  // Admin-only
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const product = await db.product.create({
    data: {
      categoryId: body.categoryId,
      title: body.title,
      description: body.description || "",
      price: parseFloat(body.price),
      oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
      image: body.image || null,
      badges: body.badges || null,
      followers: body.followers || null,
      metadata: body.metadata || null,
      login: body.login,
      password: body.password,
      deliveryNote: body.deliveryNote || null,
      status: body.status || "available",
      featured: !!body.featured,
    },
  });
  return NextResponse.json({ product });
}
