import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH — admin replies to support message
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
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
