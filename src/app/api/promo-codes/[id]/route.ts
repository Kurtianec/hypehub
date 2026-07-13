import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// PATCH — update promo code
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.discount !== undefined) data.discount = parseFloat(body.discount);
  if (body.maxUses !== undefined) data.maxUses = parseInt(body.maxUses);
  if (body.active !== undefined) data.active = !!body.active;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const promo = await db.promoCode.update({ where: { id }, data });
  return NextResponse.json({ promo });
}

// DELETE — delete promo code
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.promoCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
