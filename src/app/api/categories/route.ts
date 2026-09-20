import { requireAdmin } from "@/lib/security";
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
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const category = await db.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      icon: body.icon || "Tag",
      color: body.color || "#8E1537",
      platform: body.platform || "other",
      description: body.description || null,
      order: body.order || 0,
    },
  });
  return NextResponse.json({ category });
}
