import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { consumeRateLimit, requestIp } from "@/lib/security";

// POST /api/referral — create referral code
export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`referral-create:${ip}`, 5, 60 * 60_000)).allowed) {
    return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  let code = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `HYPE${randomBytes(5).toString("hex").toUpperCase()}`;
    if (!(await db.referral.findUnique({ where: { code: candidate }, select: { id: true } }))) {
      code = candidate;
      break;
    }
  }
  if (!code) return NextResponse.json({ error: "Не удалось создать код" }, { status: 503 });

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
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }
  if (code.length > 32 || !/^[A-Z0-9]+$/i.test(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const ip = requestIp(req);
  if (!(await consumeRateLimit(`referral-read:${ip}`, 60, 60 * 60_000)).allowed) {
    return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
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
