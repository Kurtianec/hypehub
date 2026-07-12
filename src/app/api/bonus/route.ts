import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/bonus?email=... — get user's bonus points
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  let account = await db.userAccount.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Auto-create if not exists
  if (!account) {
    account = await db.userAccount.create({
      data: { email: email.toLowerCase(), points: 0, totalSpent: 0 },
    });
  }

  return NextResponse.json({
    email: account.email,
    points: account.points,
    totalSpent: account.totalSpent,
    pointsValue: account.points, // 1 point = 1 RUB
    canUse: account.points >= 100, // minimum 100 points to use
  });
}

// POST /api/bonus — add points after purchase (called internally after order)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, amount } = body;

  if (!email || !amount) {
    return NextResponse.json({ error: "email and amount required" }, { status: 400 });
  }

  // 1 RUB spent = 1 point
  const points = Math.floor(amount);

  let account = await db.userAccount.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!account) {
    account = await db.userAccount.create({
      data: {
        email: email.toLowerCase(),
        points,
        totalSpent: amount,
      },
    });
  } else {
    account = await db.userAccount.update({
      where: { id: account.id },
      data: {
        points: { increment: points },
        totalSpent: { increment: amount },
      },
    });
  }

  return NextResponse.json({
    ok: true,
    points: account.points,
    totalSpent: account.totalSpent,
    added: points,
  });
}
