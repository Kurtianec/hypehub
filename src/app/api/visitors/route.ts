import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";
  const isPublic = searchParams.get("public") === "1";

  // Public mode: return ONLY counts (no IPs, no recent, no detailed data)
  if (isPublic) {
    const todayCount = await db.visitor.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    const totalCount = await db.visitor.count();
    return NextResponse.json({
      today: todayCount,
      total: totalCount,
    });
  }

  // Admin mode: full data
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let since = new Date(0);
  if (range === "24h") since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  else if (range === "7d") since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (range === "30d") since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, unique, recent, byCountryRaw, byCityRaw, byReferrerRaw, byPathRaw, todayCount] = await Promise.all([
    db.visitor.count({ where: { createdAt: { gte: since } } }),
    db.visitor.groupBy({
      by: ["ip"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
    db.visitor.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.visitor.groupBy({
      by: ["country"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { country: "desc" } },
    }),
    db.visitor.groupBy({
      by: ["city"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
    db.visitor.groupBy({
      by: ["referer"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { referer: "desc" } },
      take: 10,
    }),
    db.visitor.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    db.visitor.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const byCountry = byCountryRaw
    .filter((c) => c.country)
    .map((c) => ({ country: c.country!, count: c._count }))
    .slice(0, 10);
  const byCity = byCityRaw
    .filter((c) => c.city)
    .map((c) => ({ city: c.city!, count: c._count }))
    .slice(0, 10);
  const byReferrer = byReferrerRaw
    .map((r) => ({ referer: r.referer || "Прямой переход", count: r._count }))
    .slice(0, 10);
  const byPath = byPathRaw
    .map((p) => ({ path: p.path, count: p._count }))
    .slice(0, 10);

  // Hourly distribution for chart (last 24 hours)
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent24 = await db.visitor.findMany({
    where: { createdAt: { gte: last24h } },
    select: { createdAt: true },
  });
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    return {
      hour: hourStart.getHours(),
      count: recent24.filter((v) => v.createdAt >= hourStart && v.createdAt < hourEnd).length,
    };
  });

  return NextResponse.json({
    stats: {
      total,
      unique: unique.length,
      today: todayCount,
      range,
    },
    hourly,
    byCountry,
    byCity,
    byReferrer,
    byPath,
    recent: recent.map((v) => ({
      id: v.id,
      ip: v.ip,
      userAgent: v.userAgent,
      referer: v.referer,
      path: v.path,
      country: v.country,
      city: v.city,
      createdAt: v.createdAt,
    })),
  });
}
