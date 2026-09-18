import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeRateLimit, requestIp, requireAdmin } from "@/lib/security";
import { z } from "zod";

// GET — public: list approved reviews
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status === "all"
    ? {} // admin mode
    : { status: "approved" };

  // If admin token provided and status=all — return all
  if (status === "all") {
    const denied = await requireAdmin(req);
    if (denied) return denied;
  }

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reviews });
}

// POST — public: submit new review (pending approval)
export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`review:${ip}`, 3, 60 * 60_000)).allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = z.object({ name: z.string().trim().min(2).max(100), rating: z.coerce.number().int().min(1).max(5), text: z.string().trim().min(3).max(2000), product: z.string().max(200).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { name, rating, text, product } = parsed.data;

  const review = await db.review.create({
    data: {
      name, rating, text, product: product || null,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, id: review.id });
}
