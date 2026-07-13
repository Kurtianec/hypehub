import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// GET — list blacklisted emails/IPs (stored as Settings with prefix "bl_")
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await db.setting.findMany({ where: { key: { startsWith: "bl_" } } });
  return NextResponse.json({
    blacklist: settings.map((s) => ({ id: s.id, key: s.key, value: s.value })),
  });
}

// POST — add to blacklist (pending admin confirmation)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, value } = await req.json();
  if (!type || !value) return NextResponse.json({ error: "type and value required" }, { status: 400 });

  const key = `bl_${type}_${value}`;
  const existing = await db.setting.findUnique({ where: { key } });
  if (existing) return NextResponse.json({ error: "Already blacklisted" }, { status: 400 });

  await db.setting.create({ data: { id: key, key, value: `${type}:${value}` } });
  return NextResponse.json({ ok: true, message: "Added to blacklist. All future actions from this source will be flagged." });
}

// DELETE — remove from blacklist
export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.setting.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
