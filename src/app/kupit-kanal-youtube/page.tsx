import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SeoLanding } from "@/components/store/SeoLanding";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Купить YouTube канал с подписчиками — монетизированные | ХайпХаб",
  description:
    "Купить YouTube канал с подписчиками от 1K до 100K+. Монетизированные каналы с AdSense, без страйков. Мгновенная выдача данных. Оплата криптой (BTC, USDT, TON) . Гарантия.",
  keywords: [
    "купить канал ютуб",
    "купить youtube канал",
    "купить ютуб канал с подписчиками",
    "купить ютуб с монетизацией",
    "youtube канал 1000 подписчиков",
    "купить youtube 10000",
    "купить youtube 100000",
    "монетизированный ютуб канал",
    "продажа youtube каналов",
    "купить ютуб с adsense",
  ],
  alternates: { canonical: "https://hypehub.shop/kupit-kanal-youtube" },
  openGraph: {
    title: "Купить YouTube канал с подписчиками | ХайпХаб",
    description:
      "Готовые YouTube каналы от 1K до 100K+ подписчиков. Монетизация, без страйков, гарантия. Оплата криптой.",
    url: "https://hypehub.shop/kupit-kanal-youtube",
    images: ["/og.png"],
  },
};

export default async function YouTubePage() {
  const [category, products, settings] = await Promise.all([
    db.category.findFirst({ where: { slug: "youtube" } }),
    db.product.findMany({
      where: { status: "available", category: { slug: "youtube" } },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { price: "asc" }],
    }),
    db.setting.findMany(),
  ]);

  if (!category) return null;

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const safeProducts = products.map(({ login, password, deliveryNote, ...rest }) => rest);

  return (
    <>
      <VisitorTracker />
      <Header siteName={settingsMap.site_name} />
      <SeoLanding
        category={JSON.parse(JSON.stringify(category))}
        products={JSON.parse(JSON.stringify(safeProducts))}
        settings={settingsMap}
        h1="YouTube каналы"
        metaTitle=""
        metaDescription=""
        keywords={[
          "купить канал ютуб",
          "купить youtube 1000 подписчиков",
          "ютуб с монетизацией",
          "youtube 100k канал",
          "купить adsense канал",
          "ютуб без страйков",
        ]}
        sections={[
          {
            title: "Как купить YouTube канал",
            content: `Купить YouTube канал на ХайпХаб просто:

1. Выберите канал из списка выше — у каждого указано количество подписчиков, цена, часы просмотра и статус монетизации.
2. Нажмите «Купить» и заполните форму: email и контакт (Telegram или телефон).
3. Выберите способ оплаты: криптовалюта (BTC, USDT TRC-20, TON).
4. После оплаты получите .txt файл с логином, паролем и инструкцией по безопасному входу.

Для монетизированных каналов поможем с переоформлением AdSense на ваш аккаунт.`,
          },
          {
            title: "Зачем покупать YouTube канал",
            content: `Готовый YouTube канал экономит годы работы:

• Мгновенная монетизация — каналы с подключенным AdSense уже приносят доход.
• Готовая аудитория — сразу есть просмотры и подписчики.
• Запуск бренда — канал под ваш контент с проверенной историей.
• Реклама — размещайте интеграции и спонсорские посты.
• Перепродажа — купите дешевле, вырастите, продайте дороже.
• Достижение порогов — 1K, 10K, 100K, 1M подписчиков уже есть.

Все каналы проверяются: без страйков, без нарушений правил YouTube, реальная активность аудитории.`,
          },
          {
            title: "Безопасность и гарантия",
            content: `ХайпХаб гарантирует безопасность каждой сделки:

• Полная передача Google-аккаунта с каналом.
• Помощь с переоформлением AdSense на ваш аккаунт.
• Оплата криптой — анонимно, без проверок.
• Гарантия от 24 часов до 14 дней на каждый канал.
• Все каналы без страйков и нарушений.
• При проблемах — заменим канал или вернём деньги.

Сразу после получения смените пароль, привяжите свой телефон и включите двухфакторную аутентификацию.`,
          },
        ]}
      />
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
