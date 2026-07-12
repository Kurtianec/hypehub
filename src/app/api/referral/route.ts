import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/referral — create referral code
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = body.email;

  // Generate unique code
  const code = `HYPE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const referral = await db.referral.create({
    data: {
      code,
      email: email || null,
    },
  });

  return NextResponse.json({ code: referral.code, id: referral.id });
}

// GET /api/referral?code=... — track click + get stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const referral = await db.referral.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Increment clicks (only if ?track=1)
  if (searchParams.get("track") === "1") {
    await db.referral.update({
      where: { id: referral.id },
      data: { clicks: { increment: 1 } },
    });
  }

  return NextResponse.json({
    code: referral.code,
    clicks: referral.clicks,
    orders: referral.orders,
    earnings: referral.earnings,
  });
}
