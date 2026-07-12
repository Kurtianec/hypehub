"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, ScrollText, Filter, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOKEN = "hypehub-admin-2024";

const ACTION_COLORS: Record<string, string> = {
  create: "#BFFF00",
  update: "#00F0FF",
  delete: "#FF3333",
  login: "#FFE600",
  settings: "#A855F7",
  reply: "#FF2D87",
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
  createdAt: string;
}

export function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin-logs?limit=200${filter !== "all" ? `&entity=${filter}` : ""}`, {
        headers: { "x-admin-token": TOKEN },
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
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#A855F7]" />
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
          <div className="w-1 h-8 bg-[#A855F7]" />
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
              filter === f.v ? "bg-[#A855F7] text-white" : "text-[#888] hover:text-foreground"
            )}
          >
            {f.l}
          </button>
        ))}
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
                className="bg-[#121212] border-2 border-[#2A2A2A] p-3 flex items-start gap-3 hover:border-[current] transition-colors"
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
