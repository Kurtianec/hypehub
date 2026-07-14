import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) {
    return { title: "Статья не найдена" };
  }
  return {
    title: `${post.title} | Блог ХайпХаб`,
    description: post.excerpt,
    keywords: post.tags?.split(",").map((t) => t.trim()).filter(Boolean) || [],
    alternates: { canonical: `https://hypehub.vercel.app/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://hypehub.vercel.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, settings, otherPosts] = await Promise.all([
    db.blogPost.findUnique({ where: { slug } }),
    db.setting.findMany(),
    db.blogPost.findMany({
      where: { published: true, slug: { not: slug } },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!post || !post.published) {
    return (
      <>
        <Header siteName="ХайпХаб" />
        <main className="flex-1 pt-32 pb-12 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-black uppercase mb-4">Статья не найдена</h1>
            <Link href="/blog" className="text-[#BFFF00] font-mono uppercase hover:underline">
              ← Назад в блог
            </Link>
          </div>
        </main>
      </>
    );
  }

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  // JSON-LD: Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "ХайпХаб",
      url: "https://hypehub.vercel.app",
    },
    publisher: {
      "@type": "Organization",
      name: "ХайпХаб",
      logo: {
        "@type": "ImageObject",
        url: "https://hypehub.vercel.app/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://hypehub.vercel.app/blog/${post.slug}`,
    },
    keywords: post.tags || "",
  };

  // Convert simple markdown to HTML
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const html: string[] = [];
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push(`<h2 class="text-2xl font-black uppercase tracking-tight mt-6 mb-3 text-[#BFFF00] font-mono">${trimmed.slice(2)}</h2>`);
      } else if (trimmed.startsWith("## ")) {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push(`<h3 class="text-lg font-black uppercase tracking-tight mt-5 mb-2 text-foreground">${trimmed.slice(3)}</h3>`);
      } else if (trimmed.startsWith("### ")) {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push(`<h4 class="text-base font-bold mt-4 mb-2 text-foreground">${trimmed.slice(4)}</h4>`);
      } else if (trimmed.startsWith("- ")) {
        if (!inList) { html.push('<ul class="list-none space-y-1 my-3 ml-4">'); inList = true; }
        html.push(`<li class="text-[#888] font-mono text-sm leading-relaxed flex gap-2"><span class="text-[#BFFF00]">▸</span><span>${trimmed.slice(2)}</span></li>`);
      } else if (trimmed.match(/^\d+\.\s/)) {
        if (!inList) { html.push('<ol class="list-none space-y-1 my-3 ml-4">'); inList = true; }
        const match = trimmed.match(/^(\d+)\.\s(.+)/);
        html.push(`<li class="text-[#888] font-mono text-sm leading-relaxed flex gap-2"><span class="text-[#FF2D87] font-bold">${match?.[1]}.</span><span>${match?.[2]}</span></li>`);
      } else if (trimmed === "") {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push("<br/>");
      } else if (trimmed.startsWith("|")) {
        if (inList) { html.push("</ul>"); inList = false; }
        const cells = trimmed.split("|").filter((c) => c.trim());
        html.push(`<div class="grid grid-cols-${Math.min(cells.length, 4)} gap-1 my-3">`);
        cells.forEach((c) => {
          html.push(`<div class="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2 text-xs font-mono text-[#888]">${c.trim()}</div>`);
        });
        html.push("</div>");
      } else {
        if (inList) { html.push("</ul>"); inList = false; }
        const htmlLine = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
        html.push(`<p class="text-[#888] font-mono text-sm leading-relaxed my-2">${htmlLine}</p>`);
      }
    }
    if (inList) html.push("</ul>");
    return html.join("");
  };

  return (
    <>
      <VisitorTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header siteName={settingsMap.site_name} />
      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
            <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
            <span className="text-[#BFFF00]">/</span>
            <Link href="/blog" className="hover:text-[#BFFF00]">БЛОГ</Link>
            <span className="text-[#BFFF00]">/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </div>

          {/* Article header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#A855F7]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">
              {"// "}{new Date(post.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 leading-[1.1]">
            <span className="text-gradient-neon">{post.title}</span>
          </h1>
          <p className="text-[#888] text-sm md:text-base font-mono mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          {post.tags && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {post.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="px-2 py-0.5 border border-[#2A2A2A] text-[10px] text-[#888] font-mono uppercase">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article content */}
          <div dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

          {/* Back link */}
          <div className="mt-12 pt-6 border-t-2 border-[#1F1F1F]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#BFFF00] font-mono uppercase text-sm hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад в блог
            </Link>
          </div>

          {/* Related posts */}
          {otherPosts.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-[#A855F7] font-mono">
                {"// ЧИТАЙТЕ ТАКЖЕ"}
              </h3>
              <div className="grid gap-3">
                {otherPosts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="block bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#A855F7] p-4 transition-colors group"
                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                  >
                    <h4 className="font-black uppercase tracking-tight group-hover:text-[#A855F7] transition-colors text-sm">{p.title}</h4>
                    <p className="text-xs text-[#888] font-mono mt-1 line-clamp-2">{p.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
