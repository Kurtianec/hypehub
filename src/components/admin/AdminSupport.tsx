"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Loader2, Mail, Send, Clock, Trash2, Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TOKEN = "hypehub-admin-2024";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новое", color: "#FF2D87" },
  replied: { label: "Отвечено", color: "#BFFF00" },
  closed: { label: "Закрыто", color: "#888" },
  archived: { label: "Архив", color: "#A855F7" },
};

interface SupportMessageExt {
  id: string;
  name: string;
  contact: string;
  message: string;
  reply?: string | null;
  status: string;
  sessionId?: string | null;
  createdAt: string;
}

export function AdminSupport() {
  const [messages, setMessages] = useState<SupportMessageExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMsg, setViewMsg] = useState<SupportMessageExt | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support", { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setMessages(data.messages);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sendReply = async () => {
    if (!viewMsg || !reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${viewMsg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ reply, status: "replied" }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Ответ отправлен" });
      setReply("");
      setViewMsg(null);
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ status }),
      });
      toast({ title: `Статус: ${STATUS_CONFIG[status]?.label || status}` });
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Удалить сообщение навсегда?")) return;
    try {
      await fetch(`/api/support/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      toast({ title: "Удалено" });
      setViewMsg(null);
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF2D87]" />
      </div>
    );
  }

  const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);
  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#A855F7]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_SUPPORT"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">
          Поддержка
          {newCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-[#FF2D87] text-white text-xs font-black border-2 border-[#FF2D87] font-mono">
              {newCount} NEW
            </span>
          )}
        </h1>
        <p className="text-sm text-[#888] font-mono">&gt; Всего: {messages.length}</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 bg-[#121212] border-2 border-[#2A2A2A] p-1 mb-6 w-fit">
        {[
          { v: "all", l: "ВСЕ" },
          { v: "new", l: "НОВЫЕ" },
          { v: "replied", l: "ОТВЕЧЕНЫ" },
          { v: "closed", l: "ЗАКРЫТЫ" },
          { v: "archived", l: "АРХИВ" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-all font-mono",
              filter === f.v ? "bg-[#FF2D87] text-white" : "text-[#888] hover:text-foreground"
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Нет сообщений</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const status = STATUS_CONFIG[m.status] || STATUS_CONFIG.new;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => { setViewMsg(m); setReply(m.reply || ""); }}
                className="w-full text-left bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#A855F7] p-4 transition-colors"
                style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 font-black border-2 font-mono"
                    style={{ background: `${status.color}15`, color: status.color, borderColor: `${status.color}40` }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm uppercase tracking-tight">{m.name}</span>
                      <span
                        className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase"
                        style={{ background: `${status.color}15`, color: status.color, borderColor: `${status.color}40` }}
                      >
                        {status.label}
                      </span>
                      {m.status === "new" && (
                        <Clock className="w-3 h-3 text-[#FF2D87]" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-[#888] mb-1 font-mono uppercase">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{m.contact}</span>
                      <span>{new Date(m.createdAt).toLocaleString("ru-RU")}</span>
                    </div>
                    <p className="text-sm text-[#888] line-clamp-2 font-mono">{m.message}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* View + reply dialog with full editing */}
      <Dialog open={!!viewMsg} onOpenChange={(o) => !o && setViewMsg(null)}>
        <DialogContent className="max-w-lg bg-[#0E0E0E] border-2 border-[#A855F7]">
          <DialogHeader>
            <DialogTitle className="uppercase font-black tracking-tight font-mono">
              {"// СООБЩЕНИЕ_ОТ_"}{viewMsg?.name.toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {viewMsg && (
            <div className="space-y-4">
              <div className="bg-[#121212] border-2 border-[#2A2A2A] p-4"
                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
              >
                <div className="flex items-center gap-2 text-[10px] text-[#888] mb-2 font-mono uppercase">
                  <Mail className="w-3 h-3" />
                  {viewMsg.contact}
                  <span className="ml-auto">{new Date(viewMsg.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap font-mono text-[#888]">{viewMsg.message}</p>
              </div>

              {viewMsg.reply && (
                <div className="bg-[#0A0A0A] border-l-2 border-[#BFFF00] p-3">
                  <div className="text-[10px] text-[#BFFF00] font-mono uppercase mb-1">{"// ТЕКУЩИЙ_ОТВЕТ"}</div>
                  <p className="text-sm text-[#888] font-mono whitespace-pre-wrap">{viewMsg.reply}</p>
                </div>
              )}

              <div>
                <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">
                  {"// "}{viewMsg.reply ? "НОВЫЙ ОТВЕТ" : "ОТВЕТ"}
                </Label>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Введите ответ..."
                  className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#A855F7] font-mono text-sm"
                />
              </div>

              {/* Status buttons */}
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">{"// СТАТУС"}</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => {
                        updateStatus(viewMsg.id, k);
                        setViewMsg({ ...viewMsg, status: k });
                      }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-black uppercase border-2 transition-all font-mono",
                        viewMsg.status === k ? "text-white" : "text-[#888] border-[#2A2A2A]"
                      )}
                      style={viewMsg.status === k ? { background: v.color, borderColor: v.color } : {}}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1F1F1F]">
                <Button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="flex-1 bg-[#A855F7] text-white hover:bg-[#A855F7]/80 font-black uppercase border-2 border-[#A855F7] font-mono tracking-wide"
                >
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" strokeWidth={3} />}
                  Отправить
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => deleteMsg(viewMsg.id)}
                  className="text-[#FF3333] hover:bg-[#FF3333]/10 font-mono uppercase"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
