"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice } from "@/lib/types";

interface SearchBarProps {
  products?: Product[];
  categories?: { id: string; name: string; platform: string }[];
  onProductClick?: (p: Product) => void;
}

export function SearchBar({ products: initialProducts, categories, onProductClick }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced server-side search
  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    // If we have initialProducts (already loaded on page), use client-side filter first for instant results
    if (initialProducts && initialProducts.length > 0) {
      const local = initialProducts
        .filter((p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.description.toLowerCase().includes(q.toLowerCase()) ||
          (p.category?.name || "").toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 8);
      setResults(local);
      setLoading(false);
      return;
    }

    // Fallback: fetch from API (for pages without preloaded products like /account)
    setLoading(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }
    // If using client-side filter, no debounce needed (instant)
    if (initialProducts && initialProducts.length > 0) {
      performSearch(query);
    } else {
      // Server search: debounce 300ms
      setLoading(true);
      debounceRef.current = setTimeout(() => performSearch(query), 300);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch, initialProducts]);

  const cat = (p: Product) => categories?.find((c) => c.id === p.categoryId);

  const handleResultClick = (p: Product) => {
    if (onProductClick) {
      onProductClick(p);
    } else {
      // Fallback: redirect to home and open product (stored in sessionStorage)
      sessionStorage.setItem("hypehub_open_product", p.id);
      window.location.href = "/?open=" + p.id;
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Search icon button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] flex items-center justify-center transition-colors relative z-10"
        aria-label="Поиск"
      >
        {open ? (
          <X className="w-4 h-4 text-[#888]" strokeWidth={2.5} />
        ) : (
          <Search className="w-4 h-4 text-[#888] group-hover:text-[#BFFF00]" strokeWidth={2.5} />
        )}
      </button>

      {/* Search dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-[340px] md:w-[420px] bg-[#0E0E0E] border-2 border-[#BFFF00] z-[100] overflow-hidden shadow-2xl"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
          >
            {/* Input */}
            <div className="relative border-b-2 border-[#1F1F1F]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Поиск по названию, описанию, платформе..."
                className="w-full bg-transparent pl-10 pr-10 py-3.5 text-sm font-mono text-foreground placeholder:text-[#888] focus:outline-none"
              />
              {loading && (
                <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BFFF00] animate-spin" />
              )}
              {query && !loading && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-foreground"
                  aria-label="Очистить"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto">
              {query.trim().length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#888] mb-3">
                    {"// ВВЕДИТЕ_ЗАПРОС"}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {["TikTok", "YouTube", "VK", "10K", "100K", "монетизация"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-2.5 py-1 border border-[#2A2A2A] text-[10px] text-[#888] font-mono uppercase hover:border-[#BFFF00] hover:text-[#BFFF00] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="p-8 text-center text-[#888] font-mono text-sm">
                  &gt; Ничего не найдено по запросу «{query}»
                </div>
              ) : results.length === 0 && loading ? (
                <div className="p-8 text-center text-[#888] font-mono text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Поиск...
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#888]">
                    {"// НАЙДЕНО: "}{results.length}
                  </div>
                  {results.map((p) => {
                    const c = cat(p);
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleResultClick(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                      >
                        <div
                          className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-2 font-mono font-black text-xs text-white"
                          style={{
                            background: c ? PLATFORM_COLORS[c.platform] : "#888",
                            borderColor: c ? PLATFORM_COLORS[c.platform] : "#888",
                          }}
                        >
                          {c?.name.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate uppercase tracking-tight group-hover:text-[#BFFF00] transition-colors">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-[#888] font-mono">{p.followers || c?.name}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-black text-[#BFFF00] font-mono">
                            {formatPrice(p.price, p.currency)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#888] group-hover:text-[#BFFF00] transition-colors" strokeWidth={2.5} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
