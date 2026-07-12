"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Loader2, Mail, Phone, Bitcoin, Wallet, Check, X, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/types";

const TOKEN = "hypehub-admin-2024";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает оплаты", color: "#FFD700" },
  paid: { label: "Оплачен", color: "#00F2EA" },
  delivered: { label: "Доставлен", color: "#10B981" },
  cancelled: { label: "Отменён", color: "#EF4444" },
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { headers: { "x-admin-token": TOKEN } });
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF0050]" />
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

      {orders.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Пока нет заказов</p>
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
                className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#00F0FF] p-4 flex flex-col md:flex-row md:items-center gap-3 transition-colors"
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
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-[#BFFF00] font-mono">{formatPrice(o.amount, o.currency)}</div>
                  </div>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
