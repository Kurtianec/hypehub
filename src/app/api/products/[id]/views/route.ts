import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/products/[id]/views — increment views count
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
