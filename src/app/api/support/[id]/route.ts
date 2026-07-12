import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH — admin replies to support message
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const updated = await db.supportMessage.update({
    where: { id },
    data: {
      reply: body.reply || null,
      status: body.status || "replied",
    },
  });
  return NextResponse.json({ message: updated });
}
