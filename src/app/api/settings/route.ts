import { hashPassword, requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET settings (public — only safe keys)
const PUBLIC_KEYS = [
  "site_name", "tagline", "crypto_btc", "crypto_usdt", "crypto_ton",
  "support_email", "support_telegram",
  "operator_online",
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
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (key === "admin_pass" && !String(value).trim()) continue;
    const safeValue = key === "admin_pass" ? hashPassword(String(value)) : String(value);
    const existing = await db.setting.findUnique({ where: { key } });
    if (existing) {
      await db.setting.update({ where: { key }, data: { value: safeValue } });
    } else {
      await db.setting.create({ data: { id: `set_${key}`, key, value: safeValue } });
    }
  }
  const changedWallets = Object.keys(body).filter((key) => key.startsWith("crypto_") || key === "support_email" || key === "support_telegram");
  if (changedWallets.length) await db.adminLog.create({ data: { action: "payment_settings_changed", entity: "settings", details: JSON.stringify({ fields: changedWallets }) } });
  return NextResponse.json({ ok: true });
}
