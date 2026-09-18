import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "hypehub_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export function requestIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!stored.startsWith("scrypt:")) return timingSafeEqual(Buffer.from(sha256(password)), Buffer.from(sha256(stored)));
  const [, saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function encryptionKey() {
  const raw = process.env.DATA_ENCRYPTION_KEY || process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is required");
  return createHash("sha256").update(raw).digest();
}

function signingKey() {
  return process.env.HYPEHUB_SECURITY_KEY || process.env.DATA_ENCRYPTION_KEY || process.env.DATABASE_URL || "development-only-key";
}

export function createCaptchaChallenge() {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 9);
  const payload = Buffer.from(JSON.stringify({ answer: a + b, expires: Date.now() + 5 * 60_000 })).toString("base64url");
  const signature = createHmac("sha256", signingKey()).update(payload).digest("base64url");
  return { question: `${a} + ${b} = ?`, token: `${payload}.${signature}` };
}

export function verifyCaptchaChallenge(token: string, answer: string) {
  try {
    const [payload, signature] = token.split(".");
    const expected = createHmac("sha256", signingKey()).update(payload).digest("base64url");
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { answer: number; expires: number };
    return data.expires > Date.now() && String(data.answer) === answer.trim();
  } catch { return false; }
}

export function encryptSecret(value: string | null | undefined) {
  if (!value || value.startsWith("enc:v1:")) return value || "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `enc:v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string | null | undefined) {
  if (!value || !value.startsWith("enc:v1:")) return value || "";
  const [, , iv, tag, payload] = value.split(":");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(payload, "base64url")), decipher.final()]).toString("utf8");
}

export async function createAdminSession(req: NextRequest) {
  const token = randomBytes(32).toString("base64url");
  const csrf = randomBytes(24).toString("base64url");
  const session = await db.adminSession.create({ data: {
    tokenHash: sha256(token), csrfHash: sha256(csrf), ip: requestIp(req),
    userAgent: req.headers.get("user-agent"), expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  }});
  return { token, csrf, session };
}

export async function getAdminSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.adminSession.findUnique({ where: { tokenHash: sha256(token) } });
  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  await db.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  return session;
}

export async function requireAdmin(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const expected = new URL(req.url).origin;
    if (!origin || origin !== expected) return NextResponse.json({ error: "CSRF check failed" }, { status: 403 });
  }
  return null;
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number, blockMs = windowMs) {
  const now = new Date();
  return db.$transaction(async (tx) => {
    let row = await tx.rateLimitBucket.findUnique({ where: { id: key } });
    if (!row || now.getTime() - row.windowStart.getTime() >= windowMs) {
      row = await tx.rateLimitBucket.upsert({ where: { id: key }, create: { id: key, count: 1, windowStart: now }, update: { count: 1, windowStart: now, blockedUntil: null } });
      return { allowed: true, remaining: limit - 1 };
    }
    if (row.blockedUntil && row.blockedUntil > now) return { allowed: false, remaining: 0 };
    const count = row.count + 1;
    await tx.rateLimitBucket.update({ where: { id: key }, data: { count, blockedUntil: count > limit ? new Date(now.getTime() + blockMs) : null } });
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  });
}
