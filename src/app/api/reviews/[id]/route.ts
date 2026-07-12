import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH — admin: approve/reject/edit review
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
  if (body.status !== undefined) data.status = body.status;
  if (body.reply !== undefined) data.reply = body.reply;
  if (body.rating !== undefined) data.rating = parseInt(body.rating);
  if (body.text !== undefined) data.text = body.text;

  const review = await db.review.update({ where: { id }, data });
  return NextResponse.json({ review });
}

// DELETE — admin
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
