"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Bitcoin, Headphones, Check } from "lucide-react";
import type { Category, Product, Settings } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice, parseBadges, BADGE_LABELS } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { ProductModal } from "./ProductModal";
import { useState } from "react";

interface SeoLandingProps {
  category: Category;
  products: Product[];
  settings: Settings;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  sections: { title: string; content: string }[];
  productJsonLd?: object[];
}

export function SeoLanding({
  category,
  products,
  settings,
  h1,
  keywords,
  sections,
  productJsonLd = [],
}: SeoLandingProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const accent = PLATFORM_COLORS[category.platform];

  return (
    <>
      {/* Structured data for products */}
      {productJsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": productJsonLd,
            }),
          }}
        />
      )}

      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
            <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
            <span className="text-[#BFFF00]">/</span>
            <span className="text-foreground">{category.name.toUpperCase()}</span>
          </div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3 leading-[1.05]"
          >
            <span className="text-gradient-neon">{h1}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-[#888] max-w-2xl font-mono mb-6"
          >
            &gt; {category.description || `Купить ${h1.toLowerCase()} с живыми подписчиками. Проверенные аккаунты, гарантия, мгновенная выдача данных после оплаты криптой.`}
          </motion.p>

          {/* Quick benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {[
              { icon: Zap, text: "Мгновенная выдача", color: "#BFFF00" },
              { icon: Bitcoin, text: "Только крипта", color: "#FF7A00" },
              { icon: Shield, text: "Гарантия 14 дней", color: "#00F0FF" },
              { icon: Headphones, text: "Поддержка 24/7", color: "#FF2D87" },
            ].map((b, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 border-2 font-mono text-xs uppercase"
                style={{ borderColor: `${b.color}40`, color: b.color }}
              >
                <b.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {b.text}
              </div>
            ))}
          </motion.div>

          {/* Catalog for this category */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8" style={{ background: accent }} />
              <span className="font-mono text-xs text-[#888] uppercase tracking-widest">
                {"// ДОСТУПНЫ_ВАРИАНТЫ"} ({products.length})
              </span>
            </div>

            {products.length === 0 ? (
              <div className="bg-[#121212] border-2 border-[#2A2A2A] p-8 text-center text-[#888] font-mono">
                &gt; В этой категории пока нет товаров. Скоро появятся!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, i) => {
                  const badges = parseBadges(product.badges);
                  const meta = product.metadata ? JSON.parse(product.metadata) : {};
                  const discount = product.oldPrice
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : 0;
                  return (
                    <motion.button
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.4) }}
                      onClick={() => setSelectedProduct(product)}
                      className="group relative text-left bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#BFFF00] hover-press transition-all overflow-hidden"
                      style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-[#2A2A2A] group-hover:border-[#BFFF00] transition-colors">
                        <ProductImage platform={category.platform} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        {discount > 0 && (
                          <div className="absolute top-0 right-0 bg-[#FF2D87] text-white text-xs font-black px-2 py-1 font-mono">
                            −{discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        {product.followers && (
                          <div className="text-xs text-[#888] mb-2 font-mono uppercase" style={{ color: accent }}>
                            {product.followers}
                          </div>
                        )}
                        <h3 className="font-black text-base leading-tight mb-2 line-clamp-2 uppercase tracking-tight">
                          {product.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {meta.country && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] font-mono uppercase">
                              {meta.country}
                            </span>
                          )}
                          {meta.monetization && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-[#BFFF00]/10 border border-[#BFFF00]/40 text-[#BFFF00] font-mono uppercase font-bold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              MONET
                            </span>
                          )}
                        </div>
                        <div className="flex items-end justify-between gap-2 pt-3 border-t-2 border-[#1F1F1F]">
                          <div className="flex flex-col">
                            {product.oldPrice && (
                              <span className="text-xs text-[#888] line-through font-mono">
                                {formatPrice(product.oldPrice, product.currency)}
                              </span>
                            )}
                            <span className="text-xl font-black text-[#BFFF00] font-mono">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          </div>
                          <div className="px-3 py-2 bg-[#BFFF00] text-black text-xs font-black uppercase flex items-center gap-1.5 group-hover:bg-[#FF2D87] group-hover:text-white transition-colors font-mono">
                            Купить
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SEO content sections */}
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#121212] border-2 border-[#2A2A2A] p-6 md:p-8"
                style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-6" style={{ background: accent }} />
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{s.title}</h2>
                </div>
                <div className="text-sm md:text-base text-[#888] leading-relaxed font-mono whitespace-pre-line">
                  {s.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Keywords tags */}
          <div className="mt-10 pt-6 border-t-2 border-[#1F1F1F]">
            <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest mb-3">{"// ПОПУЛЯРНЫЕ_ЗАПРОСЫ"}</div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((k, i) => (
                <span key={i} className="px-3 py-1.5 border border-[#2A2A2A] text-xs text-[#888] font-mono uppercase hover:border-[#BFFF00] hover:text-[#BFFF00] transition-colors cursor-default">
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center bg-[#0E0E0E] border-2 border-[#BFFF00] p-6 md:p-8"
            style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
          >
            <h3 className="text-xl md:text-2xl font-black mb-2 uppercase tracking-tight">Готовы купить?</h3>
            <p className="text-sm text-[#888] mb-4 font-mono">
              &gt; Выберите аккаунт выше или вернитесь на главную для других категорий.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors hover-press font-mono tracking-wide"
            >
              Все категории
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        settings={settings}
      />
    </>
  );
}
