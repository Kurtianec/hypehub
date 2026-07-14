import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Блог ХайпХаб — руководство по покупке аккаунтов TikTok, YouTube, VK",
  description:
    "Полезные статьи о покупке и монетизации аккаунтов TikTok, YouTube, VK. Руководства по безопасности, способы оплаты, советы по выбору. Читайте перед покупкой.",
  keywords: [
    "блог хайпхаб",
    "как купить аккаунт тикток",
    "монетизация youtube канала",
    "как выбрать группу вк",
    "безопасность аккаунтов",
    "оплата криптовалютой",
  ],
  alternates: { canonical: "https://hypehub.vercel.app/blog" },
  openGraph: {
    title: "Блог ХайпХаб — руководства по покупке аккаунтов",
    description: "Полезные статьи о покупке и монетизации аккаунтов соцсетей.",
    url: "https://hypehub.vercel.app/blog",
    images: ["/og.png"],
  },
};

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
    db.setting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Блог ХайпХаб",
    description: "Руководства по покупке аккаунтов соцсетей",
    url: "https://hypehub.vercel.app/blog",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.createdAt.toISOString(),
      dateModified: p.updatedAt.toISOString(),
      url: `https://hypehub.vercel.app/blog/${p.slug}`,
      keywords: p.tags || "",
    })),
  };

  return (
    <>
      <VisitorTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Header siteName={settingsMap.site_name} />
      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
            <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
            <span className="text-[#BFFF00]">/</span>
            <span className="text-foreground">БЛОГ</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#A855F7]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// BLOG"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3">
            <span className="text-gradient-neon">Блог</span>
          </h1>
          <p className="text-[#888] text-sm md:text-base font-mono mb-8">
            &gt; Руководства по покупке аккаунтов, монетизации и безопасности
          </p>

          {/* Posts list */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16 text-[#888] font-mono">
                <p className="uppercase">&gt; Пока нет статей</p>
              </div>
            ) : (
              posts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="block bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#BFFF00] p-5 md:p-6 transition-colors group"
                  style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-[#A855F7] font-mono uppercase mb-2">
                        {"// "}{String(i + 1).padStart(2, "0")} · {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                      </div>
                      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-[#BFFF00] transition-colors">
                        {p.title}
                      </h2>
                      <p className="text-sm text-[#888] leading-relaxed font-mono mb-3 line-clamp-2">
                        {p.excerpt}
                      </p>
                      {p.tags && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 border border-[#2A2A2A] text-[10px] text-[#888] font-mono uppercase">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-[#BFFF00] font-mono text-2xl font-black opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      →
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
