import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const started = Date.now();
  try {
    const [products, orders, backups, failedLogins, claims] = await Promise.all([
      db.product.count(), db.order.count(), db.backupSnapshot.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true, name: true } }),
      db.adminLog.count({ where: { action: "login_failed", createdAt: { gte: new Date(Date.now() - 86_400_000) } } }),
      db.warrantyClaim.count({ where: { status: { in: ["new", "in_progress"] } } }),
    ]);
    return NextResponse.json({ ok: true, database: "online", responseMs: Date.now() - started, products, orders, failedLogins24h: failedLogins, openClaims: claims, latestBackup: backups, checkedAt: new Date() });
  } catch (error) { return NextResponse.json({ ok: false, database: "error", error: error instanceof Error ? error.message : "Unknown error", checkedAt: new Date() }, { status: 500 }); }
}
