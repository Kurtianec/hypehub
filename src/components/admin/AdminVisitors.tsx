"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye, Users, Globe, MapPin, Link2, Loader2, TrendingUp,
  Clock, Monitor, ArrowRight, MonitorSmartphone, Cpu, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisitorData {
  stats: {
    total: number;
    unique: number;
    today: number;
    range: string;
  };
  hourly: { hour: number; count: number }[];
  byCountry: { country: string; count: number }[];
  byCity: { city: string; count: number }[];
  byReferrer: { referer: string; count: number }[];
  byPath: { path: string; count: number }[];
  byDevice: { label: string; count: number }[];
  byOS: { label: string; count: number }[];
  byBrowser: { label: string; count: number }[];
  recent: {
    id: string;
    ip: string;
    userAgent: string | null;
    device: string;
    os: string;
    browser: string;
    language?: string;
    timezone?: string;
    screen?: string;
    touch?: boolean;
    connection?: string;
    referer: string | null;
    path: string;
    country: string | null;
    city: string | null;
    createdAt: string;
  }[];
}

const RANGES = [
  { value: "24h", label: "24 часа" },
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "all", label: "Всё время" },
];

export function AdminVisitors() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/visitors?range=${range}`, {
        headers: {},
      });
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [range]);

  const maxHour = Math.max(...(data?.hourly.map((h) => h.count) || [1]), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#8E1537]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#8E1537]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_VISITORS"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Посетители</h1>
          <p className="text-sm text-[#888] font-mono">&gt; Аналитика посещаемости сайта</p>
        </div>
        <div className="flex gap-1.5 bg-[#121212] border-2 border-[#2A2A2A] p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-all font-mono",
                range === r.value
                  ? "bg-[#8E1537] text-black"
                  : "text-[#888] hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={Eye} label="Всего визитов" value={data.stats.total} color="#8E1537" />
        <StatCard icon={Users} label="Уникальных" value={data.stats.unique} color="#8E1537" />
        <StatCard icon={TrendingUp} label="Сегодня" value={data.stats.today} color="#8E1537" />
        <StatCard icon={Globe} label="Стран" value={data.byCountry.length} color="#8E1537" />
      </div>

      {/* Hourly chart */}
      <div className="admin-panel-card bg-[#121212] border-2 border-[#2A2A2A] p-5 mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8E1537]" />
          Активность за 24 часа
        </h3>
        <div className="flex items-end gap-1 h-32">
          {data.hourly.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(h.count / maxHour) * 100}%` }}
              transition={{ delay: i * 0.02 }}
              className="flex-1 group relative"
            >
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#8E1537] to-[#A61E46] hover:from-[#8E1537] hover:to-[#8E1537] transition-colors cursor-pointer"
                style={{ minHeight: h.count > 0 ? "8px" : "2px", opacity: h.count > 0 ? 1 : 0.2 }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/80 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {h.count} · {h.hour}:00
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#888] mt-2">
          <span>24ч назад</span>
          <span>сейчас</span>
        </div>
      </div>

      {/* Devices, operating systems and browsers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <BreakdownCard icon={MonitorSmartphone} title="Устройства" items={data.byDevice || []} />
        <BreakdownCard icon={Cpu} title="Операционные системы" items={data.byOS || []} />
        <BreakdownCard icon={Compass} title="Браузеры" items={data.byBrowser || []} />
      </div>

      {/* Geo + sources grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        {/* By country */}
        <div className="admin-panel-card bg-[#121212] border-2 border-[#2A2A2A] p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#8E1537]" />
            По странам
          </h3>
          {data.byCountry.length === 0 ? (
            <p className="text-sm text-[#888]">Нет данных</p>
          ) : (
            <div className="space-y-2.5">
              {data.byCountry.map((c, i) => {
                const max = data.byCountry[0].count;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[#888]" />
                        {c.country}
                      </span>
                      <span className="font-bold">{c.count}</span>
                    </div>
                    <div className="h-2 bg-[#1A1A1A] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.count / max) * 100}%` }}
                        className="h-full bg-[#8E1537]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By city */}
        <div className="admin-panel-card bg-[#121212] border-2 border-[#2A2A2A] p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8E1537]" />
            По городам
          </h3>
          {data.byCity.length === 0 ? (
            <p className="text-sm text-[#888]">Нет данных</p>
          ) : (
            <div className="space-y-2.5">
              {data.byCity.map((c, i) => {
                const max = data.byCity[0].count;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{c.city}</span>
                      <span className="font-bold">{c.count}</span>
                    </div>
                    <div className="h-2 bg-[#1A1A1A] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.count / max) * 100}%` }}
                        className="h-full bg-[#8E1537]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By referrer */}
        <div className="admin-panel-card bg-[#121212] border-2 border-[#2A2A2A] p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#8E1537]" />
            Источники трафика
          </h3>
          {data.byReferrer.length === 0 ? (
            <p className="text-sm text-[#888]">Нет данных</p>
          ) : (
            <div className="space-y-2">
              {data.byReferrer.map((r, i) => {
                const max = data.byReferrer[0].count;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{r.referer === "null" ? "Прямой переход" : r.referer}</span>
                        <span className="font-bold ml-2">{r.count}</span>
                      </div>
                      <div className="h-1.5 bg-[#1A1A1A] overflow-hidden">
                        <div
                          className="h-full bg-[#8E1537]"
                          style={{ width: `${(r.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By path */}
        <div className="admin-panel-card bg-[#121212] border-2 border-[#2A2A2A] p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#8E1537]" />
            Посещённые страницы
          </h3>
          {data.byPath.length === 0 ? (
            <p className="text-sm text-[#888]">Нет данных</p>
          ) : (
            <div className="space-y-2">
              {data.byPath.map((p, i) => {
                const max = data.byPath[0].count;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-xs truncate">{p.path}</span>
                      <span className="font-bold ml-2">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] overflow-hidden">
                      <div
                        className="h-full bg-[#8E1537]"
                        style={{ width: `${(p.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent visitors table */}
      <div className="admin-panel-card bg-[#121212] border-2 border-[#2A2A2A] p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-[#8E1537]" />
          Последние посетители ({data.recent.length})
        </h3>
        {data.recent.length === 0 ? (
          <p className="text-sm text-[#888] text-center py-8">Пока нет данных о посетителях</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#888] border-b border-[#1F1F1F]">
                  <th className="pb-2 pr-3">IP</th>
                  <th className="pb-2 pr-3 hidden md:table-cell">Локация</th>
                  <th className="pb-2 pr-3 hidden md:table-cell">Устройство</th>
                  <th className="pb-2 pr-3 hidden lg:table-cell">Экран / среда</th>
                  <th className="pb-2 pr-3 hidden lg:table-cell">Источник</th>
                  <th className="pb-2 pr-3 hidden lg:table-cell">Страница</th>
                  <th className="pb-2 text-right">Время</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.slice(0, 50).map((v) => (
                  <tr key={v.id} className="border-b border-[#1F1F1F] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 font-mono text-xs">
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-foreground">{v.ip}</span>
                    </td>
                    <td className="py-2.5 pr-3 hidden md:table-cell text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#888]" />
                        {v.country ? (
                          <span>{v.country}{v.city ? `, ${v.city}` : ""}</span>
                        ) : (
                          <span className="text-[#888]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 hidden md:table-cell text-xs">
                      <div className="font-semibold">{v.device}</div>
                      <div className="text-[#888]">{v.browser} · {v.os}</div>
                    </td>
                    <td className="py-2.5 pr-3 hidden lg:table-cell text-xs text-[#888]">
                      <div>{v.screen || "Экран —"} · {v.connection || "сеть —"}</div>
                      <div>{v.language || "язык —"} · {v.timezone || "часовой пояс —"}</div>
                    </td>
                    <td className="py-2.5 pr-3 hidden lg:table-cell text-xs">
                      {v.referer ? (
                        <span className="truncate max-w-[120px] inline-block" title={v.referer}>{v.referer}</span>
                      ) : (
                        <span className="text-[#888]">Прямой</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 hidden lg:table-cell text-xs font-mono text-[#888]">{v.path}</td>
                    <td className="py-2.5 text-right text-xs text-[#888] whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#888] mt-4 text-center">
        Данные обновляются при каждом заходе посетителя на сайт. Геоопределение по IP через ip-api.com.
      </p>
    </div>
  );
}

function BreakdownCard({ icon: Icon, title, items }: { icon: React.ComponentType<{ className?: string }>; title: string; items: { label: string; count: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  return (
    <div className="admin-surface bg-[#121212] border border-[#2A2A2A] p-5 rounded-xl">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#8E1537]" />
        {title}
      </h3>
      {items.length === 0 ? <p className="text-sm text-[#888]">Нет данных</p> : (
        <div className="space-y-3">
          {items.slice(0, 6).map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate">{item.label}</span>
                <span className="font-bold text-[#D05B7D]">{item.count} · {Math.round(item.count / total * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#242424]">
                <div className="h-full rounded-full bg-[#8E1537]" style={{ width: `${item.count / total * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-panel-card bg-[#121212] border-2 p-4 md:p-5"
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
        {value.toLocaleString("ru-RU")}
      </div>
      <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}
