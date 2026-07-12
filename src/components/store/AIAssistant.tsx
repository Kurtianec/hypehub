"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, Bot, User, Lightbulb, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Как купить аккаунт?",
  "Способы оплаты?",
  "Какая гарантия?",
  "Когда придут данные?",
  "Это законно?",
  "Что если не подойдёт?",
];

const CONTEXT_SUGGESTIONS: Record<string, string[]> = {
  catalog: ["Какой аккаунт выбрать?", "Чем TikTok от VK?", "Что значит монетизация?"],
  "how-to-buy": ["Сколько идёт оплата?", "Можно криптой?", "Что после оплаты?"],
  advantages: ["Как работает гарантия?", "Что значит мгновенная выдача?"],
  faq: ["Что ещё знать?", "Как связаться?"],
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Привет! Я AI-ассистент ХайпХаб. Помогу выбрать аккаунт, объясню как купить и отвечу на вопросы. Чем помочь?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<string>("");
  const [hint, setHint] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.3) {
            setContext(e.target.id);
          }
        }
      },
      { threshold: [0.3] }
    );
    ["catalog", "how-to-buy", "advantages", "faq"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (context && !open) {
      const hints: Record<string, string> = {
        catalog: "Наведите на товар — подскажу что выбрать",
        "how-to-buy": "Покупка займёт < 2 минут",
        advantages: "Узнайте почему нам доверяют",
        faq: "Ответы на частые вопросы",
      };
      setHint(hints[context]);
      const t = setTimeout(() => setHint(null), 4000);
      return () => clearTimeout(t);
    }
  }, [context, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-assistant", handler);
    return () => window.removeEventListener("open-assistant", handler);
  }, []);

  const send = async (text?: string) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((m) => [...m, {
        role: "assistant",
        content: "Не смог ответить. Напишите в чат поддержки — поможем!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = CONTEXT_SUGGESTIONS[context] || SUGGESTIONS;

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 bg-[#BFFF00] text-black border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:text-white hover:border-[#FF2D87] flex items-center justify-center group transition-colors animate-float-y"
            style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
            aria-label="Открыть AI-ассистент"
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF2D87] border-2 border-black flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white blink" />
            </span>
            <Bot className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hint bubble */}
      <AnimatePresence>
        {hint && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 max-w-[260px] bg-[#0E0E0E] border-2 border-[#BFFF00] p-3 pr-9"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
          >
            <button
              onClick={() => setHint(null)}
              className="absolute top-2 right-2 w-5 h-5 hover:bg-white/10 flex items-center justify-center"
              aria-label="Закрыть подсказку"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#FFE600] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-black mb-0.5 uppercase font-mono text-[#BFFF00]">AI_ASSIST</div>
                <div className="text-xs text-[#888] font-mono">{hint}</div>
                <button
                  onClick={() => setOpen(true)}
                  className="text-xs text-[#FF2D87] font-black mt-1.5 hover:underline font-mono uppercase"
                >
                  &gt; Спросить
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-50 w-auto md:w-[400px] h-[600px] max-h-[85vh] bg-[#0A0A0A] border-2 border-[#BFFF00] flex flex-col overflow-hidden"
            style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#1F1F1F] bg-[#0E0E0E]">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-[#BFFF00] flex items-center justify-center border-2 border-[#BFFF00]">
                  <Bot className="w-5 h-5 text-black" strokeWidth={2.5} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#BFFF00] border-2 border-[#0E0E0E]">
                    <span className="block w-full h-full bg-[#BFFF00] blink" />
                  </span>
                </div>
                <div>
                  <div className="font-black text-sm flex items-center gap-1.5 uppercase tracking-tight">
                    AI_ASSIST
                    <Sparkles className="w-3 h-3 text-[#FFE600]" />
                  </div>
                  <div className="text-[10px] text-[#888] font-mono uppercase flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full bg-[#BFFF00] opacity-75 blink"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 bg-[#BFFF00]"></span>
                    </span>
                    ONLINE · 24/7
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 hover:bg-white/10 flex items-center justify-center"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Context badge */}
            {context && (
              <div className="px-4 py-1.5 bg-[#1A1A1A] border-b border-[#1F1F1F] text-[10px] text-[#888] font-mono uppercase">
                &gt; CTX: <span className="text-[#BFFF00]">{context}</span>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", msg.role === "user" && "justify-end")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-[#BFFF00] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 text-sm font-mono",
                      msg.role === "user"
                        ? "bg-[#FF2D87] text-white border-2 border-[#FF2D87]"
                        : "bg-[#121212] text-foreground border border-[#2A2A2A]"
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-[#888]" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-[#BFFF00] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div className="bg-[#121212] border border-[#2A2A2A] px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#BFFF00] blink" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#BFFF00] blink" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#BFFF00] blink" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {messages.length <= 1 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-[#888] px-1 font-mono uppercase">{"// Популярные:"}</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 border border-[#2A2A2A] bg-[#121212] hover:border-[#BFFF00] hover:text-[#BFFF00] transition-colors text-foreground font-mono"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t-2 border-[#1F1F1F] bg-[#0E0E0E]">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="> спросите что-нибудь..."
                  className="bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono text-sm"
                  disabled={loading}
                />
                <Button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white border-2 border-[#BFFF00] hover:border-[#FF2D87] flex-shrink-0"
                  aria-label="Отправить"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={2.5} />}
                </Button>
              </div>
              <p className="text-[10px] text-[#888] text-center mt-2 font-mono uppercase">
                AI может ошибаться · для срочных вопросов — чат поддержки
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
