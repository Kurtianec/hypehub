"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useABTest } from "@/hooks/use-ab-test";

export function Hero() {
  const subtitleVariant = useABTest("hero_subtitle", [
    "ハイпハブ // CYBER MARKET",
    "ハイпハブ // АККАУНТЫ СОЦСЕТЕЙ",
    "ハイпハб // МГНОВЕННАЯ ВЫДАЧА",
  ]);

  const taglineVariant = useABTest("hero_tagline", [
    "> Готовые аккаунты TikTok, YouTube, VK с живой аудиторией.",
    "> Купи готовый аккаунт с подписчиками за 2 минуты.",
    "> Проверенные аккаунты соцсетей с гарантией.",
  ]);
  return (
    <section className="relative pt-28 md:pt-32 pb-4 overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#BFFF00]/10 blur-[120px] rounded-full" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#FF2D87]/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Terminal badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-[#BFFF00] bg-[#0E0E0E] text-xs md:text-sm font-mono uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full bg-[#BFFF00] opacity-75 blink"></span>
                <span className="relative inline-flex h-2 w-2 bg-[#BFFF00]"></span>
              </span>
              <span className="text-[#BFFF00]">[SYSTEM]</span>
              <span className="text-foreground">Маркетплейс №1 для соцсетей</span>
              <span className="px-1.5 py-0.5 bg-[#FF2D87] text-white text-[10px] font-black">2026</span>
            </div>
          </motion.div>

          {/* Katakana subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#FF2D87] font-mono text-sm md:text-base tracking-[0.4em] uppercase mb-1"
          >
            {subtitleVariant}
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm md:text-base text-[#888] max-w-xl mx-auto mb-6 font-mono"
          >
            {taglineVariant}
            <br />
            &gt; Оплата криптой: <span className="text-[#F7931A] font-bold">BTC</span>, <span className="text-[#26A17B] font-bold">USDT</span>, <span className="text-[#0098EA] font-bold">TON</span>. <span className="text-[#BFFF00]">Мгновенная выдача.</span>
          </motion.p>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 flex flex-col items-center gap-1 text-xs text-[#888] font-mono uppercase"
          >
            <span>&gt; Каталог ниже</span>
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ArrowDown className="w-4 h-4 text-[#BFFF00]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
