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
  title: "Купить аккаунт TikTok с подписчиками — проверенные аккаунты | ХайпХаб",
  description:
    "Купить TikTok аккаунт с живыми подписчиками от 1K до 100K+. Проверенные аккаунты, мгновенная выдача логина и пароля. Оплата криптой (BTC, USDT, TON) . Гарантия до 14 дней.",
  keywords: [
    "купить аккаунт тикток",
    "купить tiktok аккаунт",
    "аккаунт тикток с подписчиками",
    "тикток аккаунт купить дешево",
    "купить аккаунт tiktok с деньгами",
    "tiktok с monetization",
    "накрутка тикток",
    "купить тикток 10k",
    "купить тикток 100k",
    "продажа тикток аккаунтов",
  ],
  alternates: { canonical: "https://hypehub.vercel.app/kupit-akkaunt-tiktok" },
  openGraph: {
    title: "Купить аккаунт TikTok с подписчиками | ХайпХаб",
    description:
      "Готовые TikTok аккаунты от 1K до 100K+ подписчиков. Живая аудитория, гарантия, мгновенная выдача. Оплата криптой.",
    url: "https://hypehub.vercel.app/kupit-akkaunt-tiktok",
    images: ["/og.png"],
  },
};

export default async function TikTokPage() {
  const [category, products, settings] = await Promise.all([
    db.category.findFirst({ where: { slug: "tiktok" } }),
    db.product.findMany({
      where: { status: "available", category: { slug: "tiktok" } },
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
        h1="Аккаунты TikTok"
        metaTitle=""
        metaDescription=""
        keywords={[
          "купить аккаунт тикток",
          "tiktok 10k подписчиков",
          "tiktok 100k",
          "купить tiktok с монетизацией",
          "тикток для стрима",
          "аккаунт tiktok russia",
        ]}
        sections={[
          {
            title: "Как купить аккаунт TikTok",
            content: `Купить TikTok аккаунт на ХайпХаб просто:

1. Выберите аккаунт из списка выше — у каждого указано количество подписчиков, цена и бейджи (Хит, Топ, Премиум, Проверен).
2. Нажмите «Купить» и заполните форму: email для получения данных и контакт (Telegram или телефон).
3. Выберите способ оплаты: криптовалюта (BTC, USDT TRC-20, TON)-кошелёк.
4. После перевода нажмите «Я оплатил» — данные аккаунта (логин и пароль) придут мгновенно в .txt файле.

Все аккаунты проверяются перед продажей. Живая аудитория, без ботов. Гарантия от 24 часов до 14 дней в зависимости от категории.`,
          },
          {
            title: "Безопасность сделки",
            content: `ХайпХаб гарантирует безопасность каждой сделки:

• Данные передаются в зашифрованном виде через SSL-соединение.
• Оплата криптовалютой — полностью анонимна, без проверки личности.
• После получения аккаунта сразу смените пароль и привяжите свои контакты.
• Включите двухфакторную аутентификацию для максимальной защиты.
• В каждом файле с данными прилагается подробная инструкция по безопасному входу.

При любых проблемах с доступом в течение гарантийного срока — напишите в чат поддержки, заменим аккаунт или вернём деньги в течение 24 часов.`,
          },
          {
            title: "Зачем покупать TikTok аккаунт",
            content: `Готовый TikTok аккаунт с подписчиками экономит месяцы работы:

• Запуск проекта — сразу есть аудитория, не нужно начинать с нуля.
• Монетизация — аккаунты с подключенным Creator Fund уже приносят доход.
• Реклама и продвижение — продавайте рекламу брендов своей аудитории.
• Стримы — TikTok Live доступен с 1000+ подписчиков.
• Перепродажа — купите дешевле, вырастите, продайте дороже.
• Личный бренд — сразу есть охваты и доверие аудитории.

Все аккаунты с живыми подписчиками, реальной активностью и историей просмотров.`,
          },
        ]}
      />
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
