import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeRateLimit, createCustomerSession, CUSTOMER_SESSION_COOKIE, requestIp, sha256 } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`customer-verify:${ip}`, 8, 30 * 60_000)).allowed) return NextResponse.json({ error: "Слишком много попыток" }, { status: 429 });
  const parsed = z.object({ email: z.string().email(), code: z.string().trim().optional(), orderId: z.string().trim().optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success || (!parsed.data.code && !parsed.data.orderId)) return NextResponse.json({ error: "Введите код или номер заказа" }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  let valid = false;
  if (parsed.data.code) {
    const entry = await db.customerAccessCode.findFirst({ where: { email, codeHash: sha256(parsed.data.code), usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
    if (entry) { valid = true; await db.customerAccessCode.update({ where: { id: entry.id }, data: { usedAt: new Date() } }); }
  }
  if (!valid && parsed.data.orderId) valid = !!(await db.order.findFirst({ where: { id: parsed.data.orderId, buyerEmail: email } }));
  if (!valid) return NextResponse.json({ error: "Код или номер заказа не подходит" }, { status: 401 });
  const session = await createCustomerSession(email);
  const response = NextResponse.json({ ok: true, email });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: session.expiresAt });
  return response;
}
