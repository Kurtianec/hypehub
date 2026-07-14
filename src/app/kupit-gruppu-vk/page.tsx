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
  title: "Купить группу VK с участниками — проверенные паблики | ХайпХаб",
  description:
    "Купить VK группу и паблик с живыми участниками от 1K до 100K+. Проверенные сообщества ВКонтакте, мгновенная выдача доступа. Оплата криптой (BTC, USDT, TON) . Гарантия.",
  keywords: [
    "купить группу вк",
    "купить паблик вк",
    "купить vk группу",
    "купить сообщество вконтакте",
    "группа вк с участниками",
    "купить паблик вк дешево",
    "продажа групп вк",
    "купить вк 10000 участников",
    "купить вк 100000",
    "купить группу вк с монетизацией",
  ],
  alternates: { canonical: "https://hypehub.vercel.app/kupit-gruppu-vk" },
  openGraph: {
    title: "Купить группу VK с участниками | ХайпХаб",
    description:
      "Готовые VK группы от 1K до 100K+ участников. Живая аудитория, монетизация, гарантия. Оплата криптой.",
    url: "https://hypehub.vercel.app/kupit-gruppu-vk",
    images: ["/og.png"],
  },
};

export default async function VKPage() {
  const [category, products, settings] = await Promise.all([
    db.category.findFirst({ where: { slug: "vk" } }),
    db.product.findMany({
      where: { status: "available", category: { slug: "vk" } },
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
        h1="Группы VK"
        metaTitle=""
        metaDescription=""
        keywords={[
          "купить группу вк",
          "купить паблик вконтакте",
          "vk группа 10000",
          "vk 100000 участников",
          "купить группу вк с монетизацией",
          "сообщество вконтакте купить",
        ]}
        sections={[
          {
            title: "Как купить группу VK",
            content: `Купить VK группу на ХайпХаб просто:

1. Выберите паблик из списка выше — у каждого указано количество участников, цена и бейджи.
2. Нажмите «Купить» и заполните форму: email и контакт (Telegram или телефон).
3. Выберите способ оплаты: криптовалюта (BTC, USDT TRC-20, TON).
4. После оплаты получите .txt файл с логином, паролем и инструкцией по передаче прав.

После оплаты вы получаете полные права создателя группы. Все участники — живые, без накрутки ботами.`,
          },
          {
            title: "Преимущества готовой VK группы",
            content: `Готовая VK группа экономит месяцы раскрутки:

• Мгновенный старт — у вас уже есть аудитория для постов и рекламы.
• Монетизация — многие группы уже подключены к VK Donut и рекламной сети.
• Продвижение бизнеса — продавайте товары и услуги живой аудитории.
• Реклама — размещайте платные посты от других брендов.
• Перепродажа — купите дешевле, вырастите, продайте дороже.
• Сообщество — собирайте людей вокруг своего проекта.

Все группы проверяются перед продажей: живая активность, реальные просмотры постов, без ботов.`,
          },
          {
            title: "Безопасность и гарантия",
            content: `ХайпХаб гарантирует безопасность каждой сделки:

• Передача прав администратора через официальную функцию VK.
• Оплата криптой — анонимно, без проверок личности.
• Гарантия от 24 часов до 14 дней на каждую группу.
• При проблемах с доступом — заменим группу или вернём деньги.
• Поддержка 24/7 в чате и через AI-ассистента.

Сразу после получения смените пароль, удалите старых админов и включите двухфакторную аутентификацию.`,
          },
        ]}
      />
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
