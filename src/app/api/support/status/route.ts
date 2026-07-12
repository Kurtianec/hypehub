import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — public: check status of user's support messages by session token
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionToken = searchParams.get("token");

  if (!sessionToken) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const messages = await db.supportMessage.findMany({
    where: { sessionId: sessionToken },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      name: m.name,
      message: m.message,
      reply: m.reply,
      status: m.status,
      createdAt: m.createdAt,
    })),
  });
}
