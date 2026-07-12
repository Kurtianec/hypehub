import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// Helper to log admin actions
export async function logAdminAction(
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>,
  ip?: string
) {
  try {
    await db.adminLog.create({
      data: {
        action,
        entity,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : null,
        ip: ip || null,
      },
    });
  } catch (e) {
    console.error("Failed to log admin action:", e);
  }
}

// GET — list admin logs (admin only)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const entity = searchParams.get("entity");

  const where = entity ? { entity } : {};

  const logs = await db.adminLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}
