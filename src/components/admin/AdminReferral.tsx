"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, MousePointerClick, ShoppingCart, DollarSign, TrendingUp, RefreshCw, Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/types";

const TOKEN = "hypehub-admin-2024";

interface TopReferrer {
  code: string;
  email: string;
  clicks: number;
  orders: number;
  earnings: number;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  totalClicks: number;
  totalOrders: number;
  totalEarnings: number;
  topReferrers: TopReferrer[];
  daily: { date: string; clicks: number }[];
}

export function AdminReferral() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/referral/stats", { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#22D3EE]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-[#888] font-mono">
        <p className="uppercase">&gt; Ошибка загрузки</p>
      </div>
    );
  }

  const maxClicks = Math.max(...stats.daily.map((d) => d.clicks), 1);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#22D3EE]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_REFERRAL"}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Реферальная программа</h1>
            <p className="text-sm text-[#888] font-mono">&gt; Статистика по приглашениям и заработку</p>
          </div>
          <button
            onClick={load}
            className="px-3 py-2 bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#22D3EE] text-xs font-mono uppercase flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MetricCard icon={Users} label="РЕФЕРАЛОВ" value={String(stats.totalReferrals)} color="#22D3EE" />
        <MetricCard icon={MousePointerClick} label="КЛИКОВ" value={String(stats.totalClicks)} color="#00F0FF" />
        <MetricCard icon={ShoppingCart} label="ЗАКАЗОВ" value={String(stats.totalOrders)} color="#BFFF00" />
        <MetricCard icon={DollarSign} label="ЗАРАБОТАНО" value={formatPrice(stats.totalEarnings)} color="#FF2D87" />
      </div>

      {/* Daily clicks chart */}
      <div
        className="bg-[#121212] border-2 border-[#2A2A2A] p-5 mb-6"
        style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
      >
        <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
          <TrendingUp className="w-4 h-4 text-[#22D3EE]" strokeWidth={2.5} />
          <span className="text-[#22D3EE] font-mono text-xs">{"// КЛИКИ_ЗА_14_ДНЕЙ"}</span>
        </h3>
        <div className="flex items-end gap-1 h-32">
          {stats.daily.map((d, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(d.clicks / maxClicks) * 100}%` }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 group relative"
            >
              <div
                className="w-full bg-[#22D3EE] hover:bg-[#FF2D87] transition-colors cursor-pointer"
                style={{ minHeight: d.clicks > 0 ? "8px" : "2px", opacity: d.clicks > 0 ? 1 : 0.2 }}
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black border border-[#22D3EE] text-[10px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {d.clicks} кликов
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#888] mt-2 font-mono">
          <span>{stats.daily[0]?.date}</span>
          <span>{stats.daily[stats.daily.length - 1]?.date}</span>
        </div>
      </div>

      {/* Top referrers */}
      <div
        className="bg-[#121212] border-2 border-[#2A2A2A] p-5"
        style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
      >
        <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
          <Users className="w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
          <span className="text-[#BFFF00] font-mono text-xs">{"// ТОП_РЕФЕРАЛОВ"}</span>
        </h3>
        {stats.topReferrers.length === 0 ? (
          <div className="text-center py-8 text-[#888] font-mono text-sm">
            &gt; Пока нет рефералов
          </div>
        ) : (
          <div className="space-y-2">
            {stats.topReferrers.map((r, i) => (
              <div key={r.code} className="flex items-center gap-3 py-2 border-b border-[#1F1F1F] last:border-0">
                <span className="w-6 h-6 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs font-bold font-mono text-[#22D3EE]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold font-mono truncate">{r.code}</div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">{r.email}</div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#00F0FF]">{r.clicks} кликов</span>
                  <span className="text-[#BFFF00]">{r.orders} зак.</span>
                  <span className="text-[#FF2D87] font-black">{formatPrice(r.earnings)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] border-2 p-4 md:p-5"
      style={{
        borderColor: `${color}40`,
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center mb-3 border-2"
        style={{ background: `${color}20`, borderColor: color }}
      >
        <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
      </div>
      <div className="text-xl md:text-2xl font-black mb-0.5 font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}
