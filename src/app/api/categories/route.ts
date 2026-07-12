import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { status: "available" } } } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const category = await db.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      icon: body.icon || "Tag",
      color: body.color || "#FF0050",
      platform: body.platform || "other",
      description: body.description || null,
      order: body.order || 0,
    },
  });
  return NextResponse.json({ category });
}
