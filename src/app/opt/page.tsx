import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";
import { Package, TrendingUp, Shield, ArrowRight, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Оптовые покупки аккаунтов — скидки до 30% | ХайпХаб",
  description: "Оптовые покупки аккаунтов TikTok, YouTube, VK. Скидки от 10% до 30% при покупке от 3 товаров. Резервирование на 24 часа с предоплатой 10%.",
  keywords: ["опт аккаунты", "оптовые скидки", "резервирование аккаунтов", "оптовые покупки"],
  alternates: { canonical: "https://hypehub.shop/opt" },
};

export default async function OptPage() {
  const settings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const tiers = [
    { count: "3+", discount: "10%", color: "#BFFF00", features: ["Скидка 10% на заказ", "Приоритетная поддержка", "Резерв 24 часа"] },
    { count: "5+", discount: "20%", color: "#FF2D87", features: ["Скидка 20% на заказ", "Персональный менеджер", "Резерв 48 часов", "Помощь с настройкой"] },
    { count: "10+", discount: "30%", color: "#FFE600", features: ["Скидка 30% на заказ", "Эксклюзивные товары", "Безлимитный резерв", "API доступ", "Отложенная оплата"] },
  ];

  return (
    <>
      <VisitorTracker />
      <Header siteName={settingsMap.site_name} />
      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
            <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
            <span className="text-[#BFFF00]">/</span>
            <span className="text-foreground">ОПТ</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#BFFF00]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// B2B"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3">
            <span className="text-gradient-neon">Оптовые скидки</span>
          </h1>
          <p className="text-[#888] text-sm font-mono mb-8">
            &gt; Покупайте больше — платите меньше. Скидки до 30% при оптовых заказах.
          </p>

          {/* Discount tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {tiers.map((t, i) => (
              <div key={i} className="bg-[#121212] border-2 p-5 md:p-6 hover-press transition-all"
                style={{ borderColor: `${t.color}40`, clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
                <div className="text-center mb-4">
                  <div className="text-3xl md:text-4xl font-black font-mono mb-1" style={{ color: t.color }}>
                    {t.discount}
                  </div>
                  <div className="text-xs text-[#888] font-mono uppercase">от {t.count} товаров</div>
                </div>
                <ul className="space-y-2">
                  {t.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-[#888] font-mono">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: t.color }} strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0E0E0E] border-2 border-[#00F0FF] p-5"
              style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-[#00F0FF]" strokeWidth={2.5} />
                <h2 className="font-black uppercase tracking-tight font-mono text-sm text-[#00F0FF]">{"// РЕЗЕРВИРОВАНИЕ"}</h2>
              </div>
              <p className="text-sm text-[#888] font-mono leading-relaxed">
                &gt; Не готовы оплатить сразу? Забронируйте аккаунт на 24 часа с предоплатой всего 10%.
                <br /><br />
                &gt; Остаток суммы — в течение 24 часов. Если не оплатите — бронь снимается, предоплата возвращается.
              </p>
            </div>

            <div className="bg-[#0E0E0E] border-2 border-[#FF2D87] p-5"
              style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-[#FF2D87]" strokeWidth={2.5} />
                <h2 className="font-black uppercase tracking-tight font-mono text-sm text-[#FF2D87]">{"// КАК_РАБОТАЕТ"}</h2>
              </div>
              <ul className="space-y-1.5 text-sm text-[#888] font-mono">
                <li>&gt; Выберите товары в каталоге</li>
                <li>&gt; Нажмите «Резервировать»</li>
                <li>&gt; Оплатите 10% предоплату</li>
                <li>&gt; Доплатите остаток в течение 24ч</li>
                <li>&gt; Получите все аккаунты</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-[#0E0E0E] border-2 border-[#BFFF00] p-6 md:p-8"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <Shield className="w-10 h-10 mx-auto mb-3 text-[#BFFF00]" strokeWidth={2.5} />
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Готовы к оптовой покупке?</h3>
            <p className="text-sm text-[#888] mb-4 font-mono">&gt; Выберите товары в каталоге и оформите оптовый заказ</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors font-mono tracking-wide">
              В каталог <ArrowRight className="w-4 h-4" strokeWidth={3} />
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
