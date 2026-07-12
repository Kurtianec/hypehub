import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/admin/login — simple password auth
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;
  const setting = await db.setting.findUnique({ where: { key: "admin_pass" } });
  const adminPass = setting?.value || "hypehub2024";
  if (password === adminPass) {
    return NextResponse.json({
      token: "hypehub-admin-2024",
      ok: true,
    });
  }
  return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
}
