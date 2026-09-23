import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/security";

const schema = z.object({
  token: z.string().min(20).max(4096),
  platform: z.enum(["android", "ios", "web"]).default("android"),
  deviceId: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
  const { token, platform, deviceId } = parsed.data;
  await db.adminPushDevice.upsert({
    where: { token },
    create: { token, platform, deviceId: deviceId || null },
    update: { platform, deviceId: deviceId || null, active: true, lastSeenAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const parsed = z.object({ token: z.string().min(20) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
  await db.adminPushDevice.updateMany({ where: { token: parsed.data.token }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
