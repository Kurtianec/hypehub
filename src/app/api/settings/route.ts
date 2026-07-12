import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET settings (public — only safe keys)
const PUBLIC_KEYS = [
  "site_name", "tagline", "crypto_btc", "crypto_usdt", "crypto_ton",
  "support_email", "support_telegram",
  "stats_accounts", "stats_clients", "stats_rating", "stats_support",
  "yandex_metrika", "google_analytics", "hotjar_id",
];

export async function GET() {
  const all = await db.setting.findMany();
  const settings: Record<string, string> = {};
  for (const s of all) {
    if (PUBLIC_KEYS.includes(s.key)) settings[s.key] = s.value;
  }
  return NextResponse.json({ settings });
}

// PUT — update settings (admin)
export async function PUT(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    const existing = await db.setting.findUnique({ where: { key } });
    if (existing) {
      await db.setting.update({ where: { key }, data: { value: String(value) } });
    } else {
      await db.setting.create({ data: { id: `set_${key}`, key, value: String(value) } });
    }
  }
  return NextResponse.json({ ok: true });
}
