"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/hooks/use-locale";

export function LanguageToggle({
  locale,
  onToggle,
}: {
  locale: Locale;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-10 h-10 border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] flex items-center justify-center transition-colors font-mono text-xs font-black"
      aria-label="Switch language"
      title={locale === "ru" ? "Switch to English" : "Переключить на русский"}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={locale}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className={locale === "ru" ? "text-[#BFFF00]" : "text-[#00F0FF]"}
        >
          {locale === "ru" ? "RU" : "EN"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
