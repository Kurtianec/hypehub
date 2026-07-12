"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, ShoppingCart, Users, MessageSquare, TrendingUp,
  DollarSign, Star, Activity, Download, Eye, RefreshCw, ArrowUp,
} from "lucide-react";
import type { Category, Product, FaqItem } from "@/lib/types";
import { formatPrice } from "@/lib/types";

interface AdminData {
  categories: Category[];
  products: Product[];
  faqs: FaqItem[];
  settings: Record<string, string>;
}

interface Analytics {
  products: { total: number; available: number; sold: number; reserved: number };
  orders: { total: number; pending: number; delivered: number; last30d: number; last7d: number; last24h: number };
  revenue: { last30d: number; last7d: number; last24h: number };
  visitors: { total30d: number; unique30d: number };
  support: { newMessages: number };
  topProducts: { productId: string; title: string; count: number; revenue: number }[];
  daily: { date: string; orders: number; revenue: number }[];
}

const TOKEN = "hypehub-admin-2024";

export function AdminDashboard({ data }: { data: AdminData }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", { headers: { "x-admin-token": TOKEN } });
      const d = await res.json();
      setAnalytics(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const exportData = (type: "products" | "orders" | "visitors") => {
    window.location.href = `/api/export?type=${type}`;
  };

  const featured = data.products.filter((p) => p.featured).length;
  const totalValue = data.products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#BFFF00]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// DASHBOARD"}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Обзор системы</h1>
            <p className="text-sm text-[#888] font-mono">&gt; Состояние вашего магазина в реальном времени</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadAnalytics}
              className="px-3 py-2 bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#BFFF00] text-xs font-mono uppercase flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </button>
            <button
              onClick={() => exportData("products")}
              className="px-3 py-2 bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#BFFF00] text-xs font-mono uppercase flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Экспорт
            </button>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      {analytics && !loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <MetricCard
              icon={DollarSign}
              label="ВЫРУЧКА 30Д"
              value={formatPrice(analytics.revenue.last30d)}
              sub={`7д: ${formatPrice(analytics.revenue.last7d)}`}
              color="#BFFF00"
              trend={`+${analytics.orders.last7d} заказов`}
            />
            <MetricCard
              icon={ShoppingCart}
              label="ЗАКАЗЫ"
              value={String(analytics.orders.total)}
              sub={`24ч: ${analytics.orders.last24h}`}
              color="#00F0FF"
              trend={`${analytics.orders.pending} ожидают`}
            />
            <MetricCard
              icon={Eye}
              label="ПОСЕТИТЕЛИ 30Д"
              value={String(analytics.visitors.total30d)}
              sub={`Уникальных: ${analytics.visitors.unique30d}`}
              color="#FF2D87"
              trend="30 дней"
            />
            <MetricCard
              icon={MessageSquare}
              label="НОВЫХ ОБРАЩЕНИЙ"
              value={String(analytics.support.newMessages)}
              sub="в поддержке"
              color="#FFE600"
              trend="требует ответа"
            />
          </div>

          {/* Daily chart */}
          <div className="bg-[#121212] border-2 border-[#2A2A2A] p-5 mb-6"
            style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
          >
            <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp className="w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
              <span className="text-[#BFFF00] font-mono text-xs">{"// ЗАКАЗЫ_ЗА_14_ДНЕЙ"}</span>
            </h3>
            <div className="flex items-end gap-1 h-32">
              {analytics.daily.map((d, i) => {
                const maxOrders = Math.max(...analytics.daily.map((x) => x.orders), 1);
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.orders / maxOrders) * 100}%` }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-1 group relative"
                  >
                    <div
                      className="w-full bg-[#BFFF00] hover:bg-[#FF2D87] transition-colors cursor-pointer"
                      style={{ minHeight: d.orders > 0 ? "8px" : "2px", opacity: d.orders > 0 ? 1 : 0.2 }}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black border border-[#BFFF00] text-[10px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {d.orders} зак · {formatPrice(d.revenue)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[#888] mt-2 font-mono">
              <span>{analytics.daily[0]?.date}</span>
              <span>{analytics.daily[analytics.daily.length - 1]?.date}</span>
            </div>
          </div>

          {/* Top products */}
          {analytics.topProducts.length > 0 && (
            <div className="bg-[#121212] border-2 border-[#2A2A2A] p-5 mb-6"
              style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
            >
              <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
                <Star className="w-4 h-4 text-[#FFE600]" strokeWidth={2.5} />
                <span className="text-[#FFE600] font-mono text-xs">{"// ТОП_ПРОДАЖ_30Д"}</span>
              </h3>
              <div className="space-y-2">
                {analytics.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-[#1F1F1F] last:border-0">
                    <span className="w-6 h-6 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs font-bold font-mono text-[#BFFF00]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate uppercase tracking-tight">{p.title}</div>
                      <div className="text-[10px] text-[#888] font-mono uppercase">{p.count} продаж</div>
                    </div>
                    <div className="text-sm font-black text-[#BFFF00] font-mono">
                      {formatPrice(p.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Static stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={Package} label="ТОВАРОВ" value={data.products.length} color="#BFFF00" />
        <StatCard icon={Users} label="КАТЕГОРИЙ" value={data.categories.length} color="#00F0FF" />
        <StatCard icon={Star} label="FEATURED" value={featured} color="#FFE600" />
        <StatCard icon={DollarSign} label="ОБЪЁМ" value={formatPrice(totalValue)} color="#FF2D87" />
      </div>

      {/* Quick export buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <ExportButton label="ЭКСПОРТ ТОВАРОВ" onClick={() => exportData("products")} color="#BFFF00" />
        <ExportButton label="ЭКСПОРТ ЗАКАЗОВ" onClick={() => exportData("orders")} color="#00F0FF" />
        <ExportButton label="ЭКСПОРТ ПОСЕТИТЕЛЕЙ" onClick={() => exportData("visitors")} color="#FF2D87" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#121212] border-2 border-[#2A2A2A] p-5"
          style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
        >
          <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
            <Users className="w-4 h-4 text-[#00F0FF]" strokeWidth={2.5} />
            <span className="text-[#00F0FF] font-mono text-xs">{"// ПО_КАТЕГОРИЯМ"}</span>
          </h3>
          <div className="space-y-3">
            {data.categories.map((cat) => {
              const count = data.products.filter((p) => p.categoryId === cat.id).length;
              const percent = data.products.length ? (count / data.products.length) * 100 : 0;
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-1 font-mono">
                    <span className="text-[#888] uppercase">{cat.name}</span>
                    <span className="font-bold" style={{ color: cat.color }}>{count}</span>
                  </div>
                  <div className="h-2 bg-[#1A1A1A] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full"
                      style={{ background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#121212] border-2 border-[#2A2A2A] p-5"
          style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
        >
          <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
            <TrendingUp className="w-4 h-4 text-[#FF2D87]" strokeWidth={2.5} />
            <span className="text-[#FF2D87] font-mono text-xs">{"// ТОП_ПО_ЦЕНЕ"}</span>
          </h3>
          <div className="space-y-2">
            {[...data.products]
              .sort((a, b) => b.price - a.price)
              .slice(0, 5)
              .map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#1F1F1F] last:border-0">
                  <span className="w-6 h-6 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs font-bold font-mono text-[#BFFF00]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate uppercase tracking-tight">{p.title}</div>
                    <div className="text-[10px] text-[#888] font-mono uppercase">{p.category?.name}</div>
                  </div>
                  <div className="text-sm font-black text-[#BFFF00] font-mono">
                    {formatPrice(p.price, p.currency)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-[#0E0E0E] border-2 border-[#BFFF00] p-5 flex items-start gap-3"
        style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
      >
        <Activity className="w-5 h-5 text-[#BFFF00] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="text-sm font-mono">
          <div className="font-black mb-1 uppercase tracking-tight text-[#BFFF00]">{"// SYSTEM_READY"}</div>
          <div className="text-[#888]">
            &gt; Полный доступ к управлению: товары, категории, заказы, поддержка, посетители, настройки.
            <br />
            &gt; Экспорт данных в CSV для бухгалтерии и аналитики.
            <br />
            &gt; Все изменения сразу отображаются на сайте. Пароль админа — в «Настройках».
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: string;
  trend?: string;
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
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 flex items-center justify-center border-2"
          style={{ background: `${color}20`, borderColor: color }}
        >
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className="text-[9px] font-mono uppercase flex items-center gap-1" style={{ color }}>
            <ArrowUp className="w-2.5 h-2.5" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-xl md:text-2xl font-black mb-0.5 font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">{label}</div>
      {sub && <div className="text-[10px] text-[#888]/70 font-mono mt-1">{sub}</div>}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
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
        {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
      </div>
      <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

function ExportButton({ label, onClick, color }: { label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#121212] border-2 p-4 hover:press transition-all flex items-center justify-between font-mono text-sm uppercase font-bold"
      style={{ borderColor: `${color}40`, color }}
    >
      <span className="flex items-center gap-2">
        <Download className="w-4 h-4" strokeWidth={2.5} />
        {label}
      </span>
      <span className="text-[10px] opacity-60">.CSV</span>
    </button>
  );
}
