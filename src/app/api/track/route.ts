import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/track — log visitor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";

    // Get IP from various headers (proxies, Cloudflare, etc.)
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnecting = req.headers.get("cf-connecting-ip");
    const ip =
      (cfConnecting?.split(",")[0]?.trim()) ||
      (forwarded?.split(",")[0]?.trim()) ||
      (realIp?.trim()) ||
      "0.0.0.0";

    const userAgent = req.headers.get("user-agent") || null;
    const referer = req.headers.get("referer") || body.referrer || null;
    const sessionId = body.sessionId || null;

    // Best-effort geo lookup (free, no key, but skip for private IPs)
    let country: string | null = null;
    let city: string | null = null;
    const isPrivateIp = ip === "0.0.0.0" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.");

    if (!isPrivateIp && ip !== "0.0.0.0") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status&lang=ru`, {
          signal: AbortSignal.timeout(2500),
        });
        const geo = await geoRes.json();
        if (geo.status === "success") {
          country = geo.country || null;
          city = geo.city || null;
        }
      } catch {
        // ignore — geo is best-effort
      }
    }

    await db.visitor.create({
      data: {
        ip,
        userAgent,
        referer,
        path,
        country,
        city,
        sessionId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Track error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
