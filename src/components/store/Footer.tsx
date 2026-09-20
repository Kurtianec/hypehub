"use client";

import { Layers3, Mail, Send, Shield, Zap, ShieldCheck, Eye } from "lucide-react";
import type { Settings } from "@/lib/types";

interface FooterProps {
  settings: Settings;
  visitorsToday?: number;
  visitorsTotal?: number;
}

export function Footer({ settings, visitorsToday = 0, visitorsTotal = 0 }: FooterProps) {
  return (
    <footer
      id="footer"
      className="relative mt-auto pt-12 pb-6 px-4 border-t-2 border-[#BFFF00]/40 scroll-mt-20"
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-[#BFFF00] flex items-center justify-center border-2 border-[#BFFF00]">
                <Layers3 className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xl font-black uppercase tracking-tighter">
                  <span className="text-[#BFFF00]">Хайп</span><span className="text-foreground">Хаб</span>
                </div>
                <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">
                  {settings.tagline || "Маркетплейс аккаунтов"}
                </div>
              </div>
            </div>
            <p className="text-sm text-[#888] leading-relaxed max-w-md mb-4 font-mono">
              Маркетплейс готовых аккаунтов соцсетей с живой аудиторией.
              <br />
              Проверка, гарантия и поддержка после покупки. Оплата: <span className="text-[#F7931A]">BTC</span>, <span className="text-[#26A17B]">USDT</span>, <span className="text-[#0098EA]">TON</span>.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["TikTok", "YouTube", "VK", "Instagram", "Telegram"].map((p) => (
                <span key={p} className="px-2 py-1 border border-[#2A2A2A] text-[10px] text-[#888] font-mono uppercase">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h3 className="font-bold text-sm mb-3">Навигация</h3>
            <ul className="space-y-2 text-sm font-mono">
              {[
                { label: "Каталог", href: "#catalog" },
                { label: "Как купить", href: "#how-to-buy" },
                { label: "Преимущества", href: "#advantages" },
                { label: "FAQ", href: "#faq" },
                { label: "Отзывы", href: "/otzyvy", external: true },
                { label: "Блог", href: "/blog", external: true },
                { label: "О нас", href: "/about", external: true },
                { label: "Мои заказы", href: "/account", external: true },
                { label: "Рефералка", href: "/refer", external: true },
                { label: "Опт", href: "/opt", external: true },
              ].map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      className="text-[#888] hover:text-[#BFFF00] transition-colors uppercase"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" })}
                      className="text-[#888] hover:text-[#BFFF00] transition-colors uppercase"
                    >
                      {l.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-bold text-sm mb-3">Контакты</h3>
            <ul className="space-y-3 text-sm font-mono">
              <li>
                <a href={`mailto:${settings.support_email || "support@hypehub.vercel.app"}`}
                   className="flex items-center gap-2 text-[#888] hover:text-[#BFFF00] transition-colors">
                  <Mail className="w-4 h-4" />
                  {settings.support_email || "support@hypehub.vercel.app"}
                </a>
              </li>
              <li>
                <a href={`https://t.me/${(settings.support_telegram || "@hypehub_support").replace("@", "")}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-[#888] hover:text-[#BFFF00] transition-colors">
                  <Send className="w-4 h-4" />
                  {settings.support_telegram || "@hypehub_support"}
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#888]">
                <Shield className="w-4 h-4 text-[#BFFF00]" />
                Гарантия на все товары
              </li>
              <li className="flex items-center gap-2 text-[#888]">
                <Zap className="w-4 h-4 text-[#FF2D87]" />
                Поддержка 24/7
              </li>
            </ul>
          </div>
        </div>

        {/* Compact trust badges row */}
        <div className="footer-trust-row flex flex-wrap items-center justify-center gap-2 mb-4 pt-4 border-t border-[#1F1F1F]">
          {visitorsTotal > 0 && <TrustChip icon={Eye} color="#514BD9" title="Посетители" value={visitorsToday.toLocaleString("ru-RU")} sub={`Всего: ${visitorsTotal.toLocaleString("ru-RU")}`} />}
          <TrustChip icon={ShieldCheck} color="#087F68" title="Защита" value="SSL" sub="Шифрование соединения" />
          <TrustChip icon={Shield} color="#C95322" title="Гарантия" value="14 дней" sub="Обращение из кабинета" />
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-5 border-t-2 border-[#1F1F1F] text-xs text-[#888] font-mono uppercase">
          <p>© 2026 ХАЙПХАБ · ДАННЫЕ ЗАЩИЩЕНЫ</p>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-[#BFFF00] transition-colors">Условия</a>
            <a href="/privacy" className="hover:text-[#BFFF00] transition-colors">Конфиденциальность</a>
            <a href="/about" className="hover:text-[#BFFF00] transition-colors">О нас</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TrustChip({
  icon: Icon,
  color,
  title,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="footer-trust-chip inline-flex items-center gap-2 px-3 py-2 border border-[#2A2A2A] bg-[#0E0E0E]" style={{ "--chip-accent": color } as React.CSSProperties}>
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[10px] text-[#888] font-mono uppercase">{title}:</span>
      <span className="text-[10px] font-black font-mono" style={{ color }}>{value}</span>
      <span className="text-[9px] text-[#888]/70 font-mono uppercase hidden sm:inline">· {sub}</span>
    </div>
  );
}
