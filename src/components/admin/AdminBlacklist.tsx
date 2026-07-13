"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldBan, Plus, Trash2, Loader2, X, Mail, Globe, AlertTriangle, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TOKEN = "hypehub-admin-2024";

interface BlacklistEntry {
  id: string;
  key: string;   // e.g. "bl_email_spam@xx.com"
  value: string; // e.g. "email:spam@xx.com"
}

export function AdminBlacklist() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BlacklistEntry | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ type: "email", value: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blacklist", { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setEntries(data.blacklist);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addEntry = async () => {
    if (!form.value.trim()) {
      toast({ title: "Введите значение", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ type: form.type, value: form.value.trim() }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Ошибка");
      }
      toast({
        title: "Добавлено в чёрный список",
        description: `${form.type}: ${form.value}`,
      });
      setForm({ type: "email", value: "" });
      setAdding(false);
      load();
    } catch (e: unknown) {
      toast({
        title: "Ошибка",
        description: e instanceof Error ? e.message : "Не удалось добавить",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blacklist?id=${deleteId}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Удалено из чёрного списка" });
      setDeleteId(null);
      setConfirmDelete(null);
      load();
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3333]" />
      </div>
    );
  }

  const emailEntries = entries.filter((e) => e.value.startsWith("email:"));
  const ipEntries = entries.filter((e) => e.value.startsWith("ip:"));
  const otherEntries = entries.filter((e) => !e.value.startsWith("email:") && !e.value.startsWith("ip:"));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#FF3333]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_BLACKLIST"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Чёрный список</h1>
          <p className="text-sm text-[#888] font-mono">
            &gt; Заблокированные email и IP. Подозрительные действия помечаются автоматически.
          </p>
        </div>
        <Button
          onClick={() => setAdding(true)}
          className="bg-[#FF3333] hover:bg-[#FF3333]/80 text-white font-black uppercase border-2 border-[#FF3333] font-mono tracking-wide"
        >
          <Plus className="w-4 h-4 mr-1.5" strokeWidth={3} />
          Добавить
        </Button>
      </div>

      {/* Warning banner */}
      <div
        className="mb-6 bg-[#FF3333]/10 border-2 border-[#FF3333]/40 p-4 flex items-start gap-3"
        style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
      >
        <AlertTriangle className="w-5 h-5 text-[#FF3333] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="text-xs font-mono">
          <div className="font-black uppercase text-[#FF3333] mb-1">// ВНИМАНИЕ</div>
          <div className="text-[#888]">
            &gt; Записи в чёрном списке блокируют оформление заказов и отправку сообщений в поддержку с указанных адресов.
            <br />&gt; Добавление требует ручного подтверждения администратора.
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Чёрный список пуст</p>
          <p className="text-[10px] mt-2">Все пользователи активны</p>
        </div>
      ) : (
        <div className="space-y-6">
          {emailEntries.length > 0 && (
            <BlacklistSection
              title="EMAIL"
              icon={Mail}
              color="#A855F7"
              entries={emailEntries}
              onDelete={(e) => setConfirmDelete(e)}
            />
          )}
          {ipEntries.length > 0 && (
            <BlacklistSection
              title="IP-АДРЕСА"
              icon={Globe}
              color="#00F0FF"
              entries={ipEntries}
              onDelete={(e) => setConfirmDelete(e)}
            />
          )}
          {otherEntries.length > 0 && (
            <BlacklistSection
              title="ДРУГОЕ"
              icon={ShieldBan}
              color="#FFD700"
              entries={otherEntries}
              onDelete={(e) => setConfirmDelete(e)}
            />
          )}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={adding} onOpenChange={(o) => !o && setAdding(false)}>
        <DialogContent className="max-w-md glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Добавить в чёрный список</DialogTitle>
            <DialogDescription className="text-[#888] font-mono text-xs">
              &gt; Запись будет немедленно активна для всех новых действий
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase font-mono">Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email адрес</SelectItem>
                  <SelectItem value="ip">IP-адрес</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase font-mono">
                {form.type === "email" ? "Email" : "IP-адрес"}
              </Label>
              <Input
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "email" ? "spam@example.com" : "192.168.1.1"}
                className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1"
              />
            </div>
            <div className="bg-[#FF3333]/10 border border-[#FF3333]/30 p-2 text-[10px] font-mono text-[#888]">
              &gt; Будет заблокировано: оформление заказов, обращения в поддержку с этого источника
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={addEntry}
                className="flex-1 bg-[#FF3333] hover:bg-[#FF3333]/80 text-white font-black uppercase font-mono"
              >
                Заблокировать
              </Button>
              <Button onClick={() => setAdding(false)} variant="outline" className="font-mono uppercase">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation (admin confirmation required) */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-md glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Подтвердите разблокировку</DialogTitle>
            <DialogDescription className="text-[#888] font-mono text-xs">
              &gt; Требуется подтверждение администратора
            </DialogDescription>
          </DialogHeader>
          {confirmDelete && (
            <div className="space-y-3">
              <div className="bg-[#121212] border border-[#2A2A2A] p-3 font-mono text-xs">
                <div className="text-[#888] uppercase mb-1">Запись:</div>
                <div className="text-foreground break-all">{confirmDelete.value}</div>
              </div>
              <p className="text-xs text-[#888]">
                Пользователь с этим {confirmDelete.value.startsWith("email:") ? "email" : "IP"} снова сможет оформлять заказы и обращаться в поддержку.
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setDeleteId(confirmDelete.id);
                    onDelete();
                  }}
                  disabled={deleting}
                  className="flex-1 bg-[#10B981] hover:bg-[#10B981]/80 text-white font-black uppercase font-mono"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Разблокировать"}
                </Button>
                <Button
                  onClick={() => setConfirmDelete(null)}
                  variant="outline"
                  className="font-mono uppercase"
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlacklistSection({
  title,
  icon: Icon,
  color,
  entries,
  onDelete,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  color: string;
  entries: BlacklistEntry[];
  onDelete: (e: BlacklistEntry) => void;
}) {
  return (
    <div
      className="bg-[#121212] border-2 border-[#2A2A2A] p-5"
      style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
    >
      <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
        <Icon className="w-4 h-4" style={{ color }} strokeWidth={2.5} />
        <span className="font-mono text-xs" style={{ color }}>
          {"// "}{title} · {entries.length}
        </span>
      </h3>
      <div className="space-y-2">
        {entries.map((e) => {
          const value = e.value.split(":").slice(1).join(":");
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 py-2 px-3 bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#FF3333]/50 transition-colors"
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono truncate">{value}</div>
                <div className="text-[10px] text-[#888] font-mono uppercase">
                  ID: {e.id.slice(0, 24)}...
                </div>
              </div>
              <button
                onClick={() => onDelete(e)}
                className="text-[#888] hover:text-[#10B981] transition-colors px-2 py-1 text-[10px] font-mono uppercase border border-[#2A2A2A] hover:border-[#10B981]"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Разблокировать
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
