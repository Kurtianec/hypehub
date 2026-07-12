"use client";

import { motion } from "framer-motion";
import {
  Zap, Shield, Bitcoin, Headphones, RefreshCw, Star,
  Lock, Clock, Globe,
} from "lucide-react";

const ADVANTAGES = [
  { icon: Zap, title: "Мгновенная выдача", description: "Данные аккаунта приходят сразу после подтверждения оплаты. Без ожиданий, без переписок с менеджером.", color: "#BFFF00" },
  { icon: Bitcoin, title: "Только крипта", description: "Принимаем BTC, USDT TRC-20, TON. Полная анонимность, без проверки личности.", color: "#FF7A00" },
  { icon: Shield, title: "Гарантия 14 дней", description: "На каждый аккаунт — гарантия. Если в течение срока проблемы с доступом, заменим или вернём деньги.", color: "#00F0FF" },
  { icon: Headphones, title: "Поддержка 24/7", description: "Живой чат техподдержки и AI-ассистент. Помогаем с входом, безопасностью и монетизацией.", color: "#FF2D87" },
  { icon: RefreshCw, title: "Проверенные аккаунты", description: "Все аккаунты проходят проверку. Живые подписчики, реальная активность, без ботов.", color: "#FFE600" },
  { icon: Lock, title: "Безопасная сделка", description: "Данные передаются в зашифрованном виде. Смените пароль и включите 2FA — инструкция в файле.", color: "#A855F7" },
  { icon: Clock, title: "Экономия времени", description: "Не нужно месяцами накручивать подписчиков. Готовый аккаунт с аудиторией — сразу в работу.", color: "#10B981" },
  { icon: Globe, title: "Под любые задачи", description: "От 1K до 100K+ подписчиков. Для стримов, рекламы, монетизации, перепродажи.", color: "#EC4899" },
];

export function Advantages({ settings }: { settings?: { stats_clients?: string; stats_accounts?: string; stats_rating?: string; stats_support?: string } }) {
  return (
    <section
      id="advantages"
      className="relative py-12 md:py-20 scroll-mt-20"
      aria-label="Преимущества ХайпХаб"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#FFE600]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_03"}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            <span className="text-foreground">Наши </span>
            <span className="text-gradient-neon">преимущества</span>
          </h2>
          <p className="text-[#888] text-sm md:text-base mt-2 font-mono">
            &gt; Современный сервис уровня TikTok, YouTube и VK.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ADVANTAGES.map((adv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              className="group relative bg-[#121212] border-2 border-[#2A2A2A] hover:border-[current] p-5 md:p-6 hover-press transition-all"
              style={{
                clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                color: adv.color,
              }}
            >
              {/* Big index number */}
              <div className="absolute top-2 right-3 text-4xl font-black opacity-10 font-mono" style={{ color: adv.color }}>
                {String(i + 1).padStart(2, "0")}
              </div>

              <div
                className="w-11 h-11 flex items-center justify-center mb-4 border-2 group-hover:scale-110 transition-transform"
                style={{ background: `${adv.color}20`, borderColor: adv.color }}
              >
                <adv.icon className="w-5 h-5" style={{ color: adv.color }} strokeWidth={2.5} />
              </div>

              <h3 className="font-black text-base mb-2 uppercase tracking-tight text-foreground">{adv.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed font-mono">
                {adv.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 md:mt-12 bg-[#0E0E0E] border-2 border-[#BFFF00] p-5 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center"
          style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
        >
          {[
            { value: settings?.stats_clients || "12 800+", label: "КЛИЕНТОВ", color: "#BFFF00" },
            { value: settings?.stats_accounts || "5 200+", label: "ПРОДАНО", color: "#FF2D87" },
            { value: `${settings?.stats_rating || "4.9"}/5`, label: "РЕЙТИНГ", color: "#FFE600" },
            { value: settings?.stats_support || "24/7", label: "ПОДДЕРЖКА", color: "#00F0FF" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-xl md:text-3xl font-black mb-1 font-mono" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[10px] md:text-xs text-[#888] font-mono uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
