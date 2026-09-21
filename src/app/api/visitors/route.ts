import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decodeVisitorInfo } from "@/lib/visitor-device";


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
  const denied = await requireAdmin(req);
  if (denied) return denied;

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

  const detailedRecent = recent.map((v) => ({ ...v, client: decodeVisitorInfo(v.userAgent) }));
  const aggregate = (key: "device" | "os" | "browser") => {
    const counts = new Map<string, number>();
    for (const visitor of detailedRecent) {
      const label = visitor.client[key] || "Неизвестно";
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };

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
    byDevice: aggregate("device"),
    byOS: aggregate("os"),
    byBrowser: aggregate("browser"),
    recent: detailedRecent.map((v) => ({
      id: v.id,
      ip: v.ip,
      userAgent: v.client.ua,
      device: v.client.device,
      os: v.client.os,
      browser: v.client.browser,
      language: v.client.language,
      timezone: v.client.timezone,
      screen: v.client.screen,
      touch: v.client.touch,
      connection: v.client.connection,
      referer: v.referer,
      path: v.path,
      country: v.country,
      city: v.city,
      createdAt: v.createdAt,
    })),
  });
}
