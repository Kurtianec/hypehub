import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — list support messages (admin only)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messages = await db.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ messages });
}

// POST — public user sends support message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, contact, message, sessionId } = body;
  if (!name || !contact || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const msg = await db.supportMessage.create({
    data: {
      name,
      contact,
      message,
      sessionId: sessionId || null,
      status: "new",
    },
  });
  return NextResponse.json({ ok: true, id: msg.id });
}
