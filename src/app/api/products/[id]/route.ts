import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  const allowed = [
    "categoryId", "title", "description", "price", "oldPrice", "image",
    "badges", "followers", "metadata", "login", "password", "deliveryNote",
    "status", "featured",
  ];
  for (const k of allowed) {
    if (body[k] !== undefined) {
      if (k === "price" || k === "oldPrice") {
        data[k] = body[k] !== null ? parseFloat(body[k]) : null;
      } else if (k === "featured") {
        data[k] = !!body[k];
      } else {
        data[k] = body[k];
      }
    }
  }

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
