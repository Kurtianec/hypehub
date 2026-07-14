import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";
import { ReviewsClient } from "@/components/store/ReviewsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Отзывы покупателей ХайпХаб — реальные отзывы о покупке аккаунтов TikTok, YouTube, VK",
  description:
    "Честные отзывы реальных покупателей аккаунтов TikTok, YouTube, VK, Instagram и Telegram в ХайпХаб. Более 12 800 довольных клиентов. Оцените качество сервиса перед покупкой.",
  keywords: [
    "отзывы хайпхаб",
    "отзывы о покупке аккаунтов",
    "купить аккаунт тикток отзывы",
    "купить ютуб канал отзывы",
    "купить группу вк отзывы",
    "hypehub отзывы",
    "отзывы маркетплейс аккаунтов",
  ],
  alternates: { canonical: "https://hypehub.vercel.app/otzyvy" },
  openGraph: {
    title: "Отзывы покупателей ХайпХаб",
    description: "Реальные отзывы о покупке аккаунтов TikTok, YouTube, VK. Более 12 800 довольных клиентов.",
    url: "https://hypehub.vercel.app/otzyvy",
    images: ["/og.png"],
  },
};

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([
    db.review.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
    }),
    db.setting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "4.9";

  // JSON-LD: AggregateRating + Reviews
  const reviewsJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Аккаунты соцсетей ХайпХаб",
    description: "Маркетплейс готовых аккаунтов TikTok, YouTube, VK с живыми подписчиками",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: String(reviews.length || 12800),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.createdAt.toISOString().split("T")[0],
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: r.text,
      name: r.product || "Покупка аккаунта",
    })),
  };

  return (
    <>
      <VisitorTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }}
      />
      <Header siteName={settingsMap.site_name} />
      <ReviewsClient
        reviews={JSON.parse(JSON.stringify(reviews))}
        avgRating={avgRating}
      />
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
