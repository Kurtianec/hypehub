import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeRateLimit, requestIp, sha256 } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`customer-code:${ip}`, 5, 30 * 60_000)).allowed) return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  const parsed = z.object({ email: z.string().email().max(254) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const hasOrders = await db.order.count({ where: { buyerEmail: email } });
  if (!hasOrders) return NextResponse.json({ ok: true, emailConfigured: !!process.env.RESEND_API_KEY });
  const code = String(randomInt(100000, 999999));
  await db.customerAccessCode.create({ data: { email, codeHash: sha256(code), expiresAt: new Date(Date.now() + 10 * 60_000) } });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, emailConfigured: false });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM || "HypeHub <onboarding@resend.dev>", to: [email], subject: "Код входа в HypeHub", html: `<div style="font-family:Arial;background:#0a0a0a;color:#fff;padding:32px"><h2>Вход в HypeHub</h2><p>Ваш одноразовый код:</p><div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#8E1537">${code}</div><p style="color:#999">Код действует 10 минут. Никому его не сообщайте.</p></div>` }) });
  if (!response.ok) return NextResponse.json({ error: "Не удалось отправить письмо. Войдите по номеру заказа." }, { status: 502 });
  return NextResponse.json({ ok: true, emailConfigured: true });
}
