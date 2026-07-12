"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Music2, Youtube, Users, Instagram, Send, Tag,
  Flame, BadgeCheck, Trophy, Crown, Check, Heart,
} from "lucide-react";
import type { Category, Product, Settings } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice, parseBadges, BADGE_LABELS } from "@/lib/types";
import { ProductModal } from "./ProductModal";
import { ProductImage } from "./ProductImage";
import { CompareBar, CompareModal, useCompare } from "./Compare";
import { FiltersBar, type SortOption, type FilterState } from "./FiltersBar";
import { CurrencyToggle } from "./CurrencyToggle";
import { useFavorites } from "@/hooks/use-favorites";
import type { Currency } from "@/hooks/use-currency";

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Flame, BadgeCheck, Trophy, Crown,
};

export function Catalog({
  categories,
  products,
  settings,
  favoritesHook,
  convertPrice,
  currency,
  onToggleCurrency,
}: {
  categories: Category[];
  products: Product[];
  settings?: Settings;
  favoritesHook?: ReturnType<typeof useFavorites>;
  convertPrice?: (rub: number) => { amount: number; symbol: string; formatted: string };
  currency?: Currency;
  onToggleCurrency?: () => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const {
    compareList,
    showCompare,
    setShowCompare,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
  } = useCompare();

  const [sort, setSort] = useState<SortOption>("default");
  const [filters, setFilters] = useState<FilterState>({
    categories: new Set(),
    minPrice: "",
    maxPrice: "",
    hasMonetization: false,
    hasDiscount: false,
  });

  const handleAddToCompare = (p: Product) => {
    const result = addToCompare(p);
    if (result.error) alert(result.error);
  };

  // Apply filters + sort
  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Filter by categories
    if (filters.categories.size > 0) {
      result = result.filter((p) => filters.categories.has(p.categoryId));
    }

    // Filter by price
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      result = result.filter((p) => p.price >= min);
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter((p) => p.price <= max);
    }

    // Filter by monetization
    if (filters.hasMonetization) {
      result = result.filter((p) => {
        try {
          const meta = p.metadata ? JSON.parse(p.metadata) : {};
          return meta.monetization === true;
        } catch {
          return false;
        }
      });
    }

    // Filter by discount
    if (filters.hasDiscount) {
      result = result.filter((p) => p.oldPrice && p.oldPrice > p.price);
    }

    // Sort
    const orderMap = new Map(categories.map((c, i) => [c.id, i]));
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "views-desc":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Default: by category order, featured first
        result.sort((a, b) => {
          const orderA = orderMap.get(a.categoryId) ?? 999;
          const orderB = orderMap.get(b.categoryId) ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    return result;
  }, [products, categories, filters, sort]);

  return (
    <section
      id="catalog"
      className="relative py-10 md:py-14 scroll-mt-20"
      aria-label="Каталог аккаунтов"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#BFFF00]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_01"}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            <span className="text-foreground">Каталог </span>
            <span className="text-gradient-neon">аккаунтов</span>
          </h2>
          <p className="text-[#888] text-sm md:text-base mt-2 font-mono">
            &gt; Готовые аккаунты с живыми подписчиками. Все проверены.
          </p>
        </motion.div>

        {/* Currency toggle + found count */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono uppercase text-[#888]">
            {"// НАЙДЕНО: "}<span className="text-[#BFFF00] font-black">{filteredAndSorted.length}</span> ИЗ {products.length}
          </div>
        </div>

        {/* Filters + Sort + Currency bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6 relative">
          <FiltersBar
            categories={categories}
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />
          {currency && onToggleCurrency && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[10px] font-mono uppercase text-[#888]">Валюта:</span>
              <CurrencyToggle currency={currency} onToggle={onToggleCurrency} />
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
        >
          {filteredAndSorted.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onClick={() => setSelectedProduct(product)}
              onAddToCompare={handleAddToCompare}
              isInCompare={isInCompare(product.id)}
              isFavorite={favoritesHook?.isFavorite(product.id) || false}
              onToggleFavorite={(p) => favoritesHook?.toggleFavorite(p)}
              convertPrice={convertPrice}
            />
          ))}
        </motion.div>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-16 text-[#888] font-mono">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>&gt; Нет товаров по выбранным фильтрам</p>
            <button
              onClick={() => setFilters({ categories: new Set(), minPrice: "", maxPrice: "", hasMonetization: false, hasDiscount: false })}
              className="mt-3 text-[#BFFF00] text-xs font-mono uppercase hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        settings={settings}
        onSwitchProduct={(p) => setSelectedProduct(p)}
      />

      <CompareBar
        products={compareList}
        categories={categories}
        onRemove={removeFromCompare}
        onClear={clearCompare}
        onOpen={() => setShowCompare(true)}
      />

      <CompareModal
        products={compareList}
        categories={categories}
        open={showCompare}
        onClose={() => setShowCompare(false)}
      />
    </section>
  );
}

function ProductCard({
  product,
  index,
  onClick,
  onAddToCompare,
  isInCompare,
  isFavorite,
  onToggleFavorite,
  convertPrice,
}: {
  product: Product;
  index: number;
  onClick: () => void;
  onAddToCompare: (p: Product) => void;
  isInCompare: boolean;
  isFavorite: boolean;
  onToggleFavorite: (p: Product) => void;
  convertPrice?: (rub: number) => { amount: number; symbol: string; formatted: string };
}) {
  const badges = parseBadges(product.badges);
  const meta = product.metadata ? JSON.parse(product.metadata) : {};
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const accentColor = product.category ? PLATFORM_COLORS[product.category.platform] : "#BFFF00";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      onClick={onClick}
      className="group relative text-left bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#BFFF00] hover-press transition-all overflow-hidden"
      style={{
        clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
      }}
      aria-label={`Купить ${product.title}`}
    >
      {/* Image — fixed aspect ratio, always fills container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden border-b-2 border-[#2A2A2A] group-hover:border-[#BFFF00] transition-colors bg-[#1A1A1A]">
        {product.category ? (
          <ProductImage
            platform={product.category.platform}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
            <Music2 className="w-12 h-12 text-[#888]/30" />
          </div>
        )}

        {/* Favorite button — top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all hover:scale-110"
          aria-label="В избранное"
        >
          <Heart
            className="w-4 h-4"
            fill={isFavorite ? "#FF2D87" : "none"}
            stroke={isFavorite ? "#FF2D87" : "#888"}
            strokeWidth={2.5}
          />
        </button>

        {/* Discount */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#FF2D87] text-white text-xs font-black px-2 py-1 font-mono">
            −{discount}%
          </div>
        )}

        {/* Badges */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {badges.map((b) => {
            const badge = BADGE_LABELS[b];
            if (!badge) return null;
            const Icon = BADGE_ICONS[badge.icon] || BadgeCheck;
            return (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase border bg-black/80 backdrop-blur-sm font-mono"
                style={{ color: badge.color, borderColor: badge.color }}
              >
                <Icon className="w-2.5 h-2.5" style={{ color: badge.color }} />
                {badge.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {product.followers && (
          <div className="flex items-center gap-1.5 text-xs text-[#888] mb-2 font-mono">
            <Users className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={2.5} />
            <span className="font-semibold" style={{ color: accentColor }}>{product.followers}</span>
          </div>
        )}

        <h3 className="font-semibold text-sm md:text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] tracking-tight">
          {product.title}
        </h3>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {meta.country && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] font-mono">
              {meta.country}
            </span>
          )}
          {meta.age && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] font-mono">
              {meta.age}
            </span>
          )}
          {meta.monetization && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#BFFF00]/10 border border-[#BFFF00]/40 text-[#BFFF00] font-mono font-semibold flex items-center gap-1">
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
              Монетизация
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-2 pt-3 border-t-2 border-[#1F1F1F]">
          <div className="flex flex-col min-h-[2.5rem] justify-end">
            {product.oldPrice && (
              <span className="text-xs text-[#888] line-through font-mono">
                {convertPrice ? convertPrice(product.oldPrice).formatted : formatPrice(product.oldPrice, product.currency)}
              </span>
            )}
            <span className="text-lg md:text-xl font-bold text-[#BFFF00] font-mono">
              {convertPrice ? convertPrice(product.price).formatted : formatPrice(product.price, product.currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCompare(product);
              }}
              className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${
                isInCompare
                  ? "bg-[#00F0FF] text-black border-[#00F0FF]"
                  : "bg-[#1A1A1A] text-[#00F0FF] border-[#2A2A2A] hover:border-[#00F0FF]"
              }`}
              aria-label="Сравнить"
              title="Добавить к сравнению"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3l4 4-4 4"/>
                <path d="M20 7H8"/>
                <path d="M8 21l-4-4 4-4"/>
                <path d="M4 17h12"/>
              </svg>
            </button>
            <div className="px-4 py-2 bg-[#BFFF00] text-black text-xs font-bold uppercase flex items-center gap-1.5 group-hover:bg-[#FF2D87] group-hover:text-white transition-colors font-mono">
              Купить
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
