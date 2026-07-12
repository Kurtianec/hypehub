"use client";

import { motion } from "framer-motion";
import {
  MousePointerClick, Search, CreditCard, Download, ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "ВЫБОР",
    description: "Просмотрите каталог, выберите аккаунт по платформе, подписчикам и цене. Все проверены и готовы к передаче.",
    color: "#BFFF00",
    code: "01",
  },
  {
    icon: MousePointerClick,
    title: "ОФОРМЛЕНИЕ",
    description: "Нажмите «Купить», укажите email и контакт. Выберите оплату — криптовалюта.",
    color: "#FF2D87",
    code: "02",
  },
  {
    icon: CreditCard,
    title: "ОПЛАТА",
    description: "Переведите сумму на криптокошелёк (BTC/USDT/TON). Анонимно, без проверок.",
    color: "#FFE600",
    code: "03",
  },
  {
    icon: Download,
    title: "ДОСТАВКА",
    description: "Мгновенно получаете .txt с логином, паролем и инструкцией. Файл в модалке и на email.",
    color: "#00F0FF",
    code: "04",
  },
];

export function HowToBuy() {
  return (
    <section
      id="how-to-buy"
      className="relative py-12 md:py-20 scroll-mt-20"
      aria-label="Как купить аккаунт"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#FF2D87]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_02"}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            <span className="text-foreground">Как </span>
            <span className="text-gradient-neon">купить</span>
          </h2>
          <p className="text-[#888] text-sm md:text-base mt-2 font-mono">
            &gt; От выбора до получения — менее 2 минут. Всё автоматизировано.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div
                className="relative bg-[#121212] border-2 p-5 md:p-6 h-full hover-press transition-all"
                style={{
                  borderColor: `${step.color}40`,
                  clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                }}
              >
                {/* Big code number */}
                <div
                  className="absolute top-2 right-3 text-5xl font-black opacity-15 font-mono"
                  style={{ color: step.color }}
                >
                  {step.code}
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-4 border-2"
                  style={{ background: `${step.color}20`, borderColor: step.color }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} strokeWidth={2.5} />
                </div>

                {/* Step label */}
                <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: step.color }}>
                  STEP_{step.code}
                </div>

                <h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm text-[#888] leading-relaxed font-mono">
                  {step.description}
                </p>
              </div>

              {/* Arrow between */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5" style={{ color: step.color }} strokeWidth={3} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:mt-12"
        >
          <button
            onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors hover-press font-mono tracking-wide"
          >
            Выбрать аккаунт
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
