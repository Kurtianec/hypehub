import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  return NextResponse.json({ backups: await db.backupSnapshot.findMany({ select: { id: true, name: true, counts: true, createdBy: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 }) });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const [categories, products, orders, events, claims, settings, faqs, posts, support, reviews, accounts] = await Promise.all([db.category.findMany(), db.product.findMany(), db.order.findMany(), db.orderEvent.findMany(), db.warrantyClaim.findMany(), db.setting.findMany(), db.faqItem.findMany(), db.blogPost.findMany(), db.supportMessage.findMany(), db.review.findMany(), db.userAccount.findMany()]);
  const data = JSON.stringify({ version: 2, createdAt: new Date(), categories, products, orders, events, claims, settings, faqs, posts, support, reviews, accounts });
  const counts = JSON.stringify({ categories: categories.length, products: products.length, orders: orders.length, events: events.length, claims: claims.length, settings: settings.length, faqs: faqs.length, posts: posts.length, support: support.length, reviews: reviews.length, accounts: accounts.length });
  const backup = await db.$transaction(async (tx) => {
    const created = await tx.backupSnapshot.create({ data: { name: `Автокопия ${new Date().toLocaleString("ru-RU")}`, data, counts } });
    await tx.backupSnapshot.deleteMany({ where: { id: { not: created.id } } });
    return created;
  });
  await db.adminLog.create({ data: { action: "backup_created", entity: "backup", entityId: backup.id, details: counts } });
  return NextResponse.json({ ok: true, backup: { id: backup.id, name: backup.name, counts: backup.counts, createdAt: backup.createdAt } });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req); if (denied) return denied;
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid backup" }, { status: 400 });
  const backup = await db.backupSnapshot.findUnique({ where: { id: parsed.data.id } });
  if (!backup) return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  const snap = JSON.parse(backup.data);
  await db.$transaction(async (tx) => {
    for (const c of snap.categories || []) await tx.category.upsert({ where: { id: c.id }, create: c, update: c });
    for (const p of snap.products || []) { const { category, orders, ...data } = p; void category; void orders; await tx.product.upsert({ where: { id: data.id }, create: data, update: data }); }
    for (const o of snap.orders || []) { const { product, events, ...data } = o; void product; void events; await tx.order.upsert({ where: { id: data.id }, create: data, update: data }); }
    for (const e of snap.events || []) await tx.orderEvent.upsert({ where: { id: e.id }, create: e, update: e });
    for (const c of snap.claims || []) await tx.warrantyClaim.upsert({ where: { id: c.id }, create: c, update: c });
    for (const s of snap.settings || []) await tx.setting.upsert({ where: { key: s.key }, create: s, update: { value: s.value } });
  });
  await db.adminLog.create({ data: { action: "backup_restored", entity: "backup", entityId: backup.id, details: backup.counts } });
  return NextResponse.json({ ok: true });
}
