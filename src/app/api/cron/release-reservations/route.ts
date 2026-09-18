import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/reservations";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, released: await releaseExpiredReservations() });
}
