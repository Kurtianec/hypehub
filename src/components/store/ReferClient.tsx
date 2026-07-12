"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gift, Users, TrendingUp, DollarSign, Copy, Check, Share2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function ReferClient() {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ clicks: number; orders: number; earnings: number } | null>(null);
  const { toast } = useToast();

  // Load existing code from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hypehub_ref_code");
    if (saved) {
      setRefCode(saved);
      fetch(`/api/referral?code=${saved}`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.error) setStats({ clicks: d.clicks, orders: d.orders, earnings: d.earnings });
        })
        .catch(() => {});
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.code) {
        setRefCode(data.code);
        localStorage.setItem("hypehub_ref_code", data.code);
        setStats({ clicks: 0, orders: 0, earnings: 0 });
        toast({ title: "Реферальный код создан!" });
      }
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const refLink = refCode ? `${typeof window !== "undefined" ? window.location.origin : "https://hypehub.shop"}/ref/${refCode}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast({ title: "Ссылка скопирована!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ХайпХаб — маркетплейс аккаунтов",
          text: "Покупай аккаунты TikTok, YouTube, VK с живыми подписчиками!",
          url: refLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  return (
    <main className="flex-1 pt-28 md:pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
          <a href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</a>
          <span className="text-[#BFFF00]">/</span>
          <span className="text-foreground">РЕФЕРАЛКА</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#FF2D87]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// REFERRAL"}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3">
          <span className="text-gradient-neon">Реферальная программа</span>
        </h1>
        <p className="text-[#888] text-sm font-mono mb-8">
          &gt; Приглашайте друзей и получайте 10% от каждой их покупки. Навсегда.
        </p>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Gift, title: "1. СОЗДАЙ КОД", text: "Получи уникальный реферальный код", color: "#BFFF00" },
            { icon: Share2, title: "2. ПОДЕЛИСЬ", text: "Отправь ссылку друзьям в Telegram, VK", color: "#FF2D87" },
            { icon: DollarSign, title: "3. ЗАРАБАТЫВАЙ", text: "10% от каждой покупки друга — тебе", color: "#FFE600" },
          ].map((s, i) => (
            <div key={i} className="bg-[#121212] border-2 p-5"
              style={{ borderColor: `${s.color}40`, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <div className="w-10 h-10 flex items-center justify-center mb-3 border-2"
                style={{ background: `${s.color}20`, borderColor: s.color }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} strokeWidth={2.5} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: s.color }}>{s.title}</div>
              <p className="text-sm text-[#888] font-mono">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Generate or show code */}
        {!refCode ? (
          <div className="bg-[#0E0E0E] border-2 border-[#FF2D87] p-6 md:p-8 mb-8"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-[#FF2D87]" strokeWidth={2.5} />
              <h2 className="font-black uppercase tracking-tight font-mono text-sm text-[#FF2D87]">{"// СОЗДАТЬ_КОД"}</h2>
            </div>
            <p className="text-sm text-[#888] font-mono mb-4">
              &gt; Введите email (необязательно), чтобы получать уведомления о начислениях
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com (необязательно)"
                className="bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono"
              />
              <Button
                onClick={generate}
                disabled={loading}
                className="bg-[#FF2D87] text-white hover:bg-[#FF2D87]/80 font-black uppercase border-2 border-[#FF2D87] font-mono tracking-wide"
              >
                {loading ? "..." : "Создать код"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Referral link */}
            <div className="bg-[#0E0E0E] border-2 border-[#BFFF00] p-6 md:p-8 mb-6"
              style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-5 h-5 text-[#BFFF00]" strokeWidth={2.5} />
                <h2 className="font-black uppercase tracking-tight font-mono text-sm text-[#BFFF00]">{"// ТВОЯ_ССЫЛКА"}</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] px-4 py-3 font-mono text-sm text-[#BFFF00] break-all">
                  {refLink}
                </div>
                <Button
                  onClick={copyLink}
                  className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
                >
                  {copied ? <><Check className="w-4 h-4 mr-1.5" strokeWidth={3} /> Скопировано</> : <><Copy className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Копировать</>}
                </Button>
                <Button
                  onClick={shareLink}
                  variant="outline"
                  className="bg-transparent border-2 border-[#2A2A2A] hover:border-[#BFFF00] font-mono uppercase"
                >
                  <Share2 className="w-4 h-4" strokeWidth={2.5} />
                </Button>
              </div>
              <div className="mt-3 text-xs text-[#888] font-mono uppercase">
                {"// КОД: "}<span className="text-[#BFFF00] font-black">{refCode}</span>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-[#121212] border-2 border-[#00F0FF]/40 p-4 text-center"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                  <Users className="w-5 h-5 mx-auto mb-2 text-[#00F0FF]" strokeWidth={2.5} />
                  <div className="text-2xl font-black text-[#00F0FF] font-mono">{stats.clicks}</div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">Кликов</div>
                </div>
                <div className="bg-[#121212] border-2 border-[#FF2D87]/40 p-4 text-center"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-[#FF2D87]" strokeWidth={2.5} />
                  <div className="text-2xl font-black text-[#FF2D87] font-mono">{stats.orders}</div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">Заказов</div>
                </div>
                <div className="bg-[#121212] border-2 border-[#BFFF00]/40 p-4 text-center"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                  <DollarSign className="w-5 h-5 mx-auto mb-2 text-[#BFFF00]" strokeWidth={2.5} />
                  <div className="text-2xl font-black text-[#BFFF00] font-mono">{stats.earnings.toFixed(0)}₽</div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">Заработано</div>
                </div>
              </div>
            )}

            {/* How earnings work */}
            <div className="bg-[#0E0E0E] border-2 border-[#00F0FF] p-5"
              style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
              <h3 className="font-black uppercase tracking-tight font-mono text-sm text-[#00F0FF] mb-3">{"// КАК_ЭТО_РАБОТАЕТ"}</h3>
              <ul className="space-y-2 text-sm text-[#888] font-mono">
                <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Друг переходит по твоей ссылке</li>
                <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Покупает любой аккаунт на ХайпХаб</li>
                <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Ты получаешь 10% от суммы заказа</li>
                <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Выплата на криптокошелёк по запросу</li>
                <li className="flex gap-2"><span className="text-[#BFFF00]">▸</span> Минимум к выплате: 500₽</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
