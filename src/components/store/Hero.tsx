"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  const openCatalog = () => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-[520px] w-[620px] rounded-full bg-[#6675ff]/15 blur-[150px]" />
        <div className="absolute -right-24 top-20 h-[420px] w-[520px] rounded-full bg-[#25c2d9]/10 blur-[150px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-kicker mb-7 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Digital account marketplace
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 }} className="text-balance text-4xl font-black leading-[1.04] tracking-[-.045em] md:text-7xl lg:text-[82px]">
            Цифровые активы<br/><span className="hero-gradient">для быстрого старта</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Подбирайте готовые аккаунты социальных платформ, оплачивайте удобным способом и отслеживайте каждый этап сделки в личном кабинете.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={openCatalog} className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-7 text-sm font-bold">
              Смотреть каталог <ArrowRight className="h-4 w-4" />
            </button>
            <a href="/account" className="btn-secondary inline-flex h-12 items-center justify-center px-7 text-sm font-semibold">Мои заказы</a>
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
  return <div className="trust-card flex items-center justify-center gap-2 px-3 py-3 text-[11px] text-muted-foreground"><Icon className="h-3.5 w-3.5 text-[#7c8cff]"/><span>{text}</span></div>;
}
