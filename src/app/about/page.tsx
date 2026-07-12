import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";
import { Shield, Zap, Bitcoin, Headphones, Award, Globe, Lock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "О нас — ХайпХаб: маркетплейс аккаунтов TikTok, YouTube, VK",
  description:
    "ХайпХаб — современный маркетплейс готовых аккаунтов социальных сетей. Узнайте о нашем сервисе, гарантиях, команде и миссии. Более 12 800 довольных клиентов.",
  keywords: ["о нас хайпхаб", "о компании", "маркетплейс аккаунтов", "hypehub about"],
  alternates: { canonical: "https://hypehub.shop/about" },
  openGraph: {
    title: "О нас — ХайпХаб",
    description: "Маркетплейс готовых аккаунтов социальных сетей с живой аудиторией.",
    url: "https://hypehub.shop/about",
    images: ["/og.png"],
  },
};

export default async function AboutPage() {
  const settings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const values = [
    { icon: Zap, title: "Мгновенная выдача", text: "Данные аккаунта приходят сразу после оплаты. Без ожиданий и переписок.", color: "#BFFF00" },
    { icon: Bitcoin, title: "Анонимная оплата", text: "Криптовалюта. Без проверки личности, безопасно и быстро.", color: "#FF7A00" },
    { icon: Shield, title: "Гарантия до 14 дней", text: "На каждый аккаунт действует гарантия. При проблемах — замена или возврат.", color: "#00F0FF" },
    { icon: Headphones, title: "Поддержка 24/7", text: "Живой чат и AI-ассистент. Помогаем в любое время дня и ночи.", color: "#FF2D87" },
  ];

  const stats = [
    { value: settingsMap.stats_clients || "12 800+", label: "Довольных клиентов", color: "#BFFF00" },
    { value: settingsMap.stats_accounts || "5 200+", label: "Аккаунтов продано", color: "#FF2D87" },
    { value: settingsMap.stats_rating || "4.9", label: "Средний рейтинг", color: "#FFE600" },
    { value: "< 2 мин", label: "Средняя выдача", color: "#00F0FF" },
  ];

  return (
    <>
      <VisitorTracker />
      <Header siteName={settingsMap.site_name} />
      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
            <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
            <span className="text-[#BFFF00]">/</span>
            <span className="text-foreground">О НАС</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#BFFF00]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// ABOUT"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            <span className="text-gradient-neon">О ХайпХаб</span>
          </h1>
          <p className="text-[#888] text-sm md:text-base font-mono mb-8 leading-relaxed">
            &gt; ХайпХаб — это современный маркетплейс готовых аккаунтов социальных сетей.
            Мы помогаем запускать проекты, бренды и каналы без месяцев раскрутки.
            Покупайте проверенные аккаунты с живой аудиторией — мгновенно, безопасно, с гарантией.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {stats.map((s, i) => (
              <div key={i} className="bg-[#121212] border-2 p-4 text-center"
                style={{ borderColor: `${s.color}40`, clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                <div className="text-2xl md:text-3xl font-black font-mono mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {values.map((v, i) => (
              <div key={i} className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[current] p-5 transition-colors"
                style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))", color: v.color }}>
                <div className="w-11 h-11 flex items-center justify-center mb-4 border-2"
                  style={{ background: `${v.color}20`, borderColor: v.color }}>
                  <v.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-base mb-2 uppercase tracking-tight text-foreground">{v.title}</h3>
                <p className="text-sm text-[#888] font-mono leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div className="bg-[#0E0E0E] border-2 border-[#BFFF00] p-6 md:p-8 mb-8"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-[#BFFF00]" strokeWidth={2.5} />
              <h2 className="text-xl font-black uppercase tracking-tight font-mono text-[#BFFF00]">{"// НАША_МИССИЯ"}</h2>
            </div>
            <p className="text-[#888] font-mono leading-relaxed text-sm">
              &gt; Мы верим, что каждый должен иметь возможность запустить свой проект в соцсетях без барьеров.
              Не у всех есть месяцы на раскрутку, не все умеют накручивать подписчиков, не все готовы рисковать с непроверенными продавцами.
              ХайпХаб решает эту проблему: проверенные аккаунты, мгновенная выдача, гарантия, анонимная оплата.
              <br /><br />
              &gt; Мы хотим стать №1 в СНГ для покупки аккаунтов — и делаем для этого всё: от SEO-статей в блоге до 24/7 поддержки.
              Каждый отзыв важен, каждая проблема решается, каждый клиент — на виду.
            </p>
          </div>

          {/* Why us */}
          <div className="bg-[#0E0E0E] border-2 border-[#FF2D87] p-6 md:p-8 mb-8"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-[#FF2D87]" strokeWidth={2.5} />
              <h2 className="text-xl font-black uppercase tracking-tight font-mono text-[#FF2D87]">{"// ПОЧЕМУ_МЫ"}</h2>
            </div>
            <ul className="space-y-2 text-[#888] font-mono text-sm">
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Только проверенные аккаунты с живой аудиторией</li>
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Мгновенная выдача данных после оплаты</li>
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Анонимная оплата криптой </li>
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Гарантия от 24 часов до 14 дней</li>
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Поддержка 24/7 в чате и AI-ассистент</li>
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Более 12 800 довольных клиентов</li>
              <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> SSL-шифрование, защита данных</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center bg-[#0E0E0E] border-2 border-[#00F0FF] p-6 md:p-8"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <Globe className="w-10 h-10 mx-auto mb-3 text-[#00F0FF]" strokeWidth={2.5} />
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Готовы начать?</h3>
            <p className="text-sm text-[#888] mb-4 font-mono">&gt; Выберите аккаунт в каталоге и начните прямо сейчас</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors font-mono tracking-wide">
              В каталог →
            </Link>
          </div>
        </div>
      </main>
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
