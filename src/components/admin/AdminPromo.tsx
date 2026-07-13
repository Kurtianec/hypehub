"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Ticket, Plus, Trash2, Loader2, X, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TOKEN = "hypehub-admin-2024";

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  maxUses: number;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
  active: boolean;
}

export function AdminPromo() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    code: "",
    discount: "",
    maxUses: "",
    expiresAt: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promo-codes", { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setCodes(data.codes);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPromo = async () => {
    if (!form.code || !form.discount) {
      toast({ title: "Код и скидка обязательны", variant: "destructive" });
      return;
    }
    const discount = parseFloat(form.discount);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      toast({ title: "Скидка должна быть 1-100%", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({
          code: form.code,
          discount,
          maxUses: form.maxUses || undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Ошибка");
      }
      toast({ title: "Промокод создан", description: form.code.toUpperCase() });
      setForm({ code: "", discount: "", maxUses: "", expiresAt: "" });
      setCreating(false);
      load();
    } catch (e: unknown) {
      toast({ title: "Ошибка", description: e instanceof Error ? e.message : "Не удалось создать", variant: "destructive" });
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/promo-codes/${deleteId}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Промокод удалён" });
      setDeleteId(null);
      load();
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, code }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#10B981]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_PROMO"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Промокоды</h1>
          <p className="text-sm text-[#888] font-mono">
            &gt; Всего: {codes.length} · Активных: {codes.filter((c) => c.active).length}
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
        >
          <Plus className="w-4 h-4 mr-1.5" strokeWidth={3} />
          Создать промокод
        </Button>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Пока нет промокодов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {codes.map((c) => {
            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const isExhausted = c.maxUses > 0 && c.uses >= c.maxUses;
            const isUsable = c.active && !isExpired && !isExhausted;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#10B981] p-4 transition-colors"
                style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-black text-lg font-mono tracking-wider text-[#10B981]">{c.code}</div>
                    <div className="text-2xl font-black text-[#BFFF00] font-mono">{c.discount}%</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isUsable ? (
                      <span className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Активен
                      </span>
                    ) : isExpired ? (
                      <span className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> Истёк
                      </span>
                    ) : isExhausted ? (
                      <span className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/40">
                        Исчерпан
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase bg-[#888]/15 text-[#888] border-[#888]/40">
                        Неактивен
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="text-[#888] hover:text-[#FF3333] transition-colors"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-[#888] uppercase">
                  <div className="flex justify-between">
                    <span>Использовано:</span>
                    <span className="text-foreground">
                      {c.uses}{c.maxUses > 0 ? ` / ${c.maxUses}` : " / ∞"}
                    </span>
                  </div>
                  {c.expiresAt && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Истекает:
                      </span>
                      <span className="text-foreground">
                        {new Date(c.expiresAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Создан:</span>
                    <span className="text-foreground">
                      {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent className="max-w-md glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Новый промокод</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase font-mono">Код</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER2024"
                  className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono uppercase"
                />
                <Button
                  type="button"
                  onClick={generateCode}
                  variant="outline"
                  className="font-mono text-xs uppercase"
                >
                  Сгенерировать
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase font-mono">Скидка (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                placeholder="15"
                className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase font-mono">Макс. использований (0 = ∞)</Label>
              <Input
                type="number"
                min="0"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="100"
                className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase font-mono">Дата истечения (необязательно)</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={createPromo}
                className="flex-1 bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase font-mono"
              >
                Создать
              </Button>
              <Button
                onClick={() => setCreating(false)}
                variant="outline"
                className="font-mono uppercase"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Удалить промокод?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#888] font-mono">
            &gt; Действие необратимо. Все последующие применения этого кода будут отклонены.
          </p>
          <div className="flex gap-2 pt-3">
            <Button
              onClick={onDelete}
              disabled={deleting}
              className="flex-1 bg-[#FF3333] hover:bg-[#FF3333]/80 text-white font-black uppercase font-mono"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Удалить"}
            </Button>
            <Button onClick={() => setDeleteId(null)} variant="outline" className="font-mono uppercase">
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
