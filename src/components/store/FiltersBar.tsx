"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Check, ArrowDownUp } from "lucide-react";
import type { Category } from "@/lib/types";
import { PLATFORM_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SortOption = "default" | "price-asc" | "price-desc" | "views-desc" | "newest";
export type FilterState = {
  categories: Set<string>;
  minPrice: string;
  maxPrice: string;
  hasMonetization: boolean;
  hasDiscount: boolean;
};

interface FiltersBarProps {
  categories: Category[];
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
}

export function FiltersBar({
  categories,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: FiltersBarProps) {
  const [open, setOpen] = useState(false);

  const toggleCategory = (id: string) => {
    const next = new Set(filters.categories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onFiltersChange({ ...filters, categories: next });
  };

  const reset = () => {
    onFiltersChange({
      categories: new Set(),
      minPrice: "",
      maxPrice: "",
      hasMonetization: false,
      hasDiscount: false,
    });
  };

  const activeCount =
    filters.categories.size +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.hasMonetization ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0);

  return (
    <div className="flex items-center gap-2 relative z-30">
      {/* Sort */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#F7A600] text-xs font-mono uppercase font-bold pl-9 pr-8 py-2.5 cursor-pointer focus:outline-none focus:border-[#F7A600] transition-colors"
        >
          <option value="default">По умолчанию</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
          <option value="views-desc">Популярные</option>
          <option value="newest">Новые</option>
        </select>
        <ArrowDownUp className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F7A600] pointer-events-none" strokeWidth={2.5} />
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#888] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Filters button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 border-2 text-xs font-mono uppercase font-bold transition-colors",
          activeCount > 0
            ? "bg-[#F7A600]/10 text-[#F7A600] border-[#F7A600]/40"
            : "bg-[#121212] text-[#888] border-[#2A2A2A] hover:border-[#F7A600] hover:text-[#F7A600]"
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />
        Фильтры
        {activeCount > 0 && (
          <span className="bg-[#F7A600] text-black px-1.5 py-0.5 text-[9px] font-black">{activeCount}</span>
        )}
      </button>

      {/* Filters dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 w-[340px] bg-[#0E0E0E] border-2 border-[#F7A600] z-[100] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b-2 border-[#1F1F1F]">
                <span className="text-xs font-mono uppercase tracking-widest text-[#F7A600]">{"// ФИЛЬТРЫ"}</span>
                <button onClick={() => setOpen(false)} className="text-[#888] hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Categories */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#888] mb-2">ПЛАТФОРМЫ</div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => {
                      const isActive = filters.categories.has(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleCategory(c.id)}
                          className={cn(
                            "px-2.5 py-1.5 text-[10px] font-bold uppercase border-2 transition-all font-mono",
                            isActive ? "text-black" : "text-[#888] border-[#2A2A2A] hover:border-[#F7A600]"
                          )}
                          style={isActive ? { background: PLATFORM_COLORS[c.platform], borderColor: PLATFORM_COLORS[c.platform] } : {}}
                        >
                          {c.name.replace(" аккаунты", "").replace(" каналы", "").replace(" группы", "")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#888] mb-2">ЦЕНА (₽)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
                      placeholder="от"
                      className="w-full bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#F7A600] px-2 py-1.5 text-xs font-mono"
                    />
                    <span className="text-[#888]">—</span>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
                      placeholder="до"
                      className="w-full bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#F7A600] px-2 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  <button
                    onClick={() => onFiltersChange({ ...filters, hasMonetization: !filters.hasMonetization })}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 border-2 text-xs font-mono uppercase transition-all",
                      filters.hasMonetization
                        ? "bg-[#F7A600]/10 text-[#F7A600] border-[#F7A600]/40"
                        : "text-[#888] border-[#2A2A2A] hover:border-[#F7A600]"
                    )}
                  >
                    С монетизацией
                    {filters.hasMonetization && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                  <button
                    onClick={() => onFiltersChange({ ...filters, hasDiscount: !filters.hasDiscount })}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 border-2 text-xs font-mono uppercase transition-all",
                      filters.hasDiscount
                        ? "bg-[#F7A600]/10 text-[#F7A600] border-[#F7A600]/40"
                        : "text-[#888] border-[#2A2A2A] hover:border-[#F7A600]"
                    )}
                  >
                    Со скидкой
                    {filters.hasDiscount && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                </div>

                {/* Reset */}
                {activeCount > 0 && (
                  <button
                    onClick={reset}
                    className="w-full py-2 text-xs font-mono uppercase text-[#F7A600] hover:bg-[#F7A600]/10 border-2 border-[#F7A600]/30 transition-colors"
                  >
                    Сбросить ({activeCount})
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
