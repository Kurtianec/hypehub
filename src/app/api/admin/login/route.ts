import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeRateLimit, createAdminSession, hashPassword, requestIp, SESSION_COOKIE, verifyCaptchaChallenge, verifyPassword } from "@/lib/security";
import { z } from "zod";

const schema = z.object({ password: z.string().min(8).max(256), captchaToken: z.string().min(20), captchaAnswer: z.string().min(1).max(4) });

export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  const rate = await consumeRateLimit(`admin-login:${ip}`, 5, 15 * 60_000, 30 * 60_000);
  if (!rate.allowed) return NextResponse.json({ error: "Слишком много попыток. Повторите позже." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !verifyCaptchaChallenge(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
    return NextResponse.json({ error: "Проверка CAPTCHA не пройдена" }, { status: 400 });
  }
  const setting = await db.setting.findUnique({ where: { key: "admin_pass" } });
  const configured = setting?.value || process.env.ADMIN_PASSWORD_HASH || "";
  if (!configured || !verifyPassword(parsed.data.password, configured)) {
    await db.adminLog.create({ data: { action: "login_failed", entity: "session", details: JSON.stringify({ ip }), ip } });
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  if (!configured.startsWith("scrypt:")) {
    await db.setting.upsert({ where: { key: "admin_pass" }, create: { id: "set_admin_pass", key: "admin_pass", value: hashPassword(parsed.data.password) }, update: { value: hashPassword(parsed.data.password) } });
  }
  const { token, session } = await createAdminSession(req);
  await db.adminLog.create({ data: { action: "login", entity: "session", entityId: session.id, ip } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
  return res;
}
