"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Star, Check, X, Trash2, MessageSquare, Clock, Pencil, Save, Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TOKEN = "hypehub-admin-2024";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает", color: "#FFE600" },
  approved: { label: "Одобрен", color: "#BFFF00" },
  rejected: { label: "Отклонён", color: "#FF3333" },
  archived: { label: "Архив", color: "#A855F7" },
};

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  product?: string | null;
  reply?: string | null;
  status: string;
  createdAt: string;
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews?status=all", { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setReviews(data.reviews);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: `Статус: ${STATUS_CONFIG[status]?.label || status}` });
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ reply: replyText, status: "approved" }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Ответ отправлен" });
      setReplyingTo(null);
      setReplyText("");
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Удалить отзыв навсегда?")) return;
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      toast({ title: "Отзыв удалён" });
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#BFFF00]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-[#FFE600]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_REVIEWS"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">
          Отзывы
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-[#FFE600] text-black text-xs font-black border-2 border-[#FFE600] font-mono">
              {pendingCount} NEW
            </span>
          )}
        </h1>
        <p className="text-sm text-[#888] font-mono">&gt; Всего: {reviews.length}</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 bg-[#121212] border-2 border-[#2A2A2A] p-1 mb-6 w-fit">
        {[
          { v: "all", l: "ВСЕ" },
          { v: "pending", l: "ОЖИДАЮТ" },
          { v: "approved", l: "ОДОБРЕНЫ" },
          { v: "rejected", l: "ОТКЛОНЕНЫ" },
          { v: "archived", l: "АРХИВ" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-all font-mono",
              filter === f.v ? "bg-[#BFFF00] text-black" : "text-[#888] hover:text-foreground"
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Нет отзывов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[current] p-5 transition-colors"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  color: status.color,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A1A1A] border-2 flex items-center justify-center font-black font-mono"
                      style={{ borderColor: `${status.color}40`, color: status.color }}
                    >
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-tight text-foreground">{r.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3 h-3" fill={s <= r.rating ? "#FFE600" : "none"} stroke="#FFE600" />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase"
                          style={{ background: `${status.color}15`, color: status.color, borderColor: `${status.color}40` }}
                        >
                          {status.label}
                        </span>
                        {r.status === "pending" && <Clock className="w-3 h-3" style={{ color: status.color }} />}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#888] font-mono uppercase">
                    {new Date(r.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>

                {r.product && (
                  <div className="inline-block px-2 py-0.5 bg-[#BFFF00]/10 border border-[#BFFF00]/30 text-[10px] text-[#BFFF00] font-mono uppercase mb-2">
                    {r.product}
                  </div>
                )}

                <p className="text-sm text-[#888] font-mono mb-3 whitespace-pre-wrap">{r.text}</p>

                {r.reply && (
                  <div className="bg-[#0A0A0A] border-l-2 border-[#00F0FF] p-3 mb-3">
                    <div className="text-[10px] text-[#00F0FF] font-mono uppercase mb-1">{"// ОТВЕТ_HYPEHUB"}</div>
                    <p className="text-sm text-[#888] font-mono">{r.reply}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#1F1F1F]">
                  {r.status !== "approved" && (
                    <Button size="sm" onClick={() => updateStatus(r.id, "approved")}
                      className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/80 font-black uppercase border-2 border-[#BFFF00] font-mono text-xs">
                      <Check className="w-3.5 h-3.5 mr-1" strokeWidth={3} />
                      Одобрить
                    </Button>
                  )}
                  {r.status !== "rejected" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "rejected")}
                      className="text-[#FF3333] hover:bg-[#FF3333]/10 font-mono uppercase text-xs">
                      <X className="w-3.5 h-3.5 mr-1" strokeWidth={3} />
                      Отклонить
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setEditingReview(r)}
                    className="text-[#FF2D87] hover:bg-[#FF2D87]/10 font-mono uppercase text-xs">
                    <Pencil className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                    Изменить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(replyingTo === r.id ? null : r.id); setReplyText(r.reply || ""); }}
                    className="text-[#00F0FF] hover:bg-[#00F0FF]/10 font-mono uppercase text-xs">
                    <MessageSquare className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                    {r.reply ? "Изменить ответ" : "Ответить"}
                  </Button>
                  {r.status !== "archived" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "archived")}
                      className="text-[#A855F7] hover:bg-[#A855F7]/10 font-mono uppercase text-xs">
                      <Archive className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                      В архив
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteReview(r.id)}
                    className="text-[#FF3333] hover:bg-[#FF3333]/10 ml-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Reply form */}
                {replyingTo === r.id && (
                  <div className="mt-3 pt-3 border-t border-[#1F1F1F]">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Ваш ответ на отзыв..."
                      rows={3}
                      className="bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#00F0FF] font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => sendReply(r.id)}
                        className="bg-[#00F0FF] text-black hover:bg-[#00F0FF]/80 font-black uppercase border-2 border-[#00F0FF] font-mono text-xs">
                        Отправить ответ
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}
                        className="text-[#888] font-mono uppercase text-xs">
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <EditReviewDialog
        review={editingReview}
        open={!!editingReview}
        onClose={() => setEditingReview(null)}
        onSave={() => { load(); setEditingReview(null); }}
      />
    </div>
  );
}

function EditReviewDialog({
  review,
  open,
  onClose,
  onSave,
}: {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const initKey = review?.id || "new";
  const [lastKey, setLastKey] = useState("");
  if (initKey !== lastKey && open) {
    setLastKey(initKey);
    if (review) {
      setForm({
        name: review.name,
        rating: review.rating,
        text: review.text,
        product: review.product || "",
        reply: review.reply || "",
        status: review.status,
      });
    }
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!review) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({
          name: form.name,
          rating: parseInt(String(form.rating)),
          text: form.text,
          product: form.product,
          reply: form.reply,
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Отзыв обновлён" });
      onSave();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-[#0E0E0E] border-2 border-[#FF2D87]">
        <DialogHeader>
          <DialogTitle className="uppercase font-black tracking-tight font-mono">{"// РЕДАКТИРОВАНИЕ_ОТЗЫВА"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ИМЯ"}</Label>
            <Input
              value={String(form.name || "")}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// РЕЙТИНГ"}</Label>
            <div className="flex gap-2 mt-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => set("rating", s)}
                  className="w-10 h-10 border-2 flex items-center justify-center hover:border-[#FFE600] transition-colors"
                  style={{
                    borderColor: s <= (form.rating as number) ? "#FFE600" : "#2A2A2A",
                    background: s <= (form.rating as number) ? "#FFE60015" : "transparent",
                  }}
                >
                  <Star
                    className="w-5 h-5"
                    fill={s <= (form.rating as number) ? "#FFE600" : "none"}
                    stroke="#FFE600"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ТОВАР"}</Label>
            <Input
              value={String(form.product || "")}
              onChange={(e) => set("product", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ТЕКСТ ОТЗЫВА"}</Label>
            <Textarea
              value={String(form.text || "")}
              onChange={(e) => set("text", e.target.value)}
              rows={5}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono text-sm"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ОТВЕТ HYPEHUB"}</Label>
            <Textarea
              value={String(form.reply || "")}
              onChange={(e) => set("reply", e.target.value)}
              rows={3}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono text-sm"
              placeholder="Ответ компании..."
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// СТАТУС"}</Label>
            <div className="flex gap-2 mt-1.5">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => set("status", k)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-black uppercase border-2 transition-all font-mono",
                    form.status === k ? "text-black" : "text-[#888] border-[#2A2A2A]"
                  )}
                  style={form.status === k ? { background: v.color, borderColor: v.color } : {}}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent border-2 border-[#2A2A2A] font-mono uppercase">
            Отмена
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-[#FF2D87] text-white hover:bg-[#FF2D87]/80 font-black uppercase border-2 border-[#FF2D87] font-mono tracking-wide"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" strokeWidth={3} />}
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
