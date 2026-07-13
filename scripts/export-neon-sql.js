// Export all data from local SQLite to a PostgreSQL-compatible SQL file
// Output: /home/z/my-project/download/neon-init.sql
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const db = new PrismaClient();

function sqlEscape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (val instanceof Date) return "'" + val.toISOString() + "'";
  // string — escape single quotes
  return "'" + String(val).replace(/'/g, "''") + "'";
}

async function main() {
  const outPath = "/home/z/my-project/download/neon-init.sql";
  const lines = [];

  lines.push("-- ============================================================");
  lines.push("-- HypeHub - Full database initialization for Neon PostgreSQL");
  lines.push("-- ============================================================");
  lines.push("");
  lines.push("-- Run this ENTIRE script in Neon SQL Editor:");
  lines.push("-- https://neon.tech -> your project -> SQL Editor -> paste -> Run");
  lines.push("");
  lines.push("-- Idempotent: safe to run multiple times (DROP + CREATE)");
  lines.push("");

  // === DROP existing tables ===
  lines.push("-- === Drop existing tables (if any) ===");
  const dropTables = [
    "AdminLog", "PromoCode", "Referral", "BlogPost", "Review",
    "Visitor", "UserAccount", "FaqItem", "SupportMessage",
    "Order", "Product", "Category", "Setting",
  ];
  for (const t of dropTables) {
    lines.push('DROP TABLE IF EXISTS "' + t + '" CASCADE;');
  }
  lines.push("");

  // === CREATE TABLE statements ===
  lines.push("-- === Create tables ===");
  lines.push("");

  // Category
  lines.push('CREATE TABLE "Category" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "name" TEXT NOT NULL,');
  lines.push('  "slug" TEXT NOT NULL,');
  lines.push('  "icon" TEXT NOT NULL,');
  lines.push('  "color" TEXT NOT NULL,');
  lines.push('  "platform" TEXT NOT NULL,');
  lines.push('  "description" TEXT,');
  lines.push('  "order" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");');
  lines.push("");

  // Product
  lines.push('CREATE TABLE "Product" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "categoryId" TEXT NOT NULL,');
  lines.push('  "title" TEXT NOT NULL,');
  lines.push('  "description" TEXT NOT NULL,');
  lines.push('  "price" DOUBLE PRECISION NOT NULL,');
  lines.push('  "oldPrice" DOUBLE PRECISION,');
  lines.push('  "currency" TEXT NOT NULL DEFAULT \'RUB\',');
  lines.push('  "image" TEXT,');
  lines.push('  "images" TEXT,');
  lines.push('  "badges" TEXT,');
  lines.push('  "followers" TEXT,');
  lines.push('  "metadata" TEXT,');
  lines.push('  "login" TEXT NOT NULL,');
  lines.push('  "password" TEXT NOT NULL,');
  lines.push('  "deliveryNote" TEXT,');
  lines.push('  "status" TEXT NOT NULL DEFAULT \'available\',');
  lines.push('  "featured" BOOLEAN NOT NULL DEFAULT false,');
  lines.push('  "views" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");');
  lines.push('ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE;');
  lines.push("");

  // Order
  lines.push('CREATE TABLE "Order" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "productId" TEXT NOT NULL,');
  lines.push('  "buyerEmail" TEXT NOT NULL,');
  lines.push('  "buyerContact" TEXT NOT NULL,');
  lines.push('  "paymentMethod" TEXT NOT NULL,');
  lines.push('  "paymentAddress" TEXT,');
  lines.push('  "amount" DOUBLE PRECISION NOT NULL,');
  lines.push('  "currency" TEXT NOT NULL DEFAULT \'RUB\',');
  lines.push('  "txnHash" TEXT,');
  lines.push('  "status" TEXT NOT NULL DEFAULT \'pending\',');
  lines.push('  "deliveryLogin" TEXT,');
  lines.push('  "deliveryPass" TEXT,');
  lines.push('  "deliveryNote" TEXT,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE INDEX "Order_productId_idx" ON "Order"("productId");');
  lines.push('ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE NO ACTION;');
  lines.push("");

  // SupportMessage
  lines.push('CREATE TABLE "SupportMessage" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "name" TEXT NOT NULL,');
  lines.push('  "contact" TEXT NOT NULL,');
  lines.push('  "message" TEXT NOT NULL,');
  lines.push('  "reply" TEXT,');
  lines.push('  "status" TEXT NOT NULL DEFAULT \'new\',');
  lines.push('  "sessionId" TEXT,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push("");

  // FaqItem
  lines.push('CREATE TABLE "FaqItem" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "question" TEXT NOT NULL,');
  lines.push('  "answer" TEXT NOT NULL,');
  lines.push('  "order" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push("");

  // Setting
  lines.push('CREATE TABLE "Setting" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "key" TEXT NOT NULL,');
  lines.push('  "value" TEXT NOT NULL,');
  lines.push('  CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");');
  lines.push("");

  // Visitor
  lines.push('CREATE TABLE "Visitor" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "ip" TEXT NOT NULL,');
  lines.push('  "userAgent" TEXT,');
  lines.push('  "referer" TEXT,');
  lines.push('  "path" TEXT NOT NULL,');
  lines.push('  "country" TEXT,');
  lines.push('  "city" TEXT,');
  lines.push('  "sessionId" TEXT,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push("");

  // Review
  lines.push('CREATE TABLE "Review" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "name" TEXT NOT NULL,');
  lines.push('  "rating" INTEGER NOT NULL,');
  lines.push('  "text" TEXT NOT NULL,');
  lines.push('  "product" TEXT,');
  lines.push('  "status" TEXT NOT NULL DEFAULT \'pending\',');
  lines.push('  "reply" TEXT,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push("");

  // BlogPost
  lines.push('CREATE TABLE "BlogPost" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "slug" TEXT NOT NULL,');
  lines.push('  "title" TEXT NOT NULL,');
  lines.push('  "excerpt" TEXT NOT NULL,');
  lines.push('  "content" TEXT NOT NULL,');
  lines.push('  "tags" TEXT,');
  lines.push('  "published" BOOLEAN NOT NULL DEFAULT false,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");');
  lines.push("");

  // Referral
  lines.push('CREATE TABLE "Referral" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "code" TEXT NOT NULL,');
  lines.push('  "email" TEXT,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "clicks" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "orders" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,');
  lines.push('  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");');
  lines.push("");

  // PromoCode
  lines.push('CREATE TABLE "PromoCode" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "code" TEXT NOT NULL,');
  lines.push('  "discount" DOUBLE PRECISION NOT NULL,');
  lines.push('  "maxUses" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "uses" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "active" BOOLEAN NOT NULL DEFAULT true,');
  lines.push('  "expiresAt" TIMESTAMP(3),');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");');
  lines.push("");

  // AdminLog
  lines.push('CREATE TABLE "AdminLog" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "action" TEXT NOT NULL,');
  lines.push('  "entity" TEXT NOT NULL,');
  lines.push('  "entityId" TEXT,');
  lines.push('  "details" TEXT,');
  lines.push('  "ip" TEXT,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push("");

  // UserAccount
  lines.push('CREATE TABLE "UserAccount" (');
  lines.push('  "id" TEXT NOT NULL,');
  lines.push('  "email" TEXT NOT NULL,');
  lines.push('  "points" INTEGER NOT NULL DEFAULT 0,');
  lines.push('  "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,');
  lines.push('  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  "updatedAt" TIMESTAMP(3) NOT NULL,');
  lines.push('  CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")');
  lines.push(');');
  lines.push('CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");');
  lines.push("");

  // === INSERT data ===
  lines.push("-- === Insert initial data ===");
  lines.push("");

  // Categories
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  lines.push("-- " + categories.length + " categories");
  for (const c of categories) {
    const vals = [c.id, c.name, c.slug, c.icon, c.color, c.platform, c.description, c.order, c.createdAt, c.updatedAt].map(sqlEscape).join(",");
    lines.push('INSERT INTO "Category" ("id","name","slug","icon","color","platform","description","order","createdAt","updatedAt") VALUES (' + vals + ");");
  }
  lines.push("");

  // Products
  const products = await db.product.findMany({ orderBy: { createdAt: "asc" } });
  lines.push("-- " + products.length + " products");
  for (const p of products) {
    const cols = '"id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt"';
    const vals = [p.id, p.categoryId, p.title, p.description, p.price, p.oldPrice, p.currency, p.image, p.images, p.badges, p.followers, p.metadata, p.login, p.password, p.deliveryNote, p.status, p.featured, p.views, p.createdAt, p.updatedAt].map(sqlEscape).join(",");
    lines.push('INSERT INTO "Product" (' + cols + ") VALUES (" + vals + ");");
  }
  lines.push("");

  // Orders
  const orders = await db.order.findMany();
  if (orders.length > 0) {
    lines.push("-- " + orders.length + " orders");
    for (const o of orders) {
      const cols = '"id","productId","buyerEmail","buyerContact","paymentMethod","paymentAddress","amount","currency","txnHash","status","deliveryLogin","deliveryPass","deliveryNote","createdAt","updatedAt"';
      const vals = [o.id, o.productId, o.buyerEmail, o.buyerContact, o.paymentMethod, o.paymentAddress, o.amount, o.currency, o.txnHash, o.status, o.deliveryLogin, o.deliveryPass, o.deliveryNote, o.createdAt, o.updatedAt].map(sqlEscape).join(",");
      lines.push('INSERT INTO "Order" (' + cols + ") VALUES (" + vals + ");");
    }
    lines.push("");
  }

  // Settings
  const settings = await db.setting.findMany();
  lines.push("-- " + settings.length + " settings");
  for (const s of settings) {
    const vals = [s.id, s.key, s.value].map(sqlEscape).join(",");
    lines.push('INSERT INTO "Setting" ("id","key","value") VALUES (' + vals + ");");
  }
  lines.push("");

  // FAQ
  const faqs = await db.faqItem.findMany({ orderBy: { order: "asc" } });
  if (faqs.length > 0) {
    lines.push("-- " + faqs.length + " FAQ items");
    for (const f of faqs) {
      const vals = [f.id, f.question, f.answer, f.order, f.createdAt, f.updatedAt].map(sqlEscape).join(",");
      lines.push('INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES (' + vals + ");");
    }
    lines.push("");
  }

  // Blog posts
  const posts = await db.blogPost.findMany();
  if (posts.length > 0) {
    lines.push("-- " + posts.length + " blog posts");
    for (const b of posts) {
      const vals = [b.id, b.slug, b.title, b.excerpt, b.content, b.tags, b.published, b.createdAt, b.updatedAt].map(sqlEscape).join(",");
      lines.push('INSERT INTO "BlogPost" ("id","slug","title","excerpt","content","tags","published","createdAt","updatedAt") VALUES (' + vals + ");");
    }
    lines.push("");
  }

  // Reviews
  const reviews = await db.review.findMany();
  if (reviews.length > 0) {
    lines.push("-- " + reviews.length + " reviews");
    for (const r of reviews) {
      const vals = [r.id, r.name, r.rating, r.text, r.product, r.status, r.reply, r.createdAt, r.updatedAt].map(sqlEscape).join(",");
      lines.push('INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES (' + vals + ");");
    }
    lines.push("");
  }

  // Referrals
  const refs = await db.referral.findMany();
  if (refs.length > 0) {
    lines.push("-- " + refs.length + " referrals");
    for (const r of refs) {
      const vals = [r.id, r.code, r.email, r.createdAt, r.clicks, r.orders, r.earnings].map(sqlEscape).join(",");
      lines.push('INSERT INTO "Referral" ("id","code","email","createdAt","clicks","orders","earnings") VALUES (' + vals + ");");
    }
    lines.push("");
  }

  // Support messages
  const msgs = await db.supportMessage.findMany();
  if (msgs.length > 0) {
    lines.push("-- " + msgs.length + " support messages");
    for (const m of msgs) {
      const vals = [m.id, m.name, m.contact, m.message, m.reply, m.status, m.sessionId, m.createdAt, m.updatedAt].map(sqlEscape).join(",");
      lines.push('INSERT INTO "SupportMessage" ("id","name","contact","message","reply","status","sessionId","createdAt","updatedAt") VALUES (' + vals + ");");
    }
    lines.push("");
  }

  lines.push("-- Visitors and AdminLog are runtime data - not imported");
  lines.push("");
  lines.push("-- === Done! ===");
  lines.push("-- Database fully initialized.");
  lines.push("");

  const sql = lines.join("\n");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sql, "utf8");

  const stats = fs.statSync(outPath);
  console.log("SQL file created: " + outPath);
  console.log("Size: " + (stats.size / 1024).toFixed(1) + " KB");
  console.log("Lines: " + lines.length);
  console.log("Categories: " + categories.length);
  console.log("Products: " + products.length);
  console.log("Settings: " + settings.length);
  console.log("FAQ: " + faqs.length);
  console.log("Blog: " + posts.length);
  console.log("Reviews: " + reviews.length);
  console.log("Orders: " + orders.length);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("Error:", e);
    db.$disconnect();
    process.exit(1);
  });
