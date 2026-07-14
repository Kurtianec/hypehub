-- ============================================================
-- HypeHub - Full database initialization for Neon PostgreSQL
-- ============================================================

-- Run this ENTIRE script in Neon SQL Editor:
-- https://neon.tech -> your project -> SQL Editor -> paste -> Run

-- Idempotent: safe to run multiple times (DROP + CREATE)

-- === Drop existing tables (if any) ===
DROP TABLE IF EXISTS "AdminLog" CASCADE;
DROP TABLE IF EXISTS "PromoCode" CASCADE;
DROP TABLE IF EXISTS "Referral" CASCADE;
DROP TABLE IF EXISTS "BlogPost" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Visitor" CASCADE;
DROP TABLE IF EXISTS "UserAccount" CASCADE;
DROP TABLE IF EXISTS "FaqItem" CASCADE;
DROP TABLE IF EXISTS "SupportMessage" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Setting" CASCADE;

-- === Create tables ===

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "oldPrice" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "image" TEXT,
  "images" TEXT,
  "badges" TEXT,
  "followers" TEXT,
  "metadata" TEXT,
  "login" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "deliveryNote" TEXT,
  "status" TEXT NOT NULL DEFAULT 'available',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE;

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "buyerEmail" TEXT NOT NULL,
  "buyerContact" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentAddress" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "txnHash" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "deliveryLogin" TEXT,
  "deliveryPass" TEXT,
  "deliveryNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Order_productId_idx" ON "Order"("productId");
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE NO ACTION;

CREATE TABLE "SupportMessage" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "reply" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "sessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FaqItem" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Setting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

CREATE TABLE "Visitor" (
  "id" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "userAgent" TEXT,
  "referer" TEXT,
  "path" TEXT NOT NULL,
  "country" TEXT,
  "city" TEXT,
  "sessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "product" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reply" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

CREATE TABLE "Referral" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "orders" INTEGER NOT NULL DEFAULT 0,
  "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL,
  "maxUses" INTEGER NOT NULL DEFAULT 0,
  "uses" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

CREATE TABLE "AdminLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAccount" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- === Insert initial data ===

-- 5 categories
INSERT INTO "Category" ("id","name","slug","icon","color","platform","description","order","createdAt","updatedAt") VALUES ('cat_tiktok','TikTok аккаунты','tiktok','Music2','#FF0050','tiktok','Готовые TikTok аккаунты с подписчиками, для стрима и продвижения',1,'2026-07-14T13:01:19.752Z','2026-07-14T13:02:11.508Z');
INSERT INTO "Category" ("id","name","slug","icon","color","platform","description","order","createdAt","updatedAt") VALUES ('cat_youtube','YouTube каналы','youtube','Youtube','#FF0000','youtube','Монетизированные YouTube каналы и каналы с подписчиками',2,'2026-07-14T13:01:19.757Z','2026-07-14T13:02:11.513Z');
INSERT INTO "Category" ("id","name","slug","icon","color","platform","description","order","createdAt","updatedAt") VALUES ('cat_vk','VK группы','vk','Users','#0077FF','vk','Живые VK группы и паблики с реальной аудиторией',3,'2026-07-14T13:01:19.758Z','2026-07-14T13:02:11.515Z');
INSERT INTO "Category" ("id","name","slug","icon","color","platform","description","order","createdAt","updatedAt") VALUES ('cat_instagram','Instagram аккаунты','instagram','Instagram','#E1306C','instagram','Instagram аккаунты с активной аудиторией',4,'2026-07-14T13:01:19.759Z','2026-07-14T13:02:11.516Z');
INSERT INTO "Category" ("id","name","slug","icon","color","platform","description","order","createdAt","updatedAt") VALUES ('cat_telegram','Telegram каналы','telegram','Send','#229ED9','telegram','Telegram каналы и группы с живыми подписчиками',5,'2026-07-14T13:01:19.760Z','2026-07-14T13:02:11.517Z');

-- 13 products
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_tt_1','cat_tiktok','TikTok аккаунт 10K подписчиков','Активный TikTok аккаунт с живой аудиторией. Подходит для стримов и продвижения. Полный доступ к почте и номеру. Возраст 6+ месяцев.',1490,2490,'RUB','https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&q=80',NULL,'hot,verified','10K подписчиков','{"country":"RU","age":"6 мес","monetization":false,"verified":true}','tiktok_user_10k_001@mail.com','TT@10k#Pass2024','Доступ к почте и телефону прилагается. Меняйте пароль сразу после получения.','available',TRUE,0,'2026-07-14T13:01:19.763Z','2026-07-14T13:02:11.519Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_tt_2','cat_tiktok','TikTok аккаунт 50K подписчиков','Топовый TikTok аккаунт с аудиторией 50K. Подходит для монетизации Creator Fund. Полная гарантия и замена в течение 24 часов.',6990,9990,'RUB','https://images.unsplash.com/photo-1658401218713-4c5c0b0c8e74?w=600&q=80',NULL,'top,premium','50K подписчиков','{"country":"RU/CIS","age":"12 мес","monetization":true,"verified":false}','tiktok_pro_50k@mail.com','TT@50k#Pro2024!','Полный доступ. Подключена монетизация. Поддержка 24/7.','available',TRUE,0,'2026-07-14T13:01:19.765Z','2026-07-14T13:02:11.523Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_tt_3','cat_tiktok','TikTok аккаунт 100K подписчиков','Премиум TikTok аккаунт с аудиторией 100K. Высокое вовлечение, проверенная история, готов к коммерческому использованию.',14990,19990,'RUB','https://images.unsplash.com/photo-1620712943543-bcc4688e7480?w=600&q=80',NULL,'premium,verified,top','100K подписчиков','{"country":"RU","age":"18 мес","monetization":true,"verified":true}','tiktok_premium_100k@mail.com','TT@100k#Premium!','VIP-поддержка, помощь с переоформлением. Гарантия 7 дней.','available',TRUE,0,'2026-07-14T13:01:19.767Z','2026-07-14T13:02:11.525Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_yt_1','cat_youtube','YouTube канал 1000 подписчиков','YouTube канал с 1000 подписчиков — готов к монетизации. Подходит для запуска нового проекта с уже готовой аудиторией.',2490,3490,'RUB','https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',NULL,'hot','1000 подписчиков','{"country":"RU","age":"8 мес","monetization":false,"watchHours":4000}','youtube_1k@mail.com','YT@1k#Channel2024','Канал без страйков. Полный доступ к Google аккаунту.','available',TRUE,0,'2026-07-14T13:01:19.769Z','2026-07-14T13:02:11.526Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_yt_2','cat_youtube','YouTube канал 10K подписчиков','Монетизированный YouTube канал с 10K подписчиков. Подключена партнёрская программа. Регулярные просмотры от 5K на видео.',8990,12990,'RUB','https://images.unsplash.com/photo-1635262550437-cb84b16d6909?w=600&q=80',NULL,'verified,premium','10K подписчиков','{"country":"RU","age":"2 года","monetization":true,"watchHours":240000}','youtube_10k_monetized@mail.com','YT@10k#Money2024!','Монетизация активна. Без страйков. Помощь с передачей AdSense.','available',TRUE,0,'2026-07-14T13:01:19.770Z','2026-07-14T13:02:11.528Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_yt_3','cat_youtube','YouTube канал 100K подписчиков','Премиум YouTube канал с аудиторией 100K. Высокий Watch Time, стабильный доход от монетизации. Полная передача с гарантией.',49990,69990,'RUB','https://images.unsplash.com/photo-1649296405441-a55bfce87ff2?w=600&q=80',NULL,'premium,verified,top','100K подписчиков','{"country":"RU","age":"3 года","monetization":true,"watchHours":1200000}','youtube_premium_100k@mail.com','YT@100k#VIP2024!','VIP-передача. Помощь с переоформлением AdSense. Гарантия 14 дней.','available',TRUE,0,'2026-07-14T13:01:19.771Z','2026-07-14T13:02:11.531Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_vk_1','cat_vk','VK группа 1000 участников','Живая VK группа с реальными участниками. Подходит для продвижения товаров и услуг. Активность высокая.',990,1490,'RUB','https://images.unsplash.com/photo-1611162616305-c69b3037c7bb?w=600&q=80',NULL,'hot','1000 участников','{"country":"RU","age":"6 мес","monetization":false}','vk_group_1k@mail.com','VK@1k#Group2024','Полный доступ к создателю группы. Возможна замена в течение 24ч.','available',TRUE,0,'2026-07-14T13:01:19.773Z','2026-07-14T13:02:11.533Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_vk_2','cat_vk','VK группа 10K участников','Активная VK группа с 10K участников. Регулярные посты, живая аудитория, готова к монетизации через маркет.',4990,6990,'RUB','https://images.unsplash.com/photo-1633675254053-d96c7668c3b8?w=600&q=80',NULL,'verified,top','10K участников','{"country":"RU","age":"1.5 года","monetization":true}','vk_group_10k@mail.com','VK@10k#Active2024!','Подключена монетизация. Полные права создателя.','available',TRUE,0,'2026-07-14T13:01:19.774Z','2026-07-14T13:02:11.535Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_vk_3','cat_vk','VK паблик 100K участников','Топовый VK паблик с аудиторией 100K. Высокий охват, стабильный трафик. Подходит для серьёзных проектов.',24990,34990,'RUB','https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&q=80',NULL,'premium,verified,top','100K участников','{"country":"RU","age":"3 года","monetization":true}','vk_public_100k@mail.com','VK@100k#Top2024!','VIP-передача. Полные права. Гарантия 14 дней.','available',TRUE,0,'2026-07-14T13:01:19.775Z','2026-07-14T13:02:11.536Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_ig_1','cat_instagram','Instagram аккаунт 5K подписчиков','Активный Instagram аккаунт с живой аудиторией 5K. Подходит для личного бренда или бизнеса.',1990,2990,'RUB','https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&q=80',NULL,'hot','5K подписчиков','{"country":"RU","age":"8 мес","monetization":false}','instagram_5k@mail.com','IG@5k#Acc2024','Полный доступ. Email и телефон привязаны.','available',FALSE,0,'2026-07-14T13:01:19.777Z','2026-07-14T13:02:11.538Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_ig_2','cat_instagram','Instagram аккаунт 50K подписчиков','Премиум Instagram аккаунт с аудиторией 50K. Высокое вовлечение, готов к сотрудничеству с брендами.',12990,16990,'RUB','https://images.unsplash.com/photo-1620506707887-6b1f8b8e8e9e?w=600&q=80',NULL,'premium,verified','50K подписчиков','{"country":"RU/CIS","age":"2 года","monetization":true}','instagram_50k_premium@mail.com','IG@50k#Premium!','VIP-передача. Гарантия 7 дней.','available',TRUE,0,'2026-07-14T13:01:19.778Z','2026-07-14T13:02:11.539Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_tg_1','cat_telegram','Telegram канал 1000 подписчиков','Живой Telegram канал с реальными подписчиками. Подходит для запуска медиа-проекта.',1490,1990,'RUB','https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80',NULL,'hot','1000 подписчиков','{"country":"RU","age":"5 мес","monetization":false}','telegram_1k_channel','TG@1k#Channel2024','Полные права администратора. Доступ к @channel.','available',FALSE,0,'2026-07-14T13:01:19.780Z','2026-07-14T13:02:11.541Z');
INSERT INTO "Product" ("id","categoryId","title","description","price","oldPrice","currency","image","images","badges","followers","metadata","login","password","deliveryNote","status","featured","views","createdAt","updatedAt") VALUES ('prod_tg_2','cat_telegram','Telegram канал 10K подписчиков','Активный Telegram канал с живой аудиторией. Стабильный охват постов, готов к монетизации через рекламу.',7990,9990,'RUB','https://images.unsplash.com/photo-1633675255779-4c2c7c8e8e8e?w=600&q=80',NULL,'verified,top','10K подписчиков','{"country":"RU","age":"1 год","monetization":true}','telegram_10k_channel','TG@10k#Active!','Подключена монетизация. Полная передача.','available',TRUE,0,'2026-07-14T13:01:19.781Z','2026-07-14T13:02:11.542Z');

-- 12 settings
INSERT INTO "Setting" ("id","key","value") VALUES ('set_site_name','site_name','ХайпХаб');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_tagline','tagline','Маркетплейс аккаунтов TikTok, YouTube и VK');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_crypto_btc','crypto_btc','bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_crypto_usdt','crypto_usdt','TXkNQ6MeYF3G7kC7p2eQ8fY2rZyW5kJ9hN');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_crypto_ton','crypto_ton','EQDrjaLahLkMB-hMCmkzOyBuHJ139QHbPPHu2qWQ4g2v5k2H');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_admin_pass','admin_pass','hypehub2024');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_email','support_email','support@hypehub.vercel.app');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_telegram','support_telegram','@hypehub_support');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_stats_accounts','stats_accounts','5 200+');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_stats_clients','stats_clients','12 800+');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_stats_rating','stats_rating','4.9');
INSERT INTO "Setting" ("id","key","value") VALUES ('set_stats_support','stats_support','24/7');

-- 7 FAQ items
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_1','Как купить аккаунт на ХайпХаб?','Выберите подходящий аккаунт в каталоге, нажмите «Купить», укажите контакт и выберите криптовалюту для оплаты (BTC, USDT, TON). После подтверждения оплаты вы мгновенно получите файл с логином и паролем на почту и в личном кабинете.',1,'2026-07-14T13:01:19.783Z','2026-07-14T13:02:11.543Z');
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_2','Какие способы оплаты доступны?','Мы принимаем оплату криптовалютой: BTC, USDT TRC-20, TON. Все способы — анонимны, без проверки личности. Крипто-платежи проходят за 1–15 минут в зависимости от монеты (TON — самый быстрый, BTC — самый надёжный).',2,'2026-07-14T13:01:19.783Z','2026-07-14T13:02:11.544Z');
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_3','Даёте ли вы гарантию на аккаунты?','Да. На все аккаунты действует гарантия от 24 часов до 14 дней в зависимости от категории. Если в течение гарантийного срока возникнут проблемы с доступом — мы заменим аккаунт или вернём средства.',3,'2026-07-14T13:01:19.784Z','2026-07-14T13:02:11.546Z');
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_4','Как быстро я получу данные после оплаты?','Мгновенно. Сразу после подтверждения оплаты вы получаете файл .txt с логином, паролем и инструкцией по безопасному входу. Файл доступен в личном кабинете и дублируется на email.',4,'2026-07-14T13:01:19.785Z','2026-07-14T13:02:11.546Z');
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_5','Это законно — покупать аккаунты?','Покупка и продажа аккаунтов не запрещена законом РФ. Мы рекомендуем сразу сменить пароль, привязать свои контакты и включить двухфакторную аутентификацию для безопасности.',5,'2026-07-14T13:01:19.785Z','2026-07-14T13:02:11.547Z');
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_6','Что если аккаунт не подойдёт?','Если аккаунт не соответствует описанию или появились проблемы с доступом в течение гарантийного срока — напишите в чат поддержки. Мы заменим аккаунт или оформим возврат в течение 24 часов.',6,'2026-07-14T13:01:19.786Z','2026-07-14T13:02:11.548Z');
INSERT INTO "FaqItem" ("id","question","answer","order","createdAt","updatedAt") VALUES ('faq_7','Могу ли я получить помощь с настройкой?','Да, наш AI-ассистент на сайте поможет с любым вопросом 24/7. Для сложных случаев работает живой чат техподдержки — пишите, поможем с входом, настройкой безопасности и монетизацией.',7,'2026-07-14T13:01:19.787Z','2026-07-14T13:02:11.549Z');

-- 5 blog posts
INSERT INTO "BlogPost" ("id","slug","title","excerpt","content","tags","published","createdAt","updatedAt") VALUES ('post_1','kak-kupit-akkaunt-tiktok-bezopasno','Как купить аккаунт TikTok безопасно в 2024 году: полное руководство','Подробная инструкция по безопасной покупке TikTok аккаунта: проверка продавца, способы оплаты, защита после покупки, частые ошибки новичков.','# Как купить аккаунт TikTok безопасно

Покупка готового TikTok аккаунта с подписчиками — отличный способ быстро запустить свой проект, бренд или канал. Но важно сделать это безопасно и у проверенного продавца. В этом руководстве разберём все этапы.

## Почему люди покупают TikTok аккаунты

- **Экономия времени**: не нужно месяцами накручивать подписчиков
- **Готовая аудитория**: сразу есть охваты и просмотры
- **Монетизация**: аккаунты с 10K+ уже могут зарабатывать через Creator Fund
- **Реклама**: можно продавать рекламу брендов
- **Стримы**: TikTok Live доступен с 1000+ подписчиков

## Как выбрать аккаунт

При выборе обращайте внимание на:

1. **Количество подписчиков** — от 1K до 100K+ в зависимости от бюджета и целей
2. **Активность** — лайки и комментарии должны быть, это признак живой аудитории
3. **Возраст аккаунта** — старше 3 месяцев, меньше шансов на блок
4. **Страна аудитории** — для российского рынка выбирайте RU/CIS
5. **Монетизация** — если подключена, это плюс к стоимости

## Способы оплаты

На ХайпХаб доступны два способа:

### Криптовалюта (BTC, USDT TRC-20, TON)
- Полная анонимность
- Без проверки личности
- Международные платежи
- Время зачисления: 5–15 минут

## Безопасность после покупки

Сразу после получения аккаунта:

1. **Смените пароль** — используйте сложный пароль из 12+ символов
2. **Привяжите свой email и телефон** — удалите старые контакты
3. **Включите двухфакторную аутентификацию** (2FA) — обязательная мера
4. **Не меняйте сразу слишком много** — username, аватарку меняйте постепенно
5. **Первые 2-3 дня не постите** — дайте аккаунту "остыть" после смены владельца

## Частые ошибки

- **Слишком резкие изменения** — TikTok может заподозрить взлом
- **Игнорирование 2FA** — без неё аккаунт легко угнать
- **Покупка у непроверенных продавцов** — риск скама
- **Отсутствие гарантии** — всегда выбирайте продавцов с гарантией

## Заключение

Покупка TikTok аккаунта — это инвестиция, которая окупается при правильном подходе. Выбирайте проверенные маркетплейсы с гарантией, оплачивайте криптой для анонимности, и сразу после получения настраивайте безопасность. Удачи!','tiktok,покупка аккаунта,безопасность,руководство',TRUE,'2026-07-14T13:01:19.990Z','2026-07-14T13:01:19.990Z');
INSERT INTO "BlogPost" ("id","slug","title","excerpt","content","tags","published","createdAt","updatedAt") VALUES ('post_2','monetizaciya-youtube-kanala-posle-pokupki','Монетизация YouTube канала после покупки: как начать зарабатывать','Как monetize купленный YouTube канал: переоформление AdSense, подключение партнёрки, виды дохода, частые проблемы и их решение.','# Монетизация YouTube канала после покупки

Купили YouTube канал с подписчиками? Отлично! Теперь нужно правильно его monetize. Разберём всё по шагам.

## Пороги монетизации YouTube

Для подключения партнёрской программы YouTube (YPP) нужно:
- **1 000 подписчиков**
- **4 000 часов просмотра за последние 12 месяцев**
- **Соблюдение правил сообщества** (без страйков)

Если вы купили канал с 10K+ подписчиков, первый пункт уже выполнен. Главное — проверить часы просмотра.

## Переоформление AdSense

После покупки канала нужно привязать свой AdSense-аккаунт:

1. **Создайте Google-аккаунт** (если ещё нет) с реальными данными
2. **Зарегистрируйтесь в AdSense** — ads.google.com
3. **Привяжите AdSense к YouTube** — в Творческой студии → Монетизация
4. **Подтвердите адрес** — Google пришлёт PIN-код по почте
5. **Заполните налоговую информацию** — обязательно для выплат

Важно: AdSense должен быть на ваше имя, иначе выплаты не пройдут.

## Виды дохода на YouTube

### 1. Реклама (AdSense)
Основной источник дохода. Доход зависит от:
- Региона аудитории (США — высокий CPM, СНГ — ниже)
- Тематики (финансы, технологии — дороже)
- Длины видео (видео 8+ минут — больше рекламы)

### 2. Спонсорства
Бренды платят за интеграции в видео. Стоимость зависит от охватов:
- 10K подписчиков: 5 000–20 000₽ за интеграцию
- 100K подписчиков: 50 000–200 000₽

### 3. Партнёрские ссылки
Рекламируйте товары и получайте процент с продаж:
- Aliexpress
- Яндекс.Маркет
- Admitad

### 4. Донаты и подписки
- Boosty — российская альтернатива Patreon
- YouTube Membership — платные подписки

### 5. продажа своих товаров
Мерч, цифровые продукты, курсы.

## Частые проблемы

### Страйки после покупки
Если у канала были страйки — монетизацию не одобрят. Проверяйте перед покупкой.

### Резкое падение охватов
Нормально при смене владельца. Восстанавливается за 1-2 недели при регулярном постинге.

### AdSense не одобряет
Возможные причины:
- Недостаточно оригинального контента
- Нарушение правил
- Проблемы с регионом

## Советы для роста

1. **Постите регулярно** — минимум 1 видео в неделю
2. **Анализируйте статистику** — YouTube Studio показывает, что заходит
3. **Оптимизируйте заголовки и превью** — от них зависит CTR
4. **Делайте длинные видео** — 8+ минут = больше рекламы
5. **Взаимодействуйте с аудиторией** — отвечайте на комментарии

## Заключение

Монетизация YouTube канала — это марафон, а не спринт. Купив готовый канал с подписчиками, вы экономите годы работы. Главное — правильно переоформить AdSense, постить регулярно и не нарушать правила. Удачи!','youtube,монетизация,adsense,заработок',TRUE,'2026-07-14T13:01:19.991Z','2026-07-14T13:01:19.991Z');
INSERT INTO "BlogPost" ("id","slug","title","excerpt","content","tags","published","createdAt","updatedAt") VALUES ('post_3','kak-vybrat-gruppu-vk-dlya-biznesa','Как выбрать группу VK для бизнеса: чек-лист покупателя','На что обратить внимание при покупке VK группы для бизнеса: тематика, активность, гео, признаки накрутки, юридические аспекты.','# Как выбрать группу VK для бизнеса

VK — крупнейшая соцсеть в России с 100+ млн пользователей. Готовая группа с живой аудиторией — отличный старт для бизнеса. Но как выбрать правильно?

## Зачем бизнесу VK группа

- **Продажи**: прямые продажи товаров и услуг
- **Лидогенерация**: сбор заявок
- **Брендинг**: узнаваемость и доверие
- **Поддержка клиентов**: общение с аудиторией
- **Рекламный доход**: продажа рекламы другим

## Чек-лист проверки группы перед покупкой

### 1. Тематика
Идеально — тематика группы совпадает с вашим бизнесом. Если продаёте косметику — ищите группу про красоту. Аудитория уже заинтересована.

### 2. Активность
Проверьте последние 5-10 постов:
- Лайки: минимум 1-2% от числа подписчиков
- Комментарии: живые, а не "Класс!" или эмодзи
- Репосты: признак качественного контента

### 3. Гео аудитории
Для локального бизнеса важно, чтобы подписчики были из вашего региона. Проверить можно через статистику группы (если открыта) или у продавца.

### 4. Признаки накрутки
- **Резкие скачки подписчиков** — нормально только после вирусного поста
- **Мало лайков при многих подписчиках** — признак ботов
- **Одинаковые комментарии** — накрутка
- **Нет просмотров видео** — боты не смотрят

### 5. История группы
- Возраст: лучше 6+ месяцев
- Нет блокировок или предупреждений от VK
- Права создателя можно передать через официальную функцию

## Как передаются права

VK позволяет передать права создателя группы другому человеку:

1. **Добавьте свой аккаунт как админа** — продавец добавляет
2. **Подождите 7 дней** — VK требует для смены создателя
3. **Продавец передаёт права создателя** — в настройках группы
4. **Удалите старого создателя** — после передачи прав

Важно: этот процесс занимает ~7 дней. Не доверяйте продавцам, которые обещают мгновенную передачу.

## Способы оплаты

### Криптовалюта
- Анонимно, без проверок
- BTC, USDT TRC-20, TON
- Зачисление 5–15 минут

## После покупки

1. **Смените пароль и включите 2FA** на аккаунте-создателе
2. **Удалите старых админов** — оставьте только себя
3. **Проверьте подключения** — уберите сторонние приложения
4. **Измените описание и аватар** постепенно, не сразу
5. **Первые посты** — адаптируйте под свою тематику постепенно

## Юридические аспекты

В России продажа VK групп не запрещена, но есть нюансы:
- **Налоги**: если продаёте как ИП/ООО — нужен договор
- **Авторские права**: проверьте, что в постах нет нарушений
- **Персональные данные**: подписчики — это не ваша собственность

## Заключение

Покупка VK группы — это инвестиция в свой бизнес. Выбирайте проверенный маркетплейс с гарантией, проверяйте активность и тематику, оплачивайте криптой. Правильно выбранная группа окупится за 1-3 месяца активной работы. Удачи!','vk,бизнес,покупка группы,чек-лист',TRUE,'2026-07-14T13:01:19.993Z','2026-07-14T13:01:19.993Z');
INSERT INTO "BlogPost" ("id","slug","title","excerpt","content","tags","published","createdAt","updatedAt") VALUES ('post_4','oplata-kriptovalyutoj-polnoe-rukovodstvo','Оплата криптовалютой: полное руководство','Подробное руководство по оплате аккаунтов криптовалютой. BTC, USDT TRC-20, TON — что выбрать, как перевести, комиссии, скорость зачисления, безопасность.','# Оплата криптовалютой

При покупке аккаунтов в ХайпХаб доступна оплата криптовалютой. Разберём, как это работает, и какую монету выбрать.

## Криптовалюта (BTC, USDT TRC-20, TON)

### Плюсы
- **Анонимность**: никакой проверки личности
- **Международность**: можно платить из любой страны
- **Безопасность**: переводы нельзя отменить
- **Без блокировок**: никто не заморозит ваш платёж

### Минусы
- **Время зачисления**: 5–15 минут (BTC дольше)
- **Волатильность**: курс может измениться за время перевода
- **Сложность для новичков**: нужно разобраться с кошельками
- **Комиссии сети**: зависит от загруженности блокчейна

### Какая крипта лучше?

| Монета | Скорость | Комиссия | Анонимность |
|--------|----------|----------|-------------|
| USDT TRC-20 | 1-5 мин | ~$1 | Высокая |
| TON | 1-3 мин | ~$0.05 | Высокая |
| BTC | 10-30 мин | $2-10 | Высокая |

**Рекомендация**: для небольших сумм (до 5000₽) используйте **TON** — минимальная комиссия. Для средних (5000-50000₽) — **USDT TRC-20**. Для крупных — **BTC** (хоть и медленнее, но самый надёжный).

## Как платить криптой

1. **Выберите монету** — BTC, USDT TRC-20 или TON — в окне оплаты
2. **Скопируйте адрес кошелька** — указан в окне оплаты
3. **Отправьте точную сумму** со своего кошелька
4. **Нажмите "Я оплатил"** — данные придут после подтверждения сети

## Что выбрать?

### Выбирайте TON, если:
- Небольшая сумма (до 5000₽)
- Хотите минимальную комиссию
- Нужна скорость (1-3 минуты)

### Выбирайте USDT TRC-20, если:
- Средняя сумма (5000-50000₽)
- Хотите стабильный курс (привязан к доллару)
- У вас уже есть USDT

### Выбирайте BTC, если:
- Крупная сумма (50000₽+)
- Нужна максимальная надёжность
- Готовы подождать 10-30 минут

## Частые вопросы

### Можно ли вернуть деньги при оплате криптой?
Нет, переводы в блокчейне необратимы. Поэтому важно проверять адрес получателя.

### Безопасно ли платить криптой?
Да, если используете официальный кошелёк. Никогда не переходите по ссылкам из писем.

### Что быстрее?
TON — 1-3 минуты. USDT TRC-20 — 1-5 минут. BTC — 10-30 минут.

### Что дешевле?
TON — комиссия ~$0.05. USDT — ~$1. BTC — $2-10.

## Заключение

Оплата криптовалютой — самый анонимный и безопасный способ покупки аккаунтов. Выбирайте монету исходя из суммы: TON для небольших, USDT для средних, BTC для крупных. В ХайпХаб все три монеты доступны в любом товаре. Удачных покупок!','оплата,криптовалюта,btc,usdt,ton,руководство',TRUE,'2026-07-14T13:01:19.995Z','2026-07-14T13:01:19.995Z');
INSERT INTO "BlogPost" ("id","slug","title","excerpt","content","tags","published","createdAt","updatedAt") VALUES ('post_5','bezopasnost-akkauntov-posle-pokupki','Безопасность аккаунтов после покупки: 10 обязательных шагов','Полный чек-лист по защите купленного аккаунта TikTok, YouTube, VK или Instagram: пароли, 2FA, привязка контактов, частые ошибки.','# Безопасность аккаунтов после покупки

Купили аккаунт? Поздравляем! Теперь самое важное — правильно его защитить. По статистике, 30% купленных аккаунтов теряются из-за неправильной настройки безопасности. Не повторяйте чужих ошибок.

## 10 обязательных шагов

### 1. Смените пароль немедленно
Первое и самое важное действие. Старый владелец знает пароль — значит, может войти в любой момент.

**Требования к паролю:**
- Минимум 12 символов
- Заглавные и строчные буквы
- Цифры и спецсимволы (!@#$%)
- Не использовать словарные слова
- Уникальный для каждого аккаунта

**Совет**: используйте менеджер паролей (Bitwarden, 1Password, KeePass).

### 2. Включите двухфакторную аутентификацию (2FA)
2FA — второй фактор входа: код из SMS, приложения или ключа. Даже если кто-то узнает пароль, без второго фактора не войдёт.

**Для каждого сервиса:**
- **TikTok**: Настройки → Учётная запись → Безопасность → 2-этапная проверка
- **YouTube/Google**: Аккаунт Google → Безопасность → Двухэтапная проверка
- **VK**: Настройки → Безопасность → Двухфакторная аутентификация
- **Instagram**: Настройки → Безопасность → Двухфакторная аутентификация

**Лучший вариант**: используйте приложение аутентификатор (Google Authenticator, Authy), а не SMS — SMS можно перехватить.

### 3. Привяжите свои контакты
Замените email и телефон продавца на свои:

1. Добавьте свой email/телефон
2. Подтвердите их
3. Удалите старые контакты продавца
4. Проверьте, что восстановление доступа идёт на ваши контакты

### 4. Проверьте активные сессии
В настройках безопасности каждого сервиса есть список активных сессий. Завершите все, кроме своей текущей.

### 5. Отключите сторонние приложения
Продавец мог подключить сторонние приложения (для накрутки, аналитики и т.д.). Отзовите доступ к ним — это потенциальная уязвимость.

### 6. Измените публичные данные (постепенно)
Не меняйте сразу всё — алгоритмы могут заподозрить взлом:

**День 1-2**: ничего не меняйте, аккаунт "остынет"
**День 3-5**: поменяйте описание профиля
**День 5-7**: смените аватарку
**День 7+**: меняйте username (если нужно)

### 7. Включите уведомления о входе
Каждый сервис позволяет получать уведомления о входе с нового устройства. Обязательно включите — так вы узнаете, если кто-то попытается войти.

### 8. Сделайте резервные коды
При включении 2FA сервисы дают резервные коды на случай потери телефона. **Сохраните их в надёжном месте** (не в заметках телефона).

### 9. Не кликайте на подозрительные ссылки
Фишинг — главный способ кражи аккаунтов. Не вводите пароль на сайтах, перейдя по ссылке из письма или сообщения. Всегда проверяйте URL.

### 10. Регулярно проверяйте активность
Раз в неделю заглядывайте в настройки безопасности:
- Активные сессии
- Подключённые приложения
- Недавние входы

## Частые ошибки

### Ошибка 1: Не менять пароль сразу
Думают: "потом поменяю". А "потом" продавец уже зашёл и сменил пароль сам.

### Ошибка 2: Одинаковый пароль везде
Если один аккаунт утечёт — потеряете все.

### Ошибка 3: SMS вместо приложения
SMS можно перехватить через SIM-свопинг. Приложение-аутентификатор надёжнее.

### Ошибка 4: Сразу менять всё
Резкая смена данных → алгоритмы считают аккаунт взломанным → временная блокировка.

### Ошибка 5: Не сохранять резервные коды
Потеряли телефон → потеряли доступ к аккаунту навсегда.

## Что делать, если аккаунт украли

1. **Немедленно используйте резервные коды** для входа
2. **Смените пароль** через функцию восстановления
3. **Завершите все сессии** в настройках безопасности
4. **Свяжитесь с поддержкой** сервиса
5. **Напишите в поддержку ХайпХаб** — поможем в рамках гарантии

## Заключение

Безопасность аккаунта — это не разовое действие, а привычка. Настройте 2FA, используйте менеджер паролей, будьте осторожны с фишингом. 30 минут на настройку сэкономят вам недели восстановления в случае утери. Берегите свои аккаунты!','безопасность,2fa,пароли,защита',TRUE,'2026-07-14T13:01:19.996Z','2026-07-14T13:01:19.996Z');

-- 12 reviews
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_1','Алексей М.',5,'Купил TikTok аккаунт 50K за 6990₽. Всё пришло мгновенно после оплаты криптой — логин, пароль, инструкция. Аккаунт живой, подписчики реальные, охваты отличные. Уже через неделю начал зарабатывать на рекламе. Рекомендую!','TikTok аккаунт 50K подписчиков','approved',NULL,'2026-07-14T13:01:19.973Z','2026-07-14T13:01:19.973Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_2','Мария К.',5,'Брала VK группу 10K для своего бизнеса. Группа живая, участники активные, сразу начала постить рекламу своих товаров. Оплата через USDT — быстро и удобно. Поддержка ответила на все вопросы за 5 минут.','VK группа 10K участников','approved',NULL,'2026-07-14T13:01:19.977Z','2026-07-14T13:01:19.977Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_3','Дмитрий В.',5,'YouTube канал 10K с монетизацией — топ. Уже через месяц после покупки получаю стабильный доход от AdSense. Помогли с переоформлением, всё легально и безопасно. Цена адекватная, учитывая что канал уже приносит деньги.','YouTube канал 10K подписчиков','approved',NULL,'2026-07-14T13:01:19.979Z','2026-07-14T13:01:19.979Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_4','Сергей П.',5,'Второй раз покупаю тут. Первый раз TikTok 10K, сейчас взял Instagram 50K. Качество стабильно высокое, никаких ботов. Сразу меняю пароль, привязываю свои контакты — и аккаунт мой. Гарантия работает, был один случай с проблемой доступа — заменили за час.','Instagram аккаунт 50K подписчиков','approved',NULL,'2026-07-14T13:01:19.980Z','2026-07-14T13:01:19.980Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_5','Анна Л.',5,'Telegram канал 10K купила для своего медиа-проекта. Охват постов отличный, подписчики читают и реагируют. Оплата USDT прошла за 10 минут, данные пришли сразу. AI-ассистент на сайте помог выбрать подходящий канал.','Telegram канал 10K подписчиков','approved',NULL,'2026-07-14T13:01:19.981Z','2026-07-14T13:01:19.981Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_6','Игорь С.',5,'Брал VK паблик 100K для серьёзного проекта. Цена кусается, но оно того стоит — охваты 50K+ на посты, стабильный трафик. Передача прав через официальную функцию VK, всё чисто. Гарантия 14 дней, но проблем не было.','VK паблик 100K участников','approved',NULL,'2026-07-14T13:01:19.982Z','2026-07-14T13:01:19.982Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_7','Екатерина Р.',4,'Купила TikTok 100K для запуска своего бренда. Аккаунт отличный, но первое время был небольшой спад охватов — поддержка объяснила, что это нормально при смене владельца. Через неделю всё восстановилось. Минус звезду за то, что ответ поддержки пришлось подождать около 30 минут.','TikTok аккаунт 100K подписчиков','approved',NULL,'2026-07-14T13:01:19.983Z','2026-07-14T13:01:19.983Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_8','Павел Н.',5,'YouTube 100K — мечта! Канал с реальными просмотрами, монетизация активна, без страйков. Помогли с переоформлением AdSense на мой аккаунт. Стоит своих денег, окупится за пару месяцев. Однозначно рекомендую ХайпХаб.','YouTube канал 100K подписчиков','approved',NULL,'2026-07-14T13:01:19.984Z','2026-07-14T13:01:19.984Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_9','Ольга Т.',5,'Маленький TikTok 10K для старта. Цена 1490₽ — просто подарок! Подписчики живые, видео набирают просмотры. Для тех, кто только начинает — идеальный вариант. Оплата криптой, никаких проверок личности.','TikTok аккаунт 10K подписчиков','approved',NULL,'2026-07-14T13:01:19.985Z','2026-07-14T13:01:19.985Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_10','Артём К.',5,'VK группа 1K для локального бизнеса. За 990₽ получил готовое сообщество с живыми людьми. Сразу начал продавать свои услуги. Поддержка помогла с настройкой. Однозначно вернусь за большим пабликом.','VK группа 1000 участников','approved',NULL,'2026-07-14T13:01:19.985Z','2026-07-14T13:01:19.985Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_11','Виктория М.',5,'Instagram 5K для личного бренда. Всё чисто, аккаунт не в бане, охваты нормальные. Сразу сменила пароль и включила 2FA по инструкции из файла. Спасибо за подробную инструкцию по безопасности!','Instagram аккаунт 5K подписчиков','approved',NULL,'2026-07-14T13:01:19.986Z','2026-07-14T13:01:19.986Z');
INSERT INTO "Review" ("id","name","rating","text","product","status","reply","createdAt","updatedAt") VALUES ('rev_12','Никита Д.',5,'Брал Telegram 1K канал для запуска. За 1490₽ — отличная цена. Подписчики живые, просмотры есть. Оплата TON моментальная, данные пришли за секунду. Сервис реально работает 24/7, проверял ночью.','Telegram канал 1000 подписчиков','approved',NULL,'2026-07-14T13:01:19.988Z','2026-07-14T13:01:19.988Z');

-- Visitors and AdminLog are runtime data - not imported

-- === Done! ===
-- Database fully initialized.
