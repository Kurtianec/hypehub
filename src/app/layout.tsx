import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const SITE_URL = "https://hypehub.shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ХайпХаб — Купить аккаунты TikTok, YouTube, VK | Быстрая доставка 24/7",
    template: "%s | ХайпХаб",
  },
  description:
    "ХайпХаб — современный маркетплейс готовых аккаунтов TikTok, YouTube, VK, Instagram и Telegram. Живые подписчики, монетизация, гарантия. Оплата криптой. Мгновенная выдача файла с логином и паролем.",
  keywords: [
    "купить аккаунт тикток",
    "купить youtube канал",
    "купить группу вк",
    "купить instagram аккаунт",
    "купить telegram канал",
    "аккаунты соцсетей",
    "монетизированный youtube",
    "tiktok с подписчиками",
    "vk группа купить",
    "hypehub",
    "хайпхаб",
    "маркетплейс аккаунтов",
  ],
  authors: [{ name: "HypeHub" }],
  creator: "HypeHub",
  publisher: "HypeHub",
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "ХайпХаб — Маркетплейс аккаунтов TikTok, YouTube, VK",
    description:
      "Покупай готовые аккаунты TikTok, YouTube, VK с живыми подписчиками и монетизацией. Оплата криптой. Мгновенная выдача. Гарантия 24/7.",
    url: SITE_URL,
    siteName: "ХайпХаб",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ХайпХаб — маркетплейс аккаунтов",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ХайпХаб — Купить аккаунты TikTok, YouTube, VK",
    description:
      "Готовые аккаунты соцсетей с живыми подписчиками. Оплата криптой. Мгновенная выдача.",
    images: ["/og.png"],
  },
  category: "e-commerce",
  formatDetection: { telephone: false, address: false, email: false },
  other: {
    "theme-color": "#0A0A0F",
    "yandex-verification": "hypehub-yandex-verify",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
    { media: "(prefers-color-scheme: light)", color: "#0A0A0F" },
  ],
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#store`,
      name: "ХайпХаб",
      alternateName: "HypeHub",
      url: SITE_URL,
      description:
        "Маркетплейс готовых аккаунтов TikTok, YouTube, VK, Instagram и Telegram с живыми подписчиками. Оплата криптой, мгновенная выдача.",
      priceRange: "₽₽",
      paymentAccepted: "Cryptocurrency",
      currenciesAccepted: "RUB, BTC, USDT, TON",
      openingHours: "Mo-Su 00:00-24:00",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "12800",
        bestRating: "5",
        worstRating: "1",
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "RU",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["Russian"],
        email: "support@hypehub.shop",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ХайпХаб",
      alternateName: "HypeHub — маркетплейс аккаунтов",
      inLanguage: "ru-RU",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Как купить аккаунт TikTok, YouTube или VK?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Выберите аккаунт в каталоге, нажмите «Купить», укажите email и контакт, выберите оплату криптой (BTC, USDT, TON). После оплаты мгновенно получите .txt файл с логином и паролем.",
          },
        },
        {
          "@type": "Question",
          name: "Какие способы оплаты доступны?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Криптовалюта (BTC, USDT TRC-20, TON). Все платежи анонимны, без проверки личности.",
          },
        },
        {
          "@type": "Question",
          name: "Даёте ли вы гарантию на аккаунты?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да, гарантия от 24 часов до 14 дней в зависимости от категории аккаунта. При проблемах с доступом — заменим аккаунт или вернём средства.",
          },
        },
        {
          "@type": "Question",
          name: "Как быстро я получу данные после оплаты?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Мгновенно. Сразу после подтверждения оплаты вы получаете .txt файл с логином, паролем и инструкцией по безопасному входу.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "TikTok аккаунты", item: `${SITE_URL}/kupit-akkaunt-tiktok` },
        { "@type": "ListItem", position: 3, name: "VK группы", item: `${SITE_URL}/kupit-gruppu-vk` },
        { "@type": "ListItem", position: 4, name: "YouTube каналы", item: `${SITE_URL}/kupit-kanal-youtube` },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
