"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Loader2, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  product?: string | null;
  reply?: string | null;
  createdAt: string;
}

export function ReviewsClient({
  reviews,
  avgRating,
}: {
  reviews: Review[];
  avgRating: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!name || !text) {
      toast({ title: "Заполните имя и отзыв", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, text, product }),
      });
      if (!res.ok) throw new Error("Ошибка");
      setSubmitted(true);
      setShowForm(false);
      setName("");
      setText("");
      setProduct("");
      setRating(5);
      toast({ title: "Спасибо за отзыв!", description: "Опубликуем после проверки" });
    } catch {
      toast({ title: "Ошибка отправки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 pt-28 md:pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
          <a href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</a>
          <span className="text-[#BFFF00]">/</span>
          <span className="text-foreground">ОТЗЫВЫ</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#FFE600]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// REVIEWS"}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3">
          <span className="text-gradient-neon">Отзывы</span> покупателей
        </h1>

        {/* Rating summary */}
        <div className="bg-[#121212] border-2 border-[#2A2A2A] p-5 mb-8 flex items-center gap-6"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
        >
          <div className="text-center">
            <div className="text-5xl font-black text-[#FFE600] font-mono">{avgRating}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-4 h-4"
                  fill={s <= Math.round(parseFloat(avgRating)) ? "#FFE600" : "none"}
                  stroke="#FFE600"
                />
              ))}
            </div>
            <div className="text-[10px] text-[#888] mt-1 font-mono uppercase">{reviews.length}+ отзывов</div>
          </div>
          <div className="flex-1 text-sm text-[#888] font-mono">
            &gt; Реальные отзывы покупателей аккаунтов TikTok, YouTube, VK, Instagram и Telegram.
            <br />
            &gt; Все отзывы проверяются модератором перед публикацией.
          </div>
          <Button
            onClick={() => setShowForm((v) => !v)}
            className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
          >
            <Plus className="w-4 h-4 mr-1.5" strokeWidth={3} />
            Оставить отзыв
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-[#0E0E0E] border-2 border-[#BFFF00] p-6 mb-8 overflow-hidden"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
          >
            <h3 className="font-black text-lg mb-4 uppercase tracking-tight">{"// Оставить отзыв"}</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// ИМЯ"}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как вас зовут?"
                  className="mt-1.5 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// ОЦЕНКА"}</Label>
                <div className="flex gap-2 mt-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className="w-10 h-10 border-2 flex items-center justify-center hover:border-[#FFE600] transition-colors"
                      style={{
                        borderColor: s <= rating ? "#FFE600" : "#2A2A2A",
                        background: s <= rating ? "#FFE60015" : "transparent",
                      }}
                      aria-label={`${s} звёзд`}
                    >
                      <Star
                        className="w-5 h-5"
                        fill={s <= rating ? "#FFE600" : "none"}
                        stroke="#FFE600"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// КАКОЙ ТОВАР КУПИЛИ (НЕОБЯЗАТЕЛЬНО)"}</Label>
                <Input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Например: TikTok аккаунт 10K подписчиков"
                  className="mt-1.5 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// ОТЗЫВ"}</Label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Расскажите о вашем опыте покупки..."
                  rows={5}
                  className="mt-1.5 w-full bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono text-sm px-3 py-2 resize-none focus:outline-none"
                />
              </div>
              <Button
                onClick={submit}
                disabled={loading}
                className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SENDING...</> : <><Send className="w-4 h-4 mr-2" strokeWidth={3} /> Отправить отзыв</>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Submitted success */}
        {submitted && (
          <div className="bg-[#0E0E0E] border-2 border-[#BFFF00] p-4 mb-6 flex items-center gap-3"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#BFFF00]" strokeWidth={2.5} />
            <div className="text-sm font-mono">
              <span className="text-[#BFFF00] font-bold">{"// THANK_YOU"}</span>
              <span className="text-[#888]"> — отзыв отправлен. Опубликуем после проверки модератором.</span>
            </div>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-[#888] font-mono">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="uppercase">&gt; Пока нет отзывов. Будьте первым!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="bg-[#121212] border-2 border-[#2A2A2A] p-5"
                style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A1A1A] border-2 border-[#FFE600]/40 flex items-center justify-center font-black text-[#FFE600] font-mono">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-tight">{r.name}</div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-3 h-3"
                            fill={s <= r.rating ? "#FFE600" : "none"}
                            stroke="#FFE600"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">
                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                {r.product && (
                  <div className="inline-block px-2 py-0.5 bg-[#BFFF00]/10 border border-[#BFFF00]/30 text-[10px] text-[#BFFF00] font-mono uppercase mb-2">
                    {r.product}
                  </div>
                )}
                <p className="text-sm text-[#888] leading-relaxed font-mono whitespace-pre-wrap">{r.text}</p>
                {r.reply && (
                  <div className="mt-3 pt-3 border-t border-[#1F1F1F]">
                    <div className="text-[10px] text-[#00F0FF] font-mono uppercase mb-1">{"// ОТВЕТ_HYPEHUB"}</div>
                    <p className="text-sm text-[#888] font-mono">{r.reply}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
