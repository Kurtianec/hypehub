import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminPush } from "@/lib/admin-push";
import { requireAdmin } from "@/lib/security";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const devices = await db.adminPushDevice.count({ where: { active: true } });
  return NextResponse.json({ configured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON), devices });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const result = await sendAdminPush({ title: "HypeHub Admin", body: "Тестовое уведомление работает", tab: "dashboard" });
  return NextResponse.json(result);
}
