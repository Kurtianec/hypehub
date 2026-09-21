import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeRateLimit, requestIp } from "@/lib/security";

// POST /api/products/[id]/views — increment views count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || id.length > 64) return NextResponse.json({ ok: false }, { status: 400 });
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`product-view:${id}:${ip}`, 3, 60 * 60_000)).allowed) {
    return NextResponse.json({ ok: true, limited: true });
  }
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
