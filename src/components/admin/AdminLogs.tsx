"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, ScrollText, Filter, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";


const ACTION_COLORS: Record<string, string> = {
  create: "#8E1537",
  update: "#8E1537",
  delete: "#8E1537",
  login: "#8E1537",
  settings: "#8E1537",
  reply: "#8E1537",
  archive: "#888",
};

const ENTITY_LABELS: Record<string, string> = {
  product: "Товар",
  category: "Категория",
  order: "Заказ",
  support: "Поддержка",
  review: "Отзыв",
  blog: "Блог",
  settings: "Настройки",
};

interface LogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ip?: string | null;
  actor?: string;
  createdAt: string;
}

export function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: "200" }); if (filter !== "all") query.set("entity", filter); if (action) query.set("action", action); if (from) query.set("from", from); if (to) query.set("to", to);
      const res = await fetch(`/api/admin-logs?${query}`, {
        headers: {},
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter, action, from, to]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#8E1537]" />
      </div>
    );
  }

  const parseDetails = (d?: string | null): Record<string, unknown> => {
    try {
      return d ? JSON.parse(d) : {};
    } catch {
      return {};
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#8E1537]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_LOGS"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Журнал действий</h1>
        <p className="text-sm text-[#888] font-mono">&gt; Всего записей: {logs.length}</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 bg-[#121212] border-2 border-[#2A2A2A] p-1 mb-6 w-fit">
        {[
          { v: "all", l: "ВСЕ" },
          { v: "product", l: "ТОВАРЫ" },
          { v: "category", l: "КАТЕГОРИИ" },
          { v: "order", l: "ЗАКАЗЫ" },
          { v: "support", l: "ПОДДЕРЖКА" },
          { v: "review", l: "ОТЗЫВЫ" },
          { v: "blog", l: "БЛОГ" },
          { v: "settings", l: "НАСТРОЙКИ" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-all font-mono",
              filter === f.v ? "bg-[#8E1537] text-white" : "text-[#888] hover:text-foreground"
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-[#121212] border border-[#333] px-3 py-2 text-xs"><option value="">Все операции</option><option value="login">Успешные входы</option><option value="login_failed">Неудачные входы</option><option value="payment_settings_changed">Изменения кошельков</option><option value="order_viewed">Просмотр заказа/реквизитов</option><option value="order_status">Выдача и статусы</option><option value="product_deleted">Удаление товара</option><option value="backup_restored">Восстановление копии</option></select>
        <label className="text-xs text-[#888] flex items-center gap-2">От <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-[#121212] border border-[#333] px-2 py-1.5 text-white" /></label>
        <label className="text-xs text-[#888] flex items-center gap-2">До <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-[#121212] border border-[#333] px-2 py-1.5 text-white" /></label>
        <span className="px-3 py-2 text-xs border border-[#333] text-[#888]">Администратор: основной</span>
      </div>

      {/* Logs list */}
      {logs.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Нет записей</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map((log, i) => {
            const color = ACTION_COLORS[log.action] || "#888";
            const details = parseDetails(log.details);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="bg-[#121212] border-2 border-[#2A2A2A] p-3 flex items-start gap-3 hover:border-[#8E1537]/60 transition-colors"
                style={{ color, clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
              >
                <div className="w-8 h-8 flex items-center justify-center border-2 flex-shrink-0"
                  style={{ borderColor: `${color}40`, background: `${color}15` }}>
                  <Activity className="w-4 h-4" style={{ color }} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase font-mono" style={{ color }}>
                      {log.action}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold border font-mono uppercase"
                      style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                      {ENTITY_LABELS[log.entity] || log.entity}
                    </span>
                    {log.entityId && (
                      <span className="text-[10px] text-[#888] font-mono">
                        ID: {log.entityId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  {Object.keys(details).length > 0 && (
                    <div className="text-[10px] text-[#888] font-mono mt-1">
                      {Object.entries(details).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="mr-3">
                          <span className="text-[#888]">{k}:</span>{" "}
                          <span className="text-foreground">{String(v).slice(0, 30)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {log.ip && (
                    <div className="text-[10px] text-[#888] font-mono mt-1">IP: {log.ip}</div>
                  )}
                  <div className="text-[10px] text-[#777] font-mono mt-1">Кто: {log.actor || "Администратор"}</div>
                </div>
                <div className="text-[10px] text-[#888] font-mono whitespace-nowrap flex-shrink-0">
                  {new Date(log.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
