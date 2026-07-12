"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ArrowRight, Trash2 } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice } from "@/lib/types";

interface FavoritesBarProps {
  favorites: Product[];
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onProductClick: (p: Product) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function FavoritesBar({
  favorites,
  categories,
  open,
  onClose,
  onProductClick,
  onRemove,
  onClear,
}: FavoritesBarProps) {
  const cat = (p: Product) => categories.find((c) => c.id === p.categoryId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20"
        >
          <div className="absolute inset-0 bg-black/80" onClick={onClose} />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-[#0E0E0E] border-2 border-[#FF2D87] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#1F1F1F] bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FF2D87] flex items-center justify-center border-2 border-[#FF2D87]">
                  <Heart className="w-4 h-4 text-white" fill="white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-black uppercase tracking-tight text-sm">ИЗБРАННОЕ</div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">
                    {"// "}{favorites.length} ТОВАРОВ
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {favorites.length > 0 && (
                  <button
                    onClick={onClear}
                    className="w-8 h-8 hover:bg-[#FF3333]/10 flex items-center justify-center text-[#FF3333]"
                    aria-label="Очистить"
                    title="Очистить всё"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 hover:bg-white/10 flex items-center justify-center"
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3">
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-10 h-10 mx-auto mb-3 text-[#888]/30" strokeWidth={2} />
                  <p className="text-sm text-[#888] font-mono uppercase">&gt; Список пуст</p>
                  <p className="text-xs text-[#888] mt-2 font-mono">Нажмите ♥ на товаре, чтобы добавить</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((p) => {
                    const c = cat(p);
                    return (
                      <div
                        key={p.id}
                        className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#FF2D87] p-3 transition-colors group"
                        style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 font-mono font-black text-xs text-white"
                            style={{
                              background: c ? PLATFORM_COLORS[c.platform] : "#888",
                              borderColor: c ? PLATFORM_COLORS[c.platform] : "#888",
                            }}
                          >
                            {c?.name.charAt(0) || "?"}
                          </div>
                          <button
                            onClick={() => {
                              onProductClick(p);
                              onClose();
                            }}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="text-xs font-bold truncate uppercase tracking-tight group-hover:text-[#FF2D87] transition-colors">
                              {p.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-black text-[#BFFF00] font-mono">
                                {formatPrice(p.price, p.currency)}
                              </span>
                              {p.followers && (
                                <span className="text-[10px] text-[#888] font-mono">{p.followers}</span>
                              )}
                            </div>
                          </button>
                          <button
                            onClick={() => onRemove(p.id)}
                            className="w-7 h-7 flex-shrink-0 hover:bg-[#FF3333]/10 flex items-center justify-center text-[#FF3333]"
                            aria-label="Убрать из избранного"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
