import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession, requireAdmin, SESSION_COOKIE } from "@/lib/security";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const current = await getAdminSession(req);
  const sessions = await db.adminSession.findMany({ where: { revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, ip: true, userAgent: true, createdAt: true, lastSeenAt: true, expiresAt: true }, orderBy: { lastSeenAt: "desc" } });
  return NextResponse.json({ ok: true, currentSessionId: current?.id, sessions });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const current = await getAdminSession(req);
  if (current) await db.adminSession.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
