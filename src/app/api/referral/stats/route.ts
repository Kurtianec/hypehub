import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// GET /api/referral/stats — referral statistics for admin
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const referrals = await db.referral.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalClicks = referrals.reduce((s, r) => s + r.clicks, 0);
  const totalOrders = referrals.reduce((s, r) => s + r.orders, 0);
  const totalEarnings = referrals.reduce((s, r) => s + r.earnings, 0);

  // Daily clicks for chart (last 14 days)
  const last14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentRefs = await db.referral.findMany({
    where: { createdAt: { gte: last14d } },
    select: { clicks: true, createdAt: true },
  });

  const daily = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return {
      date: dayStart.toISOString().split("T")[0],
      clicks: recentRefs
        .filter((r) => r.createdAt >= dayStart && r.createdAt < dayEnd)
        .reduce((s, r) => s + r.clicks, 0),
    };
  });

  return NextResponse.json({
    totalReferrals: referrals.length,
    totalClicks,
    totalOrders,
    totalEarnings,
    topReferrers: referrals.slice(0, 10).map((r) => ({
      code: r.code,
      email: r.email || "—",
      clicks: r.clicks,
      orders: r.orders,
      earnings: r.earnings,
      createdAt: r.createdAt,
    })),
    daily,
  });
}
