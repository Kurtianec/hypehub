"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Loader2, Mail, Phone, Bitcoin, Eye, Archive, RotateCcw, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { cn } from "@/lib/utils";

const TOKEN = "hypehub-admin-2024";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает оплаты", color: "#FFD700" },
  paid: { label: "Оплачен", color: "#00F2EA" },
  delivered: { label: "Доставлен", color: "#10B981" },
  cancelled: { label: "Отменён", color: "#EF4444" },
};

type View = "active" | "archived";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("active");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoredIds, setRestoredIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const endpoint = view === "archived" ? "/api/orders/archived" : "/api/orders";
      const res = await fetch(endpoint, { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [view]);

  // Restore product to catalog (change status sold → available)
  const restoreProduct = async (order: Order) => {
    setRestoringId(order.id);
    try {
      const res = await fetch(`/api/products/${order.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ status: "available" }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({
        title: "Товар возвращён в каталог",
        description: order.product?.title,
      });
      setRestoredIds((prev) => new Set(prev).add(order.id));
    } catch {
      toast({ title: "Ошибка возврата товара", variant: "destructive" });
    } finally {
      setRestoringId(null);
    }
  };

  const archivedCount = orders.filter((o) => o.status === "delivered" || o.status === "cancelled").length;
  const activeCount = orders.filter((o) => o.status === "pending" || o.status === "paid").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#00F0FF]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_ORDERS"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Заказы</h1>
        <p className="text-sm text-[#888] font-mono">&gt; Всего: {orders.length}</p>
      </div>

      {/* Active / Archive toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("active")}
          className={cn(
            "px-4 py-2 text-xs font-mono uppercase border-2 transition-all flex items-center gap-2",
            view === "active"
              ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]"
              : "bg-[#121212] text-[#888] border-[#2A2A2A] hover:border-[#00F0FF]/50"
          )}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Активные
          {view !== "active" && activeCount > 0 && (
            <span className="ml-1 bg-[#FF2D87] text-white text-[9px] px-1.5 py-0.5 font-black">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setView("archived")}
          className={cn(
            "px-4 py-2 text-xs font-mono uppercase border-2 transition-all flex items-center gap-2",
            view === "archived"
              ? "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]"
              : "bg-[#121212] text-[#888] border-[#2A2A2A] hover:border-[#A855F7]/50"
          )}
        >
          <Archive className="w-3.5 h-3.5" />
          Архив
          {view !== "archived" && archivedCount > 0 && (
            <span className="ml-1 bg-[#888] text-white text-[9px] px-1.5 py-0.5 font-black">
              {archivedCount}
            </span>
          )}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          {view === "archived" ? (
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
          ) : (
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          )}
          <p className="uppercase">
            &gt; {view === "archived" ? "Архив пуст" : "Пока нет активных заказов"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const status = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-[#121212] border-2 p-4 flex flex-col md:flex-row md:items-center gap-3 transition-colors",
                  view === "archived" ? "border-[#2A2A2A] opacity-70" : "border-[#2A2A2A] hover:border-[#00F0FF]"
                )}
                style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 text-[10px] font-black border font-mono uppercase"
                      style={{ background: `${status.color}15`, color: status.color, borderColor: `${status.color}40` }}
                    >
                      {status.label}
                    </span>
                    <span className="text-[10px] text-[#888] font-mono uppercase">
                      {new Date(o.createdAt).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <div className="font-black text-sm truncate uppercase tracking-tight">{o.product?.title}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-[#888] mt-1 font-mono uppercase">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {o.buyerEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {o.buyerContact}
                    </span>
                    <span className="flex items-center gap-1">
                      {o.paymentMethod.includes("crypto") ? (
                        <><Bitcoin className="w-3 h-3" /> {o.paymentMethod.replace("crypto_", "").toUpperCase()}</>
                      ) : (
                        <></>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-black text-[#BFFF00] font-mono">{formatPrice(o.amount, o.currency)}</div>
                  </div>
                  {/* Restore product to catalog — shows for delivered/cancelled orders */}
                  {(o.status === "delivered" || o.status === "cancelled") && (
                    restoredIds.has(o.id) ? (
                      <span className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-mono uppercase text-[#BFFF00] bg-[#BFFF00]/10 border border-[#BFFF00]/30">
                        <Check className="w-3 h-3" />
                        В каталоге
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => restoreProduct(o)}
                        disabled={restoringId === o.id}
                        className="text-[10px] text-[#BFFF00] hover:bg-[#BFFF00]/10 font-mono uppercase px-2"
                        title="Вернуть товар в каталог"
                      >
                        {restoringId === o.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden md:inline ml-1">В каталог</span>
                      </Button>
                    )
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewOrder(o)}
                    className="hover:bg-[#00F0FF]/10 hover:text-[#00F0FF]"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order detail */}
      <Dialog open={!!viewOrder} onOpenChange={(o) => !o && setViewOrder(null)}>
        <DialogContent className="max-w-lg glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Заказ {viewOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-3 text-sm">
              <div className="glass rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-0.5">Товар</div>
                <div className="font-bold">{viewOrder.product?.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="glass rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                  <div className="text-xs font-mono">{viewOrder.buyerEmail}</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">Контакт</div>
                  <div className="text-xs font-mono">{viewOrder.buyerContact}</div>
                </div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-0.5">Сумма</div>
                <div className="font-black text-lg gradient-text">{formatPrice(viewOrder.amount, viewOrder.currency)}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-0.5">Способ оплаты</div>
                <div className="font-bold capitalize">{viewOrder.paymentMethod}</div>
                {viewOrder.txnHash && (
                  <div className="text-xs text-muted-foreground mt-1 font-mono break-all">
                    TX: {viewOrder.txnHash}
                  </div>
                )}
              </div>
              {viewOrder.status === "delivered" && viewOrder.deliveryLogin && (
                <div className="glass rounded-xl p-3 border border-green-500/30">
                  <div className="text-xs text-green-400 mb-1 font-bold">Данные доставлены:</div>
                  <div className="text-xs font-mono space-y-1">
                    <div>Логин: <span className="text-foreground">{viewOrder.deliveryLogin}</span></div>
                    <div>Пароль: <span className="text-foreground">{viewOrder.deliveryPass}</span></div>
                  </div>
                </div>
              )}

              {/* Restore to catalog button in modal */}
              {(viewOrder.status === "delivered" || viewOrder.status === "cancelled") && (
                <div className="pt-2">
                  {restoredIds.has(viewOrder.id) ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-xl">
                      <Check className="w-4 h-4 text-[#BFFF00]" />
                      <span className="text-xs font-mono uppercase text-[#BFFF00]">Товар в каталоге</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => restoreProduct(viewOrder)}
                      disabled={restoringId === viewOrder.id}
                      className="w-full bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase font-mono"
                    >
                      {restoringId === viewOrder.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                      )}
                      Вернуть товар в каталог
                    </Button>
                  )}
                  <p className="text-[10px] text-[#888] text-center mt-2 font-mono">
                    &gt; Товар снова появится в каталоге со статусом «В продаже»
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
