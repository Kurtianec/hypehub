import { consumeRateLimit, requestIp, requireAdmin } from "@/lib/security";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminPush } from "@/lib/admin-push";

// GET — list support messages (admin only)
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const messages = await db.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ messages });
}

// POST — public user sends support message
export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`support:${ip}`, 5, 10 * 60_000)).allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = z.object({ name: z.string().trim().min(2).max(100), contact: z.string().trim().min(3).max(200), message: z.string().trim().min(2).max(3000), sessionId: z.string().max(100).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { name, contact, message, sessionId } = parsed.data;
  const msg = await db.supportMessage.create({
    data: {
      name,
      contact,
      message,
      sessionId: sessionId || null,
      status: "new",
    },
  });
  void sendAdminPush({ title: "Новое обращение", body: `${name}: ${message.slice(0, 120)}`, tab: "support", entityId: msg.id });
  return NextResponse.json({ ok: true, id: msg.id });
}
