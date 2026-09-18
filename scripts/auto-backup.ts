import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const [categories, products, orders, events, claims, settings, faqs, posts, support, reviews, accounts] = await Promise.all([db.category.findMany(), db.product.findMany(), db.order.findMany(), db.orderEvent.findMany(), db.warrantyClaim.findMany(), db.setting.findMany(), db.faqItem.findMany(), db.blogPost.findMany(), db.supportMessage.findMany(), db.review.findMany(), db.userAccount.findMany()]);
  const counts = { categories: categories.length, products: products.length, orders: orders.length, events: events.length, claims: claims.length, settings: settings.length, faqs: faqs.length, posts: posts.length, support: support.length, reviews: reviews.length, accounts: accounts.length };
  await db.backupSnapshot.create({ data: { name: `Перед публикацией ${new Date().toISOString()}`, counts: JSON.stringify(counts), data: JSON.stringify({ version: 2, createdAt: new Date(), categories, products, orders, events, claims, settings, faqs, posts, support, reviews, accounts }), createdBy: "Vercel" } });
  const old = await db.backupSnapshot.findMany({ orderBy: { createdAt: "desc" }, skip: 10, select: { id: true } });
  if (old.length) await db.backupSnapshot.deleteMany({ where: { id: { in: old.map((x) => x.id) } } });
}
main().finally(() => db.$disconnect());
