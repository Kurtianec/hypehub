"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Currency } from "@/hooks/use-currency";

export function CurrencyToggle({
  currency,
  onToggle,
  compact = false,
}: {
  currency: Currency;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] transition-colors font-mono",
        compact ? "text-[10px] px-1 py-0.5" : "text-xs px-2 py-1.5"
      )}
      aria-label="Переключить валюту"
      title="Переключить валюту"
    >
      <span className={currency === "RUB" ? "text-[#BFFF00] font-black" : "text-[#888]"}>₽</span>
      <span className="text-[#888] mx-0.5">/</span>
      <span className={currency === "USDT" ? "text-[#BFFF00] font-black" : "text-[#888]"}>USDT</span>
    </button>
  );
}
