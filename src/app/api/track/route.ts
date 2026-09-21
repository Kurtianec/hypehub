import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildVisitorInfo } from "@/lib/visitor-device";
import { consumeRateLimit, requestIp } from "@/lib/security";

// POST /api/track — log visitor
export async function POST(req: NextRequest) {
  try {
    const ip = requestIp(req);
    if (!(await consumeRateLimit(`visitor-track:${ip}`, 60, 10 * 60_000)).allowed) {
      return NextResponse.json({ ok: true, limited: true });
    }
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "/";

    // Get IP from various headers (proxies, Cloudflare, etc.)
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnecting = req.headers.get("cf-connecting-ip");
    const detectedIp =
      (cfConnecting?.split(",")[0]?.trim()) ||
      (forwarded?.split(",")[0]?.trim()) ||
      (realIp?.trim()) ||
      "0.0.0.0";

    const rawUserAgent = req.headers.get("user-agent") || "";
    const userAgent = JSON.stringify(buildVisitorInfo(rawUserAgent, body.client || {}));
    const refererValue = req.headers.get("referer") || (typeof body.referrer === "string" ? body.referrer : "");
    const referer = refererValue ? refererValue.slice(0, 1000) : null;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 128) : null;

    // Best-effort geo lookup (free, no key, but skip for private IPs)
    let country: string | null = null;
    let city: string | null = null;
    const isPrivateIp = detectedIp === "0.0.0.0" || detectedIp.startsWith("127.") || detectedIp.startsWith("192.168.") || detectedIp.startsWith("10.") || detectedIp.startsWith("172.16.");

    if (!isPrivateIp && detectedIp !== "0.0.0.0") {
      try {
        const geoRes = await fetch(`https://ipwho.is/${encodeURIComponent(detectedIp)}?fields=success,country,city`, {
          signal: AbortSignal.timeout(2500),
        });
        const geo = await geoRes.json();
        if (geo.success === true) {
          country = geo.country || null;
          city = geo.city || null;
        }
      } catch {
        // ignore — geo is best-effort
      }
    }

    await db.visitor.create({
      data: {
        ip: detectedIp,
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
