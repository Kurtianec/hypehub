"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, BadgeCheck, Clock3, ShieldCheck, Sparkles } from "lucide-react";

const trust = [
  { icon: BadgeCheck, text: "Проверено вручную" },
  { icon: ShieldCheck, text: "Гарантия 14 дней" },
  { icon: Clock3, text: "Выдача после оплаты" },
];

export function Hero() {
  const openCatalog = () => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="prism-hero" aria-label="Маркетплейс аккаунтов">
      <div className="prism-hero-grid" aria-hidden="true" />
      <motion.div initial={{ opacity: 0, y: 22, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .65, ease: [0.16, 1, 0.3, 1] }} className="prism-hero-shell">
        <div className="prism-hero-copy">
          <div className="prism-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Маркетплейс аккаунтов</div>
          <h1>Нужный аккаунт.<br/><span>Уже готов.</span></h1>
          <p>У нас Вы можете купить проверенные аккаунты социальных платформ — группу ВК, канал YouTube, группу Telegram, страницу Instagram с понятной историей сделки и безопасной выдачей.</p>
        </div>
        <button onClick={openCatalog} className="prism-catalog-jump" aria-label="Перейти к каталогу">
          <span>Смотреть<br/>ассортимент</span><ArrowDownRight className="h-6 w-6" />
        </button>
        <div className="prism-trust-rail">
          {trust.map(({ icon: Icon, text }, index) => (
            <motion.div key={text} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .22 + index * .08 }} className="prism-trust-item">
              <Icon className="h-4 w-4" /><span>{text}</span>
            </motion.div>
          ))}
        </div>
        <div className="prism-orbit prism-orbit-a" aria-hidden="true" />
        <div className="prism-orbit prism-orbit-b" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
