"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, Headphones, CheckCircle2, User, MessageCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StoredMessage {
  id: string;
  name: string;
  message: string;
  reply: string | null;
  status: string;
  createdAt: string;
  // for local UI tracking
  outgoing?: boolean;
}

const SESSION_KEY = "hypehub_support_session";
const MESSAGES_KEY = "hypehub_support_messages";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = `sup_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

function loadLocalMessages(): StoredMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(msgs: StoredMessage[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [newReply, setNewReply] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const { toast } = useToast();
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Init session + load stored messages
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    const stored = loadLocalMessages();
    if (stored.length > 0) {
      setMessages(stored);
      setStep("chat");
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Poll for admin replies every 5s when chat is open
  const pollForReplies = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/support/status?token=${sessionId}`);
      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        const localMsgs = loadLocalMessages();
        let changed = false;
        for (const serverMsg of data.messages) {
          const localIdx = localMsgs.findIndex((m) => m.id === serverMsg.id);
          if (localIdx >= 0) {
            // Update existing — check for new reply
            if (serverMsg.reply && localMsgs[localIdx].reply !== serverMsg.reply) {
              localMsgs[localIdx].reply = serverMsg.reply;
              localMsgs[localIdx].status = serverMsg.status;
              changed = true;
              setNewReply(true);
              toast({
                title: "Новый ответ от поддержки",
                description: "Откройте чат, чтобы прочитать",
              });
            }
          }
        }
        if (changed) {
          saveLocalMessages(localMsgs);
          setMessages([...localMsgs]);
        }
      }
    } catch {
      // silent
    }
  }, [sessionId, toast]);

  useEffect(() => {
    if (open && sessionId) {
      pollForReplies();
      pollRef.current = setInterval(pollForReplies, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, sessionId, pollForReplies]);

  // Listen for "open-support" event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-support", handler);
    return () => window.removeEventListener("open-support", handler);
  }, []);

  const submit = async () => {
    if (!name || !contact || !message) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message, sessionId }),
      });
      if (!res.ok) throw new Error("Ошибка");
      const data = await res.json();

      // Add to local messages
      const newMsg: StoredMessage = {
        id: data.id,
        name,
        message,
        reply: null,
        status: "new",
        createdAt: new Date().toISOString(),
        outgoing: true,
      };
      const updated = [...messages, newMsg];
      setMessages(updated);
      saveLocalMessages(updated);

      setMessage("");
      setStep("chat");
      toast({ title: "Сообщение отправлено", description: "Оператор ответит в течение 2 минут" });
    } catch {
      toast({ title: "Ошибка отправки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendFollowUp = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message, sessionId }),
      });
      if (!res.ok) throw new Error("Ошибка");
      const data = await res.json();

      const newMsg: StoredMessage = {
        id: data.id,
        name,
        message,
        reply: null,
        status: "new",
        createdAt: new Date().toISOString(),
        outgoing: true,
      };
      const updated = [...messages, newMsg];
      setMessages(updated);
      saveLocalMessages(updated);
      setMessage("");
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setNewReply(false);
  };

  const hasReplies = messages.some((m) => m.reply);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-24 md:right-28 z-40 w-14 h-14 md:w-16 md:h-16 bg-[#0E0E0E] text-[#00F0FF] border-2 border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black flex items-center justify-center transition-colors"
            style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
            aria-label="Открыть чат техподдержки"
          >
            <Headphones className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[#FF2D87] text-white text-[9px] font-black border-2 border-black font-mono">
              24/7
            </span>
            {newReply && (
              <span className="absolute -top-2 -left-2 w-5 h-5 bg-[#BFFF00] text-black text-[10px] font-black border-2 border-black flex items-center justify-center font-mono">
                !
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-50 w-auto md:w-[400px] h-[560px] max-h-[85vh] bg-[#0A0A0A] border-2 border-[#00F0FF] flex flex-col overflow-hidden"
            style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#1F1F1F] bg-[#0E0E0E]">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-[#00F0FF] flex items-center justify-center border-2 border-[#00F0FF]">
                  <Headphones className="w-5 h-5 text-black" strokeWidth={2.5} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#BFFF00] border-2 border-[#0E0E0E]">
                    <span className="block w-full h-full bg-[#BFFF00] blink" />
                  </span>
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-tight">SUPPORT</div>
                  <div className="text-[10px] text-[#888] font-mono uppercase flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full bg-[#BFFF00] opacity-75 blink"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 bg-[#BFFF00]"></span>
                    </span>
                    ONLINE · ОТВЕТ ЗА 2 МИН
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

            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
              <AnimatePresence mode="wait">
                {step === "form" && messages.length === 0 && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <Headphones className="w-10 h-10 mx-auto mb-2 text-[#00F0FF]" strokeWidth={2.5} />
                      <h3 className="font-black text-lg uppercase tracking-tight">Напишите нам</h3>
                      <p className="text-sm text-[#888] font-mono">
                        &gt; Опишите вопрос — ответим за пару минут.
                      </p>
                    </div>

                    <div>
                      <Label className="text-[10px] uppercase tracking-widest font-mono text-[#00F0FF]">{"// ИМЯ"}</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Имя"
                        className="mt-1.5 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#00F0FF] font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] uppercase tracking-widest font-mono text-[#00F0FF]">{"// TELEGRAM / ТЕЛЕФОН"}</Label>
                      <Input
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="@telegram или +7..."
                        className="mt-1.5 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#00F0FF] font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] uppercase tracking-widest font-mono text-[#00F0FF]">{"// СООБЩЕНИЕ"}</Label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Опишите вопрос или проблему..."
                        rows={4}
                        className="mt-1.5 w-full bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#00F0FF] font-mono text-sm px-3 py-2 resize-none focus:outline-none"
                      />
                    </div>

                    <Button
                      onClick={submit}
                      disabled={loading}
                      className="w-full py-6 bg-[#00F0FF] text-black hover:bg-[#BFFF00] font-black uppercase border-2 border-[#00F0FF] hover:border-[#BFFF00] font-mono tracking-wide"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SENDING...</> : <>Отправить →</>}
                    </Button>
                  </motion.div>
                )}

                {step === "chat" || messages.length > 0 ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-[#888] font-mono text-sm">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        &gt; Нет сообщений в чате
                      </div>
                    )}

                    {messages.map((m, i) => (
                      <div key={m.id}>
                        {/* User message (outgoing) */}
                        <div className="flex gap-2 justify-end mb-2">
                          <div className="bg-[#FF2D87] text-white border-2 border-[#FF2D87] px-4 py-2.5 text-sm font-mono max-w-[80%]">
                            {m.message}
                          </div>
                          <div className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[#888]" />
                          </div>
                        </div>

                        {/* Status line */}
                        <div className="text-[10px] text-[#888] font-mono text-right mb-2 uppercase">
                          {m.status === "new" && <span className="text-[#FFE600]">&gt; ОЖИДАЕТ ОТВЕТА...</span>}
                          {m.status === "replied" && <span className="text-[#BFFF00]">&gt; ОТВЕЧЕНО</span>}
                          {m.status === "closed" && <span className="text-[#888]">&gt; ЗАКРЫТО</span>}
                        </div>

                        {/* Admin reply (if any) */}
                        {m.reply && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-2 mb-4"
                          >
                            <div className="w-8 h-8 bg-[#00F0FF] flex items-center justify-center flex-shrink-0">
                              <Headphones className="w-4 h-4 text-black" />
                            </div>
                            <div className="bg-[#121212] border border-[#2A2A2A] px-4 py-2.5 text-sm font-mono max-w-[80%]">
                              <div className="text-[10px] text-[#00F0FF] mb-1 uppercase font-bold">{"// SUPPORT_AGENT"}</div>
                              {m.reply}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}

                    {/* Input for follow-up */}
                    {messages.length > 0 && (
                      <div className="pt-4 border-t border-[#1F1F1F]">
                        <div className="flex gap-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendFollowUp()}
                            placeholder="Новое сообщение..."
                            className="bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#00F0FF] font-mono text-sm"
                          />
                          <Button
                            onClick={sendFollowUp}
                            disabled={loading || !message.trim()}
                            size="icon"
                            className="bg-[#00F0FF] text-black hover:bg-[#BFFF00] border-2 border-[#00F0FF] hover:border-[#BFFF00] flex-shrink-0"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={3} />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {messages.length > 0 && (
              <div className="p-2 border-t border-[#1F1F1F] bg-[#0E0E0E] text-center">
                <p className="text-[10px] text-[#888] font-mono uppercase flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3 h-3" />
                  АВТООБНОВЛЕНИЕ · 5 СЕК
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
