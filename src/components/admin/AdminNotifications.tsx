"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ShoppingCart, MessageSquare, Star } from "lucide-react";

const TOKEN = "hypehub-admin-2024";
void TOKEN; // (kept for parity with admin modules; not used directly here anymore)

export interface NotificationItem {
  id: string;
  type: "order" | "support" | "review";
  title: string;
  description: string;
  time: string;
}

export interface AdminCounts {
  orders: number;
  support: number;
  reviews: number;
}

interface Props {
  notifications: NotificationItem[];
  unreadCount: number;
  showPanel: boolean;
  onTogglePanel: () => void;
  onClosePanel: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
  counts: AdminCounts;
}

export function AdminNotifications({
  notifications,
  unreadCount,
  showPanel,
  onTogglePanel,
  onClosePanel,
  onClear,
  onRemove,
  counts,
}: Props) {
  const iconForType = (type: string) => {
    if (type === "order") return ShoppingCart;
    if (type === "support") return MessageSquare;
    return Star;
  };

  const colorForType = (type: string) => {
    if (type === "order") return "#BFFF00";
    if (type === "support") return "#A855F7";
    return "#FFE600";
  };

  return (
    <div className="relative">
      <button
        onClick={onTogglePanel}
        className="relative w-10 h-10 border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] flex items-center justify-center transition-colors flex-shrink-0"
        aria-label="Уведомления"
      >
        <Bell className="w-4 h-4 text-[#888] group-hover:text-[#BFFF00]" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FF2D87] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center font-mono animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <>
            <div className="fixed inset-0 z-40" onClick={onClosePanel} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              // Fixed position so it never escapes the viewport.
              // Anchored to the top-right of the screen, just below the top bar.
              className="fixed right-4 top-16 w-[min(360px,calc(100vw-2rem))] bg-[#0E0E0E] border-2 border-[#BFFF00] z-[100] overflow-hidden shadow-2xl max-h-[70vh] flex flex-col"
              style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
            >
              <div className="flex items-center justify-between p-3 border-b border-[#1F1F1F] flex-shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#BFFF00]">
                  Уведомления
                </span>
                <div className="flex items-center gap-2">
                  {(counts.orders > 0 || counts.support > 0 || counts.reviews > 0) && (
                    <span className="text-[10px] text-[#888] font-mono">
                      [{counts.orders}з · {counts.support}с · {counts.reviews}о]
                    </span>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={onClear} className="text-[10px] text-[#888] hover:text-[#FF3333] uppercase">
                      Очистить
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#888] text-sm">
                    {counts.orders > 0 || counts.support > 0 || counts.reviews > 0 ? (
                      <>
                        <div className="text-[10px] font-mono uppercase mb-3 text-[#BFFF00]">
                          // Требуют внимания
                        </div>
                        <div className="space-y-2 text-left">
                          {counts.orders > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#BFFF00]/5 border border-[#BFFF00]/30">
                              <ShoppingCart className="w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
                              <span className="text-xs">
                                                Заказы ожидают: <b className="text-[#BFFF00]">{counts.orders}</b>
                              </span>
                            </div>
                          )}
                          {counts.support > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#A855F7]/5 border border-[#A855F7]/30">
                              <MessageSquare className="w-4 h-4 text-[#A855F7]" strokeWidth={2.5} />
                              <span className="text-xs">
                                Новых обращений: <b className="text-[#A855F7]">{counts.support}</b>
                              </span>
                            </div>
                          )}
                          {counts.reviews > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#FFE600]/5 border border-[#FFE600]/30">
                              <Star className="w-4 h-4 text-[#FFE600]" strokeWidth={2.5} />
                              <span className="text-xs">
                                Отзывов на модерации: <b className="text-[#FFE600]">{counts.reviews}</b>
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="font-mono uppercase text-[10px]">&gt; Нет новых уведомлений</div>
                    )}
                  </div>
                ) : (
                  <div className="py-1">
                    {notifications.map((n) => {
                      const Icon = iconForType(n.type);
                      const color = colorForType(n.type);
                      return (
                        <div key={n.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                            style={{ background: `${color}15`, borderColor: `${color}40` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground">{n.title}</div>
                            <div className="text-[11px] text-[#888]">{n.description}</div>
                            <div className="text-[10px] text-[#888]/60 mt-0.5 font-mono">{n.time}</div>
                          </div>
                          <button
                            onClick={() => onRemove(n.id)}
                            className="text-[#888] hover:text-[#FF3333] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
