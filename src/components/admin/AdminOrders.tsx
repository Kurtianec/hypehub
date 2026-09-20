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


const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает оплаты", color: "#8E1537" },
  paid: { label: "Оплачен", color: "#8E1537" },
  delivered: { label: "Доставлен", color: "#8E1537" },
  cancelled: { label: "Отменён", color: "#8E1537" },
  archived: { label: "В архиве", color: "#888888" },
};

type View = "active" | "archived";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("active");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoredIds, setRestoredIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const openOrder = async (order: Order) => { const r = await fetch(`/api/orders/${order.id}`); const d = await r.json(); setViewOrder({ ...order, events: d.events || order.events }); };

  const load = async () => {
    setLoading(true);
    try {
      const endpoint = view === "archived" ? "/api/orders/archived" : "/api/orders";
      const res = await fetch(endpoint, { headers: {} });
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

  const updateOrder = async (order: Order, status: "pending" | "paid" | "delivered" | "cancelled" | "archived", restoreProduct = false) => {
    if (status === "delivered" && !window.confirm("Выдать покупателю логин и пароль? Это действие будет записано в историю заказа.")) return;
    if (status === "cancelled" && !window.confirm("Отменить заказ и вернуть товар в каталог?")) return;
    setUpdatingId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, restoreProduct }) });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: status === "paid" ? "Заказ отмечен оплаченным" : status === "delivered" ? "Данные выданы покупателю" : status === "archived" ? "Заказ перемещён в архив" : "Заказ отменён" });
      setViewOrder(null);
      await load();
    } catch { toast({ title: "Не удалось изменить заказ", variant: "destructive" }); }
    finally { setUpdatingId(null); }
  };

  // Возврат товара одновременно отменяет заказ, поэтому он исчезает из активных и из счётчика.
  const restoreProduct = async (order: Order) => {
    if (!window.confirm("Вернуть товар в каталог и отменить этот заказ?")) return;
    setRestoringId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", restoreProduct: true }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({
        title: "Товар возвращён в каталог",
        description: order.product?.title,
      });
      setRestoredIds((prev) => new Set(prev).add(order.id));
      setViewOrder(null);
      await load();
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
        <Loader2 className="w-8 h-8 animate-spin text-[#8E1537]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#8E1537]" />
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
              ? "bg-[#8E1537]/10 text-[#8E1537] border-[#8E1537]"
              : "bg-[#121212] text-[#888] border-[#2A2A2A] hover:border-[#8E1537]/50"
          )}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Активные
          {view !== "active" && activeCount > 0 && (
            <span className="ml-1 bg-[#8E1537] text-white text-[9px] px-1.5 py-0.5 font-black">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setView("archived")}
          className={cn(
            "px-4 py-2 text-xs font-mono uppercase border-2 transition-all flex items-center gap-2",
            view === "archived"
              ? "bg-[#8E1537]/10 text-[#8E1537] border-[#8E1537]"
              : "bg-[#121212] text-[#888] border-[#2A2A2A] hover:border-[#8E1537]/50"
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
                  view === "archived" ? "border-[#2A2A2A] opacity-70" : "border-[#2A2A2A] hover:border-[#8E1537]"
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
                    <div className="font-black text-[#8E1537] font-mono">{formatPrice(o.amount, o.currency)}</div>
                  </div>
                  {view === "active" && o.status === "pending" && (
                    <Button size="sm" onClick={() => updateOrder(o, "paid")} disabled={updatingId === o.id} className="bg-[#8E1537] text-black hover:bg-[#8E1537] text-[10px] font-mono uppercase">Оплачено</Button>
                  )}
                  {view === "active" && o.status === "paid" && (
                    <Button size="sm" onClick={() => updateOrder(o, "delivered")} disabled={updatingId === o.id} className="bg-[#8E1537] text-white hover:bg-[#8E1537] text-[10px] font-mono uppercase">Выдать</Button>
                  )}
                  {view === "archived" && o.status !== "archived" && (
                    <Button size="sm" variant="ghost" onClick={() => updateOrder(o, "archived")} disabled={updatingId === o.id} className="text-[10px] font-mono uppercase"><Archive className="w-3.5 h-3.5 mr-1" />В архив</Button>
                  )}
                  {/* Restore product to catalog — shows for any non-pending order OR pending too */}
                  {(o.status === "delivered" || o.status === "cancelled" || o.status === "pending" || o.status === "paid") && (
                    restoredIds.has(o.id) ? (
                      <span className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-mono uppercase text-[#8E1537] bg-[#8E1537]/10 border border-[#8E1537]/30">
                        <Check className="w-3 h-3" />
                        В каталоге
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => restoreProduct(o)}
                        disabled={restoringId === o.id}
                        className="text-[10px] text-[#8E1537] hover:bg-[#8E1537]/10 font-mono uppercase px-2"
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
                    onClick={() => openOrder(o)}
                    className="hover:bg-[#8E1537]/10 hover:text-[#8E1537]"
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

              <div className="glass rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-3">История заказа</div>
                <div className="space-y-3">
                  {(viewOrder.events?.length ? viewOrder.events : [{ type: "created", label: "Заказ создан", actor: "Система", createdAt: viewOrder.createdAt }]).map((event, index) => (
                    <div key={`${event.type}-${index}`} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#8E1537]" />{index < (viewOrder.events?.length || 1) - 1 && <span className="w-px flex-1 bg-[#2A2A2A] mt-1" />}</div>
                      <div className="pb-2"><div className="font-bold text-foreground">{event.label}</div><div className="text-[#888] font-mono">{new Date(event.createdAt).toLocaleString("ru-RU")} · {event.actor}</div></div>
                    </div>
                  ))}
                </div>
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
                <div className="glass rounded-xl p-3 border border-[#8E1537]/30">
                  <div className="text-xs text-[#71102B] mb-1 font-bold">Данные доставлены:</div>
                  <div className="text-xs font-mono space-y-1">
                    <div>Логин: <span className="text-foreground">{viewOrder.deliveryLogin}</span></div>
                    <div>Пароль: <span className="text-foreground">{viewOrder.deliveryPass}</span></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                {viewOrder.status === "pending" && <Button onClick={() => updateOrder(viewOrder, "paid")} disabled={updatingId === viewOrder.id} className="bg-[#8E1537] text-black hover:bg-[#8E1537] font-bold">Оплачено</Button>}
                {viewOrder.status === "paid" && <Button onClick={() => updateOrder(viewOrder, "delivered")} disabled={updatingId === viewOrder.id} className="bg-[#8E1537] text-white hover:bg-[#8E1537] font-bold">Выдать данные</Button>}
                {(viewOrder.status === "delivered" || viewOrder.status === "cancelled") && <Button onClick={() => updateOrder(viewOrder, "archived")} disabled={updatingId === viewOrder.id} variant="outline"><Archive className="w-4 h-4 mr-2" />В архив</Button>}
                {(viewOrder.status === "pending" || viewOrder.status === "paid") && <Button onClick={() => updateOrder(viewOrder, "cancelled", true)} disabled={updatingId === viewOrder.id} variant="destructive">Отменить</Button>}
              </div>

              {/* Restore to catalog button in modal */}
              {(viewOrder.status === "delivered" || viewOrder.status === "cancelled" || viewOrder.status === "pending" || viewOrder.status === "paid") && (
                <div className="pt-2">
                  {restoredIds.has(viewOrder.id) ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-[#8E1537]/10 border border-[#8E1537]/30 rounded-xl">
                      <Check className="w-4 h-4 text-[#8E1537]" />
                      <span className="text-xs font-mono uppercase text-[#8E1537]">Товар в каталоге</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => restoreProduct(viewOrder)}
                      disabled={restoringId === viewOrder.id}
                      className="w-full bg-[#8E1537] text-black hover:bg-[#8E1537] hover:text-white font-black uppercase font-mono"
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
