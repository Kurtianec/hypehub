"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail, Search, Package, Download, Check, Clock, X, ArrowRight, Copy, Gift, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/types";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает оплаты", color: "#FFE600" },
  paid: { label: "Оплачен", color: "#00F0FF" },
  delivered: { label: "Доставлен", color: "#BFFF00" },
  cancelled: { label: "Отменён", color: "#FF3333" },
};

interface Order {
  id: string;
  productTitle?: string;
  productCategory?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  login?: string;
  password?: string;
  deliveryNote?: string | null;
}

interface BonusInfo {
  points: number;
  totalSpent: number;
  canUse: boolean;
}

export function AccountClient({ settings }: { settings: Record<string, string> }) {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bonus, setBonus] = useState<BonusInfo | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Restore email from localStorage on mount + auto-search
  useEffect(() => {
    const saved = localStorage.getItem("hypehub_account_email");
    if (saved) {
      setEmail(saved);
      // Auto-search after a tick to let state settle
      queueMicrotask(() => {
        searchWith(saved);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchWith = async (emailVal: string) => {
    if (!emailVal) {
      toast({ title: "Введите email", variant: "destructive" });
      return;
    }
    setLoading(true);
    setSearched(true);
    localStorage.setItem("hypehub_account_email", emailVal);
    try {
      const [ordersRes, bonusRes] = await Promise.all([
        fetch(`/api/orders/by-email?email=${encodeURIComponent(emailVal)}`),
        fetch(`/api/bonus?email=${encodeURIComponent(emailVal)}`),
      ]);
      const ordersData = await ordersRes.json();
      const bonusData = await bonusRes.json();
      setOrders(ordersData.orders || []);
      if (!bonusData.error) setBonus(bonusData);
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const search = () => searchWith(email);

  const clearEmail = () => {
    localStorage.removeItem("hypehub_account_email");
    setEmail("");
    setOrders([]);
    setSearched(false);
    setBonus(null);
  };

  // Filter orders by status
  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано", description: label });
  };

  const downloadCredentials = (order: Order) => {
    const content = `ХайпХаб — Данные аккаунта
============================
Товар: ${order.productTitle}
Дата: ${new Date(order.createdAt).toLocaleString("ru-RU")}
Заказ: ${order.id}

ЛОГИН: ${order.login}
ПАРОЛЬ: ${order.password}

${order.deliveryNote || ""}

============================
Инструкция по безопасности:
1. Сразу смените пароль после входа
2. Привяжите свои контакты (телефон/email)
3. Включите двухфакторную аутентификацию
4. Не передавайте данные третьим лицам

ХайпХаб
${settings.support_email || "support@hypehub.vercel.app"}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hypehub_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-1 pt-28 md:pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
          <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
          <span className="text-[#BFFF00]">/</span>
          <span className="text-foreground">КАБИНЕТ</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#00F0FF]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// ACCOUNT"}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3">
          <span className="text-gradient-neon">Личный кабинет</span>
        </h1>
        <p className="text-[#888] text-sm font-mono mb-8">
          &gt; Введите email, указанный при заказе, чтобы увидеть историю покупок
        </p>

        {/* Search form */}
        <div className="bg-[#0E0E0E] border-2 border-[#00F0FF] p-5 md:p-6 mb-8"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
          <Label className="text-[10px] uppercase tracking-widest font-mono text-[#00F0FF] mb-2 block">{"// EMAIL_ДЛЯ_ПОИСКА_ЗАКАЗОВ"}</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="your@email.com"
                className="pl-10 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#00F0FF] font-mono"
              />
            </div>
            <Button
              onClick={search}
              disabled={loading}
              className="bg-[#00F0FF] text-black hover:bg-[#BFFF00] font-black uppercase border-2 border-[#00F0FF] hover:border-[#BFFF00] font-mono tracking-wide"
            >
              {loading ? "..." : <><Search className="w-4 h-4 mr-1.5" strokeWidth={3} /> Найти</>}
            </Button>
          </div>
        </div>

        {/* Results */}
        {searched && !loading && (
          <>
            {/* Bonus card — always show after search */}
            {bonus && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#121212] border-2 border-[#FFE600]/40 p-4"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-[#FFE600]" strokeWidth={2.5} />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">Бонусы</span>
                  </div>
                  <div className="text-xl font-black text-[#FFE600] font-mono">{bonus.points} ₽</div>
                  <div className="text-[10px] text-[#888] font-mono mt-1">
                    {bonus.canUse ? "Можно списать при оплате" : "Минимум 100 ₽ для списания"}
                  </div>
                </div>
                <div className="bg-[#121212] border-2 border-[#BFFF00]/40 p-4"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">Всего потрачено</span>
                  </div>
                  <div className="text-xl font-black text-[#BFFF00] font-mono">{formatPrice(bonus.totalSpent)}</div>
                  <div className="text-[10px] text-[#888] font-mono mt-1">1 ₽ = 1 бонусный балл</div>
                </div>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="bg-[#121212] border-2 border-[#2A2A2A] p-8 text-center"
                style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
                <Package className="w-10 h-10 mx-auto mb-3 text-[#888]/30" />
                <p className="text-[#888] font-mono uppercase text-sm">&gt; Заказов не найдено</p>
                <p className="text-xs text-[#888] mt-2 font-mono">Проверьте, что ввели правильный email</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors font-mono text-xs"
                >
                  В каталог <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#BFFF00]" />
                    <span className="font-mono text-xs text-[#888] uppercase tracking-widest">
                      {"// НАЙДЕНО_ЗАКАЗОВ: "}<span className="text-[#BFFF00] font-black">{orders.length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#0A0A0A] border-2 border-[#2A2A2A] hover:border-[#BFFF00] text-xs font-mono px-2 py-1.5 uppercase tracking-wide cursor-pointer"
                    >
                      <option value="all">Все статусы</option>
                      <option value="pending">Ожидают оплаты</option>
                      <option value="paid">Оплачены</option>
                      <option value="delivered">Доставлены</option>
                      <option value="cancelled">Отменены</option>
                    </select>
                    <button
                      onClick={clearEmail}
                      className="text-[10px] font-mono uppercase text-[#888] hover:text-[#FF3333] px-2 py-1.5 border border-[#2A2A2A] hover:border-[#FF3333]/50 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredOrders.map((o, i) => {
                    const status = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                    return (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#121212] border-2 p-4"
                        style={{
                          borderColor: `${status.color}40`,
                          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase"
                                style={{ background: `${status.color}15`, color: status.color, borderColor: `${status.color}40` }}>
                                {status.label}
                              </span>
                              <span className="text-[10px] text-[#888] font-mono uppercase">
                                {new Date(o.createdAt).toLocaleString("ru-RU")}
                              </span>
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-tight mb-0.5 truncate">{o.productTitle}</h3>
                            {o.productCategory && (
                              <div className="text-[10px] text-[#888] font-mono uppercase">{o.productCategory}</div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-black text-[#BFFF00] font-mono">{formatPrice(o.amount, o.currency)}</div>
                            <div className="text-[10px] text-[#888] font-mono uppercase">{o.paymentMethod}</div>
                          </div>
                        </div>

                        {/* Credentials (if delivered) */}
                        {o.status === "delivered" && o.login && (
                          <div className="bg-[#0A0A0A] border-l-2 border-[#BFFF00] p-3 mt-3">
                            <div className="text-[10px] text-[#BFFF00] font-mono uppercase mb-2 flex items-center gap-1.5">
                              <Check className="w-3 h-3" strokeWidth={3} />
                              ДАННЫЕ АККАУНТА
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#888] font-mono uppercase w-12">Логин:</span>
                                <code className="flex-1 text-xs font-mono bg-[#121212] px-2 py-1 break-all">{o.login}</code>
                                <button onClick={() => copyText(o.login!, "Логин")} className="text-[#888] hover:text-[#BFFF00]" aria-label="Копировать">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#888] font-mono uppercase w-12">Пароль:</span>
                                <code className="flex-1 text-xs font-mono bg-[#121212] px-2 py-1 break-all">{o.password}</code>
                                <button onClick={() => copyText(o.password!, "Пароль")} className="text-[#888] hover:text-[#BFFF00]" aria-label="Копировать">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {o.deliveryNote && (
                              <p className="text-[10px] text-[#888] font-mono mt-2">{o.deliveryNote}</p>
                            )}
                            <Button
                              onClick={() => downloadCredentials(o)}
                              size="sm"
                              className="mt-3 bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono text-xs w-full"
                            >
                              <Download className="w-3.5 h-3.5 mr-1.5" strokeWidth={3} />
                              Скачать .txt
                            </Button>
                          </div>
                        )}

                        {o.status === "pending" && (
                          <div className="flex items-center gap-2 text-[10px] text-[#FFE600] font-mono uppercase mt-2">
                            <Clock className="w-3 h-3" /> Ожидает оплаты
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="bg-[#121212] border-2 border-[#2A2A2A] p-8 text-center"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <Package className="w-10 h-10 mx-auto mb-3 text-[#888]/30" />
            <p className="text-[#888] font-mono uppercase text-sm">&gt; Введите email для просмотра заказов</p>
            <p className="text-xs text-[#888] mt-2 font-mono">Все ваши покупки в одном месте</p>
          </div>
        )}
      </div>
    </main>
  );
}
