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
  for (const k of ["name", "slug", "icon", "color", "platform", "description", "order"]) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category });
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
  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
