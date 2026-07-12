"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tags, Save, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Category, Platform } from "@/lib/types";
import { PLATFORM_COLORS, PLATFORM_GRADIENTS } from "@/lib/types";

const TOKEN = "hypehub-admin-2024";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "vk", label: "VK" },
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "other", label: "Другое" },
];

const ICON_OPTIONS = ["Music2", "Youtube", "Users", "Instagram", "Send", "Tag", "Star", "Crown", "Flame", "Trophy"];

export function AdminCategories({
  categories,
  onChange,
}: {
  categories: Category[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const onDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Категория удалена" });
      setDeleteId(null);
      onChange();
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#FFE600]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_CATEGORIES"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Категории</h1>
          <p className="text-sm text-[#888] font-mono">
            &gt; Всего: {categories.length} · Управление платформами
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
        >
          <Plus className="w-4 h-4 mr-1.5" strokeWidth={3} />
          Добавить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[current] p-4 transition-colors"
            style={{
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              color: cat.color,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 border-2"
                style={{ background: PLATFORM_GRADIENTS[cat.platform], borderColor: cat.color }}
              >
                <Tags className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm leading-tight uppercase tracking-tight">{cat.name}</h3>
                <div className="text-[10px] text-[#888] font-mono uppercase">{cat.platform}</div>
              </div>
            </div>
            {cat.description && (
              <p className="text-xs text-[#888] mb-3 line-clamp-2 font-mono">{cat.description}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(cat)} className="flex-1 text-xs hover:bg-[#BFFF00]/10 hover:text-[#BFFF00] font-mono uppercase">
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Изменить
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteId(cat.id)}
                className="text-[#FF3333] hover:text-[#FF3333] hover:bg-[#FF3333]/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <CategoryForm
        category={editing}
        open={!!editing || creating}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={() => { onChange(); setEditing(null); setCreating(false); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="glass-strong border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Все товары в этой категории также будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryForm({
  category,
  open,
  onClose,
  onSave,
}: {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const isCreate = !category;
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const initKey = category?.id || "new";
  const [lastKey, setLastKey] = useState("");
  if (initKey !== lastKey && open) {
    setLastKey(initKey);
    setForm({
      name: category?.name || "",
      slug: category?.slug || "",
      icon: category?.icon || "Tag",
      color: category?.color || "#FF0050",
      platform: category?.platform || "tiktok",
      description: category?.description || "",
      order: category?.order || 0,
    });
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "Заполните название и slug", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = isCreate ? "/api/categories" : `/api/categories/${category!.id}`;
      const method = isCreate ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: isCreate ? "Категория создана" : "Категория обновлена" });
      onSave();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg glass-strong border-white/10">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Новая категория" : "Редактирование категории"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Название *</Label>
            <Input
              value={String(form.name || "")}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1 bg-white/5 border-white/10"
              placeholder="TikTok аккаунты"
            />
          </div>
          <div>
            <Label className="text-xs">Slug (URL) *</Label>
            <Input
              value={String(form.slug || "")}
              onChange={(e) => set("slug", e.target.value)}
              className="mt-1 bg-white/5 border-white/10 font-mono"
              placeholder="tiktok"
            />
          </div>
          <div>
            <Label className="text-xs">Платформа</Label>
            <Select
              value={String(form.platform || "tiktok")}
              onValueChange={(v) => set("platform", v)}
            >
              <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Иконка (Lucide name)</Label>
            <Select
              value={String(form.icon || "Tag")}
              onValueChange={(v) => set("icon", v)}
            >
              <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((ic) => (
                  <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Цвет</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={String(form.color || "#FF0050")}
                onChange={(e) => set("color", e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
              />
              <Input
                value={String(form.color || "")}
                onChange={(e) => set("color", e.target.value)}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Описание</Label>
            <Input
              value={String(form.description || "")}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1 bg-white/5 border-white/10"
              placeholder="Готовые аккаунты..."
            />
          </div>
          <div>
            <Label className="text-xs">Порядок</Label>
            <Input
              type="number"
              value={String(form.order || 0)}
              onChange={(e) => set("order", parseInt(e.target.value) || 0)}
              className="mt-1 bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10">
            Отмена
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#FF0050] to-[#FF0000] text-white font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isCreate ? "Создать" : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
