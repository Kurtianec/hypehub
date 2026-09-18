"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  const openCatalog = () => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#BFFF00]/[.07] blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#BFFF00]/25 bg-[#BFFF00]/[.06] px-4 py-2 text-xs font-semibold text-[#D9FF75]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#BFFF00]" />
            Проверенные аккаунты социальных сетей
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 }} className="text-balance text-4xl font-black leading-[1.04] tracking-[-.045em] md:text-7xl lg:text-[82px]">
            Готовая аудитория.<br/><span className="text-[#BFFF00]">Без долгой раскрутки.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Аккаунты TikTok, YouTube, VK, Instagram и Telegram. Понятная покупка, безопасная передача данных и поддержка после сделки.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={openCatalog} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#BFFF00] px-7 text-sm font-bold text-black transition hover:bg-[#D0FF42]">
              Смотреть каталог <ArrowRight className="h-4 w-4" />
            </button>
            <a href="/account" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[.035] px-7 text-sm font-semibold transition hover:border-white/25 hover:bg-white/[.06]">Мои заказы</a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .28 }} className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 md:grid-cols-4">
            <Trust icon={BadgeCheck} text="Аккаунты проверены" />
            <Trust icon={ShieldCheck} text="Гарантия 14 дней" />
            <Trust icon={Clock3} text="Выдача после оплаты" />
            <Trust icon={Sparkles} text="Поддержка онлайн" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Trust({ icon: Icon, text }: { icon: React.ComponentType<{className?: string}>; text: string }) {
  return <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-3 text-[11px] text-muted-foreground"><Icon className="h-3.5 w-3.5 text-[#BFFF00]"/><span>{text}</span></div>;
}
