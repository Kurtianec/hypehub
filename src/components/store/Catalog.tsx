"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Music2, Youtube, Users, Instagram, Send, Tag,
  Flame, BadgeCheck, Trophy, Crown, Check, Heart,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import type { Category, Product, Settings } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice, parseBadges, BADGE_LABELS } from "@/lib/types";
import { ProductModal } from "./ProductModal";
import { ProductImage } from "./ProductImage";
import { PlatformLogos } from "./PlatformLogos";
import { CompareBar, CompareModal, useCompare } from "./Compare";
import { FiltersBar, type SortOption, type FilterState } from "./FiltersBar";
import { CurrencyToggle } from "./CurrencyToggle";
import { CatalogSkeleton } from "./Skeletons";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
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
  const [currentPage, setCurrentPage] = useState(1);
  // Items per page: 12 = 3 rows × 4 cols (desktop) or 6 = 3 rows × 2 cols (mobile)
  const PAGE_SIZE_DESKTOP = 12;
  const PAGE_SIZE_MOBILE = 6;
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP);

  // Detect viewport for responsive page size
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setPageSize(window.innerWidth >= 640 ? PAGE_SIZE_DESKTOP : PAGE_SIZE_MOBILE);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleAddToCompare = (p: Product) => {
    const result = addToCompare(p);
    if (result.error) {
      toast({ title: "Максимум 4 товара", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Добавлено к сравнению", description: p.title });
    }
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

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = filteredAndSorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <section
      id="catalog"
      className="relative py-10 md:py-14 scroll-mt-20"
      aria-label="Каталог аккаунтов"
    >
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-1.5">Каталог аккаунтов</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Готовые аккаунты с живыми подписчиками. Все проверены.</p>
        </motion.div>

        {/* Скелетоны при загрузке */}
        {products.length === 0 ? (
          <CatalogSkeleton count={8} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[var(--muted-foreground)]">Найдено: <span className="font-semibold text-[var(--foreground)]">{filteredAndSorted.length}</span> из {products.length}</span>
              {totalPages > 1 && (
                <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                  Стр. {safePage} / {totalPages}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6 relative">
              <FiltersBar categories={categories} filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} />
              {currency && onToggleCurrency && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-[var(--muted-foreground)]">Валюта:</span>
                  <CurrencyToggle currency={currency} onToggle={onToggleCurrency} />
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
            >
              {pagedProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={(safePage - 1) * pageSize + i}
                  onClick={() => setSelectedProduct(product)}
                  onAddToCompare={handleAddToCompare}
                  isInCompare={isInCompare(product.id)}
                  isFavorite={favoritesHook?.isFavorite(product.id) || false}
                  onToggleFavorite={(p) => {
                    const wasFav = favoritesHook?.isFavorite(p.id) ?? false;
                    favoritesHook?.toggleFavorite(p);
                    toast({
                      title: wasFav ? "Удалено из избранного" : "Добавлено в избранное",
                      description: p.title,
                    });
                  }}
                  convertPrice={convertPrice}
                />
              ))}
            </motion.div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    if (typeof window !== "undefined") {
                      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  disabled={safePage <= 1}
                  className="w-10 h-10 flex items-center justify-center border-2 border-[var(--border)] hover:border-[#BFFF00] disabled:opacity-30 disabled:hover:border-[var(--border)] transition-colors rounded-lg"
                  aria-label="Предыдущая страница"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and neighbors
                    const isNearCurrent = Math.abs(page - safePage) <= 1;
                    const isFirstOrLast = page === 1 || page === totalPages;
                    if (!isNearCurrent && !isFirstOrLast) {
                      // Show ellipsis only once per gap
                      if (page === 2 || page === totalPages - 1) return null;
                      if (page > 2 && page < safePage - 1) {
                        return page === safePage - 2 ? <span key={`gap1-${page}`} className="text-[var(--muted-foreground)] px-1">…</span> : null;
                      }
                      if (page < totalPages - 1 && page > safePage + 1) {
                        return page === safePage + 2 ? <span key={`gap2-${page}`} className="text-[var(--muted-foreground)] px-1">…</span> : null;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          if (typeof window !== "undefined") {
                            document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className={
                          "w-10 h-10 flex items-center justify-center font-bold text-sm border-2 transition-colors rounded-lg " +
                          (page === safePage
                            ? "bg-[#BFFF00] text-black border-[#BFFF00]"
                            : "border-[var(--border)] hover:border-[#BFFF00]")
                        }
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    if (typeof window !== "undefined") {
                      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  disabled={safePage >= totalPages}
                  className="w-10 h-10 flex items-center justify-center border-2 border-[var(--border)] hover:border-[#BFFF00] disabled:opacity-30 disabled:hover:border-[var(--border)] transition-colors rounded-lg"
                  aria-label="Следующая страница"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {filteredAndSorted.length === 0 && (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Нет товаров по выбранным фильтрам</p>
                <button
                  onClick={() => setFilters({ categories: new Set(), minPrice: "", maxPrice: "", hasMonetization: false, hasDiscount: false })}
                  className="mt-3 text-[var(--primary)] text-sm hover:underline"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </>
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
      {/* Image — photo in circle with decorative background */}
      <div className="relative w-full aspect-[16/9] overflow-hidden border-b-2 border-[#2A2A2A] group-hover:border-[#BFFF00] transition-colors">
        {/* Background — blurred photo as backdrop */}
        {product.image ? (
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-40"
          />
        ) : null}

        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at center, ${accentColor}15, transparent 70%)` }}
        />

        {/* Dotted pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Circular photo — centered, scales on hover */}
        <div className="absolute inset-0 flex items-center justify-center">
          {product.image ? (
            <div className="relative group-hover:scale-110 transition-transform duration-300">
              {/* Photo circle */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2" style={{ borderColor: accentColor }}>
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          ) : product.category ? (
            <ProductImage platform={product.category.platform} className="group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <Music2 className="w-12 h-12 text-[#888]/30" />
          )}
        </div>

        {/* Favorite button — top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
            // Flying heart animation
            const btn = e.currentTarget;
            const heart = document.createElement('div');
            heart.innerHTML = '♥';
            heart.style.cssText = `position:fixed;left:${btn.getBoundingClientRect().left+12}px;top:${btn.getBoundingClientRect().top}px;font-size:20px;color:#FF2D87;pointer-events:none;z-index:9999;transition:all 0.8s cubic-bezier(0.16,1,0.3,1);`;
            document.body.appendChild(heart);
            requestAnimationFrame(() => {
              const target = document.querySelector('[aria-label="Избранное"]') as HTMLElement;
              if (target) {
                const rect = target.getBoundingClientRect();
                heart.style.left = rect.left + 12 + 'px';
                heart.style.top = rect.top + 4 + 'px';
                heart.style.opacity = '0';
                heart.style.transform = 'scale(0.3)';
              }
            });
            setTimeout(() => heart.remove(), 800);
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all hover:scale-110 rounded-full"
          aria-label="В избранное"
        >
          <Heart
            className="w-4 h-4 transition-transform"
            fill={isFavorite ? "#FF2D87" : "none"}
            stroke={isFavorite ? "#FF2D87" : "#888"}
            strokeWidth={2.5}
            style={isFavorite ? { transform: 'scale(1.2)' } : {}}
          />
        </button>

        {/* Discount — top-left */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#FF2D87] text-white text-xs font-black px-2 py-1 font-mono">
            −{discount}%
          </div>
        )}

        {/* Platform logo — bottom-left, original SVG */}
        {product.category && (() => {
          const Logo = PlatformLogos[product.category.platform];
          return Logo ? (
            <div className="absolute bottom-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentColor }}>
              <Logo size={18} className="text-white" />
            </div>
          ) : null;
        })()}

        {/* New / Hit badge — bottom-right */}
        {badges.includes("new") && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#0969DA] text-white text-[10px] font-bold">
            New
          </div>
        )}
        {badges.includes("hit") && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#FF2D87] text-white text-[10px] font-bold">
            Хит
          </div>
        )}
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
          {meta.theme && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] font-mono">
              {meta.theme}
            </span>
          )}
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
