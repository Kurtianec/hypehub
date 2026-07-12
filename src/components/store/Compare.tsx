"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, X, Check, Minus } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice, parseBadges, BADGE_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";

const COMPARE_KEY = "hypehub_compare";

export function CompareButton({
  product,
  onAdd,
  isActive,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd(product);
      }}
      className={`absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center border-2 transition-all ${
        isActive
          ? "bg-[#00F0FF] text-black border-[#00F0FF]"
          : "bg-black/80 backdrop-blur-sm text-[#00F0FF] border-[#00F0FF]/40 hover:border-[#00F0FF]"
      }`}
      aria-label="Добавить к сравнению"
      title="Сравнить"
    >
      <GitCompare className="w-3.5 h-3.5" strokeWidth={2.5} />
      {isActive && <Check className="w-3 h-3 absolute" strokeWidth={3} />}
    </button>
  );
}

export function CompareBar({
  products,
  categories,
  onRemove,
  onClear,
  onOpen,
}: {
  products: Product[];
  categories: Category[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-24 md:w-auto z-30"
    >
      <div
        className="bg-[#0E0E0E] border-2 border-[#00F0FF] p-3 flex items-center gap-3"
        style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
      >
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#00F0FF] flex-shrink-0">
          <GitCompare className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden md:inline">СРАВНЕНИЕ:</span>
          <span className="bg-[#00F0FF] text-black px-1.5 py-0.5 font-black">{products.length}</span>
        </div>
        <div className="flex gap-1.5 flex-1 overflow-x-auto no-scrollbar max-w-md">
          {products.map((p) => (
            <div key={p.id} className="flex-shrink-0 bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 text-[10px] font-mono uppercase flex items-center gap-1">
              <span className="truncate max-w-[80px]">{p.title}</span>
              <button
                onClick={() => onRemove(p.id)}
                className="text-[#FF3333] hover:text-[#FF3333]/70"
                aria-label="Убрать"
              >
                <X className="w-3 h-3" strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
        <Button
          onClick={onOpen}
          size="sm"
          disabled={products.length < 2}
          className="bg-[#00F0FF] text-black hover:bg-[#BFFF00] font-black uppercase border-2 border-[#00F0FF] hover:border-[#BFFF00] font-mono text-xs flex-shrink-0"
        >
          Сравнить
        </Button>
        <button
          onClick={onClear}
          className="text-[#888] hover:text-[#FF3333] flex-shrink-0 p-1"
          aria-label="Очистить"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function CompareModal({
  products,
  categories,
  open,
  onClose,
}: {
  products: Product[];
  categories: Category[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open || products.length === 0) return null;

  const getMeta = (p: Product): Record<string, unknown> => {
    try {
      return p.metadata ? JSON.parse(p.metadata) : {};
    } catch {
      return {};
    }
  };

  const cat = (p: Product) => categories.find((c) => c.id === p.categoryId);
  const badges = (p: Product) => parseBadges(p.badges);

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: "Платформа", render: (p) => cat(p)?.name || "—" },
    { label: "Подписчики", render: (p) => p.followers || "—" },
    { label: "Цена", render: (p) => <span className="font-black text-[#BFFF00]">{formatPrice(p.price, p.currency)}</span> },
    { label: "Старая цена", render: (p) => p.oldPrice ? formatPrice(p.oldPrice, p.currency) : "—" },
    { label: "Скидка", render: (p) => {
      if (!p.oldPrice) return "—";
      const d = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
      return <span className="text-[#FF2D87] font-bold">−{d}%</span>;
    }},
    { label: "Страна", render: (p) => (getMeta(p).country as string) || "—" },
    { label: "Возраст", render: (p) => (getMeta(p).age as string) || "—" },
    { label: "Монетизация", render: (p) => getMeta(p).monetization ? <Check className="w-4 h-4 text-[#BFFF00]" strokeWidth={3} /> : <Minus className="w-4 h-4 text-[#888]" /> },
    { label: "Верификация", render: (p) => getMeta(p).verified ? <Check className="w-4 h-4 text-[#BFFF00]" strokeWidth={3} /> : <Minus className="w-4 h-4 text-[#888]" /> },
    { label: "Часы просмотра", render: (p) => (getMeta(p).watchHours as string) || "—" },
    { label: "Просмотры", render: (p) => String(p.views || 0) },
    { label: "Бейджи", render: (p) => {
      const b = badges(p);
      if (b.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-1 justify-center">
          {b.map((badge) => {
            const bd = BADGE_LABELS[badge];
            return bd ? (
              <span key={badge} className="px-1.5 py-0.5 text-[9px] font-black border"
                style={{ background: `${bd.color}15`, color: bd.color, borderColor: `${bd.color}40` }}>
                {bd.label}
              </span>
            ) : null;
          })}
        </div>
      );
    }},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#0E0E0E] border-2 border-[#00F0FF] w-full max-w-4xl max-h-[85vh] overflow-y-auto"
        style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
      >
        <div className="sticky top-0 bg-[#0E0E0E] border-b-2 border-[#1F1F1F] p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-[#00F0FF]" strokeWidth={2.5} />
            <h2 className="font-black uppercase tracking-tight font-mono text-sm">
              {"// СРАВНЕНИЕ_ТОВАРОВ"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 text-[10px] font-mono uppercase text-[#888] tracking-widest">Характеристика</th>
                {products.map((p) => {
                  const c = cat(p);
                  return (
                    <th key={p.id} className="p-3 text-center min-w-[150px]">
                      <div
                        className="w-8 h-8 mx-auto mb-2 flex items-center justify-center border-2"
                        style={{ background: c ? PLATFORM_COLORS[c.platform] : "#888", borderColor: c ? PLATFORM_COLORS[c.platform] : "#888" }}
                      >
                        <span className="text-white font-black text-xs">{c?.name.charAt(0) || "?"}</span>
                      </div>
                      <div className="font-black text-xs uppercase tracking-tight line-clamp-2">{p.title}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-[#0A0A0A]" : ""}>
                  <td className="p-3 text-[10px] font-mono uppercase text-[#888] tracking-widest">{row.label}</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 text-center font-mono text-sm">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// Hook for compare state
export function useCompare() {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      if (raw) {
        queueMicrotask(() => setCompareList(JSON.parse(raw)));
      }
    } catch {}
  }, []);

  const save = (list: Product[]) => {
    setCompareList(list);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  };

  const addToCompare = (product: Product) => {
    const exists = compareList.find((p) => p.id === product.id);
    if (exists) {
      save(compareList.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 4) {
        return { error: "Максимум 4 товара для сравнения" };
      }
      save([...compareList, product]);
    }
    return { ok: true };
  };

  const removeFromCompare = (id: string) => {
    save(compareList.filter((p) => p.id !== id));
  };

  const clearCompare = () => {
    save([]);
  };

  const isInCompare = (id: string) => compareList.some((p) => p.id === id);

  return {
    compareList,
    showCompare,
    setShowCompare,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
  };
}
