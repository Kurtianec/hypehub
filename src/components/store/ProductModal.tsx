"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, Zap, Check, Copy, Bitcoin, ArrowRight,
  Lock, Mail, Phone, CheckCircle2, FileText, AlertCircle, Download,
  Eye, ArrowLeft, Sparkles,
} from "lucide-react";
import type { Product, Settings } from "@/lib/types";
import { PLATFORM_COLORS, formatPrice, parseBadges, BADGE_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";
import { Confetti } from "./Confetti";

type Step = "details" | "checkout" | "payment" | "delivering" | "checking" | "done";

export function ProductModal({
  product,
  onClose,
  settings,
  onSwitchProduct,
}: {
  product: Product | null;
  onClose: () => void;
  settings?: Settings;
  onSwitchProduct?: (p: Product) => void;
}) {
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"crypto">("crypto");
  const [cryptoType, setCryptoType] = useState<"btc" | "usdt" | "ton">("usdt");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [txnHash, setTxnHash] = useState("");
  const [delivery, setDelivery] = useState<{ login: string; password: string; deliveryNote?: string | null; productTitle: string } | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // Increment views when product changes
  useEffect(() => {
    if (product) {
      fetch(`/api/products/${product.id}/views`, { method: "POST" }).catch(() => {});
      fetch(`/api/products/related?productId=${product.id}&limit=3`)
        .then((r) => r.json())
        .then((d) => setRelated(d.products || []))
        .catch(() => setRelated([]));
    }
  }, [product]);

  if (!product) return null;

  const badges = parseBadges(product.badges);
  const meta = product.metadata ? JSON.parse(product.metadata) : {};
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const reset = () => {
    setStep("details");
    setEmail("");
    setContact("");
    setOrderId(null);
    setTxnHash("");
    setDelivery(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const createOrder = async () => {
    if (!email || !contact) {
      toast({
        title: "Заполните все поля",
        description: "Нужны email и контакт (Telegram/телефон)",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail: email,
          buyerContact: contact,
          paymentMethod: `crypto_${cryptoType}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrderId(data.order.id);
      toast({
        title: "Заказ создан",
        description: "Переведите оплату и подтвердите платёж",
      });
    } catch (e) {
      toast({
        title: "Ошибка",
        description: e instanceof Error ? e.message : "Попробуйте ещё раз",
        variant: "destructive",
      });
      setStep("checkout");
    }
  };

  const confirmPayment = async () => {
    setStep("delivering");
    // Show "checking payment" message — don't deliver instantly
    // Real payment verification would happen on the backend
    setTimeout(() => {
      setStep("checking");
    }, 3000);
  };

  // Check payment status (polls backend)
  const checkPaymentStatus = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/checkout?orderId=${orderId}`);
      const data = await res.json();
      if (data.order && data.order.status === "delivered") {
        setDelivery({
          login: data.order.deliveryLogin,
          password: data.order.deliveryPass,
          deliveryNote: data.order.deliveryNote,
          productTitle: data.order.product?.title || product.title,
        });
        setStep("done");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
    } catch {
      // Payment not confirmed yet
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано", description: label });
  };

  const downloadCredentials = () => {
    if (!delivery) return;
    const content = `ХайпХаб — Данные аккаунта
============================
Товар: ${delivery.productTitle}
Дата: ${new Date().toLocaleString("ru-RU")}
Заказ: ${orderId}

ЛОГИН: ${delivery.login}
ПАРОЛЬ: ${delivery.password}

${delivery.deliveryNote || ""}

============================
Инструкция по безопасности:
1. Сразу смените пароль после входа
2. Привяжите свои контакты (телефон/email)
3. Включите двухфакторную аутентификацию
4. Не передавайте данные третьим лицам

Спасибо за покупку! ХайпХаб
support@hypehub.shop
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hypehub_${product.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cryptoAddress = paymentMethod === "crypto" ? {
    btc: settings?.crypto_btc,
    usdt: settings?.crypto_usdt,
    ton: settings?.crypto_ton,
  }[cryptoType] : null;

  return (
    <>
      <Confetti trigger={showConfetti} />
      <Dialog open={!!product} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-strong border-white/10 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{product.title}</DialogTitle>
            <DialogDescription>Детали товара и оформление заказа</DialogDescription>
          </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 md:p-8"
            >
              <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tight">{product.title}</h2>

              {product.followers && (
                <div className="text-sm text-muted-foreground mb-4 font-mono">
                  &gt; Аудитория: <span className="text-foreground font-semibold">{product.followers}</span>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 font-mono">
                {product.description}
              </p>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(meta).map(([k, v]) => (
                  <div key={k} className="glass rounded-xl p-3">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      {k === "country" ? "Страна" : k === "age" ? "Возраст" : k === "monetization" ? "Монетизация" : k === "verified" ? "Верификация" : k === "watchHours" ? "Часы просмотра" : k}
                    </div>
                    <div className="text-sm font-semibold">
                      {typeof v === "boolean" ? (v ? "Да" : "Нет") : String(v)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Guarantees */}
              <div className="flex flex-wrap gap-3 mb-6 text-xs">
                <div className="flex items-center gap-1.5 text-green-400">
                  <Shield className="w-4 h-4" />
                  Гарантия 24ч–14д
                </div>
                <div className="flex items-center gap-1.5 text-[#00F2EA]">
                  <Zap className="w-4 h-4" />
                  Мгновенная выдача
                </div>
                <div className="flex items-center gap-1.5 text-[#FFD700]">
                  <Lock className="w-4 h-4" />
                  Безопасная сделка
                </div>
                <div className="flex items-center gap-1.5 text-[#888]">
                  <Eye className="w-4 h-4" />
                  {product.views || 0} просмотров
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/10">
                <div>
                  {product.oldPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.oldPrice, product.currency)}
                    </div>
                  )}
                  <div className="text-3xl font-black gradient-text">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  {discount > 0 && (
                    <div className="text-xs text-[#FF0050] font-bold">Скидка {discount}%</div>
                  )}
                </div>
                <Button
                  onClick={() => setStep("checkout")}
                  size="lg"
                  className="bg-gradient-to-r from-[#FF0050] to-[#FF0000] text-white font-bold px-8"
                >
                  Купить
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Related products */}
              {related.length > 0 && onSwitchProduct && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#BFFF00]" />
                    <h4 className="font-bold text-sm uppercase tracking-wide">Похожие товары</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {related.map((rp) => (
                      <button
                        key={rp.id}
                        onClick={() => {
                          setStep("details");
                          onSwitchProduct(rp);
                        }}
                        className="text-left p-3 glass hover:bg-white/5 transition-colors border border-white/5 hover:border-[#BFFF00]/30"
                      >
                        <div className="text-xs font-bold line-clamp-2 mb-1">{rp.title}</div>
                        <div className="text-sm font-black text-[#BFFF00]">
                          {formatPrice(rp.price, rp.currency)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Checkout form */}
          {step === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-8"
            >
              <button
                onClick={() => setStep("details")}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
              >
                ← Назад к товару
              </button>

              <h2 className="text-2xl font-black mb-1">Оформление заказа</h2>
              <p className="text-sm text-muted-foreground mb-6">{product.title}</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider">Email для получения данных</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact" className="text-xs uppercase tracking-wider">Telegram или телефон (для связи)</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact"
                      placeholder="@telegram или +7..."
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider">Способ оплаты</Label>
                  <div className="p-4 rounded-xl border-2 border-[#FF0050] bg-[#FF0050]/10">
                    <div className="flex items-center gap-3">
                      <Bitcoin className="w-6 h-6 text-[#FF7A00]" />
                      <div>
                        <div className="text-sm font-bold">Криптовалюта</div>
                        <div className="text-[11px] text-muted-foreground">BTC, USDT, TON — анонимно, без проверки личности</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider">Монета</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {[
                        { k: "btc" as const, label: "BTC", color: "#F7931A" },
                        { k: "usdt" as const, label: "USDT", color: "#26A17B" },
                        { k: "ton" as const, label: "TON", color: "#0098EA" },
                      ].map((c) => (
                        <button
                          key={c.k}
                          onClick={() => setCryptoType(c.k)}
                          className={cn(
                            "py-2.5 rounded-lg text-sm font-bold transition-all",
                            cryptoType === c.k ? "text-white" : "glass text-muted-foreground"
                          )}
                          style={cryptoType === c.k ? { background: c.color } : {}}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                <div className="glass rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">К оплате:</span>
                  <span className="text-2xl font-black gradient-text">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </div>

                <Button
                  onClick={createOrder}
                  className="w-full bg-gradient-to-r from-[#FF0050] to-[#FF0000] text-white font-bold py-6"
                >
                  Перейти к оплате
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Нажимая «Оплатить», вы соглашаетесь с условиями. Все данные защищены.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && cryptoAddress && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-8"
            >
              <h2 className="text-2xl font-black mb-1">Оплата заказа</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {`Переведите точную сумму на ${cryptoType.toUpperCase()} адрес`}
              </p>

              <div className="glass rounded-xl p-5 mb-5 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {"Адрес кошелька"}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs md:text-sm font-mono bg-black/30 rounded-lg p-2.5 break-all">
                      {cryptoAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cryptoAddress || "", "Адрес скопирован")}
                      className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Сумма</div>
                    <div className="text-lg font-black gradient-text">{formatPrice(product.price, product.currency)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Способ</div>
                    <div className="text-sm font-bold">
                      {`${cryptoType.toUpperCase()}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#00F2EA]/10 text-[#00F2EA] text-xs mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  После перевода нажмите «Я оплатил». Сумма зачислится за 5–15 минут.
                  Вставьте TX hash (необязательно, но ускоряет проверку).
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="txn" className="text-xs uppercase tracking-wider">TX Hash (необязательно)</Label>
                <Input
                  id="txn"
                  placeholder="0x... или номер транзакции"
                  value={txnHash}
                  onChange={(e) => setTxnHash(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10"
                />
              </div>

              <Button
                onClick={confirmPayment}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-6"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Я оплатил — получить данные
              </Button>
            </motion.div>
          )}

          

          {/* Step 4: Delivering */}
          {step === "delivering" && (
            <motion.div
              key="delivering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-white/10 border-t-[#FF0050]"
              />
              <h2 className="text-xl font-bold mb-2">Обрабатываем платёж...</h2>
              <p className="text-sm text-muted-foreground">Проверяем транзакцию и готовим данные аккаунта</p>
            </motion.div>
          )}

          {/* Step 4b: Checking — payment not confirmed yet */}
          {step === "checking" && (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFD700" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold mb-2 text-[#FFD700]">Вы не оплатили</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Идёт проверка платежа... Ожидание подтверждения транзакции.
              </p>
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded-lg mb-4 text-left">
                <p className="text-xs text-[#888] font-mono">
                  &gt; Заказ #{orderId?.slice(0, 8)} создан<br/>
                  &gt; Статус: ожидает оплаты<br/>
                  &gt; Проверка: автоматическая (1-15 мин для крипты, мгновенно)<br/>
                  &gt; После подтверждения — данные придут на email
                </p>
              </div>
              <p className="text-xs text-[#888] mb-4">
                Если вы оплатили — подождите несколько минут. Платёж проверяется автоматически.
                Данные аккаунта будут отправлены на ваш email после подтверждения.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => checkPaymentStatus()}
                  variant="outline"
                  className="flex-1 border-[#2A2A2A]"
                >
                  Проверить ещё раз
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-[#2A2A2A]"
                >
                  Закрыть
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Done */}
          {step === "done" && delivery && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 md:p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-black mb-1">Оплата подтверждена!</h2>
                <p className="text-sm text-muted-foreground">Данные аккаунта готовы к использованию</p>
              </div>

              <div className="glass rounded-xl p-5 mb-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground pb-3 border-b border-white/10">
                  <FileText className="w-4 h-4" />
                  {delivery.productTitle}
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Логин</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-black/30 rounded-lg p-2.5 break-all">{delivery.login}</code>
                    <button
                      onClick={() => copyToClipboard(delivery.login, "Логин скопирован")}
                      className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Пароль</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-black/30 rounded-lg p-2.5 break-all">{delivery.password}</code>
                    <button
                      onClick={() => copyToClipboard(delivery.password, "Пароль скопирован")}
                      className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {delivery.deliveryNote && (
                  <div className="p-3 rounded-lg bg-[#00F2EA]/10 text-[#00F2EA] text-xs">
                    <AlertCircle className="w-4 h-4 inline mr-1.5" />
                    {delivery.deliveryNote}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={downloadCredentials}
                  className="flex-1 bg-gradient-to-r from-[#FF0050] to-[#FF0000] text-white font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать файл .txt
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-white/10"
                >
                  Закрыть
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Файл также отправлен на <span className="text-foreground font-semibold">{email}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      </Dialog>
    </>
  );
}
