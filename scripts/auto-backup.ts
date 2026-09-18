import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const [categories, products, orders, settings, faqs, posts] = await Promise.all([db.category.findMany(), db.product.findMany(), db.order.findMany(), db.setting.findMany(), db.faqItem.findMany(), db.blogPost.findMany()]);
  const counts = { categories: categories.length, products: products.length, orders: orders.length, settings: settings.length, faqs: faqs.length, posts: posts.length };
  await db.backupSnapshot.create({ data: { name: `Перед публикацией ${new Date().toISOString()}`, counts: JSON.stringify(counts), data: JSON.stringify({ version: 1, createdAt: new Date(), categories, products, orders, settings, faqs, posts }), createdBy: "Vercel" } });
  const old = await db.backupSnapshot.findMany({ orderBy: { createdAt: "desc" }, skip: 10, select: { id: true } });
  if (old.length) await db.backupSnapshot.deleteMany({ where: { id: { in: old.map((x) => x.id) } } });
}
main().finally(() => db.$disconnect());
