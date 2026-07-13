"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Save, Loader2, Search, Package,
  Archive, ArchiveRestore, CheckSquare, Square, X, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Category, Product } from "@/lib/types";
import { formatPrice, parseBadges, BADGE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const TOKEN = "hypehub-admin-2024";

const STATUS_LABELS: Record<string, string> = {
  available: "В продаже",
  reserved: "Забронирован",
  sold: "Продан",
  archived: "В архиве",
};

const STATUS_COLORS: Record<string, string> = {
  available: "#BFFF00",
  reserved: "#FFE600",
  sold: "#888",
  archived: "#A855F7",
};

export function AdminProducts({
  products,
  categories,
  onChange,
}: {
  products: Product[];
  categories: Category[];
  onChange: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPriceMode, setBulkPriceMode] = useState<"percent" | "fixed" | "add">("percent");
  const [bulkPriceValue, setBulkPriceValue] = useState("");
  const [bulkPriceLoading, setBulkPriceLoading] = useState(false);
  const { toast } = useToast();

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const applyBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    const ids = Array.from(selected);
    let successCount = 0;

    for (const id of ids) {
      try {
        let body: Record<string, unknown> = {};
        if (bulkAction === "archive") body.status = "archived";
        else if (bulkAction === "restore") body.status = "available";
        else if (bulkAction === "delete") {
          await fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { "x-admin-token": TOKEN },
          });
          successCount++;
          continue;
        }

        const res = await fetch(`/api/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
          body: JSON.stringify(body),
        });
        if (res.ok) successCount++;
      } catch {}
    }

    toast({
      title: `Действие применено к ${successCount} товарам`,
      description: bulkAction === "delete" ? "Удалено" : bulkAction === "archive" ? "В архиве" : "Восстановлено",
    });
    setSelected(new Set());
    setBulkAction("");
    onChange();
  };

  const quickStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Статус изменён", description: STATUS_LABELS[status] });
      onChange();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const applyBulkPrice = async () => {
    if (!bulkPriceValue || selected.size === 0) return;
    setBulkPriceLoading(true);
    try {
      const res = await fetch("/api/products/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({
          ids: Array.from(selected),
          mode: bulkPriceMode,
          value: parseFloat(bulkPriceValue),
        }),
      });
      if (!res.ok) throw new Error("Ошибка");
      const data = await res.json();
      const modeLabel = bulkPriceMode === "percent" ? `% (${parseFloat(bulkPriceValue) > 0 ? "+" : ""}${bulkPriceValue}%)` : bulkPriceMode === "fixed" ? `= ${bulkPriceValue} ₽` : `${parseFloat(bulkPriceValue) > 0 ? "+" : ""}${bulkPriceValue} ₽`;
      toast({
        title: `Цены обновлены у ${data.updated} товаров`,
        description: `Режим: ${modeLabel}`,
      });
      setBulkPriceOpen(false);
      setBulkPriceValue("");
      setSelected(new Set());
      onChange();
    } catch {
      toast({ title: "Ошибка обновления цен", variant: "destructive" });
    } finally {
      setBulkPriceLoading(false);
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: "Товар удалён" });
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
            <div className="w-1 h-8 bg-[#FF2D87]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_PRODUCTS"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Товары</h1>
          <p className="text-sm text-[#888] font-mono">
            &gt; Всего: {products.length} · В продаже: {products.filter((p) => p.status === "available").length} · Продано: {products.filter((p) => p.status === "sold").length} · В архиве: {products.filter((p) => p.status === "archived").length}
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
        >
          <Plus className="w-4 h-4 mr-1.5" strokeWidth={3} />
          Добавить товар
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="pl-10 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="available">В продаже</SelectItem>
            <SelectItem value="reserved">Забронирован</SelectItem>
            <SelectItem value="sold">Продан</SelectItem>
            <SelectItem value="archived">В архиве</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0E0E0E] border-2 border-[#BFFF00] p-3 mb-4 flex flex-wrap items-center gap-3"
          style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
        >
          <span className="text-sm font-black text-[#BFFF00] font-mono uppercase">
            {"// "}{selected.size} ВЫБРАНО
          </span>
          <div className="flex-1" />
          <Select value={bulkAction} onValueChange={(v) => {
            if (v === "price") {
              setBulkPriceOpen(true);
              setBulkAction("");
            } else {
              setBulkAction(v);
            }
          }}>
            <SelectTrigger className="w-48 bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono text-xs">
              <SelectValue placeholder="Действие..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">💰 Изменить цены</SelectItem>
              <SelectItem value="archive">📥 В архив</SelectItem>
              <SelectItem value="restore">📤 Восстановить</SelectItem>
              <SelectItem value="delete">🗑 Удалить</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={applyBulkAction}
            disabled={!bulkAction}
            size="sm"
            className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase font-mono"
          >
            Применить
          </Button>
          <Button
            onClick={() => { setSelected(new Set()); setBulkAction(""); }}
            size="sm"
            variant="ghost"
            className="text-[#888] hover:text-foreground font-mono"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Select all */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-mono uppercase text-[#888] hover:text-[#BFFF00]"
          >
            {selected.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
            ) : (
              <Square className="w-4 h-4" strokeWidth={2.5} />
            )}
            {selected.size === filtered.length && filtered.length > 0 ? "СНЯТЬ ВСЕ" : "ВЫБРАТЬ ВСЕ"}
          </button>
          <span className="text-[10px] text-[#888] font-mono">· {filtered.length} найдено</span>
        </div>
      )}

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Нет товаров</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const badges = parseBadges(p.badges);
            const statusColor = STATUS_COLORS[p.status] || "#888";
            const isSelected = selected.has(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-[#121212] border-2 p-4 transition-colors relative",
                  isSelected ? "border-[#BFFF00]" : "border-[#2A2A2A] hover:border-[#BFFF00]/60"
                )}
                style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
              >
                {/* Checkbox + status */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleSelect(p.id)}
                    className="flex items-center"
                    aria-label="Выбрать"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#BFFF00]" strokeWidth={2.5} />
                    ) : (
                      <Square className="w-5 h-5 text-[#888]" strokeWidth={2.5} />
                    )}
                  </button>
                  <span
                    className="px-2 py-0.5 text-[9px] font-black border font-mono uppercase"
                    style={{ background: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}40` }}
                  >
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-[#888]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {p.featured && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/40 font-mono uppercase flex items-center gap-0.5">
                          <Star className="w-2 h-2" fill="#FFE600" /> TOP
                        </span>
                      )}
                      {badges.slice(0, 2).map((b) => {
                        const bd = BADGE_LABELS[b];
                        return bd ? (
                          <span key={b} className="px-1.5 py-0.5 text-[9px] font-black border font-mono uppercase"
                            style={{ background: `${bd.color}15`, color: bd.color, borderColor: `${bd.color}40` }}>
                            {bd.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <h3 className="font-black text-sm leading-tight mb-1 line-clamp-2 uppercase tracking-tight">{p.title}</h3>
                    <div className="text-[10px] text-[#888] mb-1 font-mono uppercase">{p.category?.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#BFFF00] font-mono">
                        {formatPrice(p.price, p.currency)}
                      </span>
                      {p.oldPrice && (
                        <span className="text-xs text-[#888] line-through font-mono">
                          {formatPrice(p.oldPrice, p.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#1F1F1F]">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(p)}
                    className="text-xs hover:bg-[#BFFF00]/10 hover:text-[#BFFF00] font-mono uppercase px-2"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Изменить
                  </Button>
                  {p.status === "archived" || p.status === "sold" || p.status === "reserved" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => quickStatusChange(p.id, "available")}
                      className="text-xs text-[#BFFF00] hover:bg-[#BFFF00]/10 font-mono uppercase px-2"
                    >
                      <ArchiveRestore className="w-3.5 h-3.5 mr-1" />
                      Восстановить
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => quickStatusChange(p.id, "archived")}
                      className="text-xs text-[#A855F7] hover:bg-[#A855F7]/10 font-mono uppercase px-2"
                    >
                      <Archive className="w-3.5 h-3.5 mr-1" />
                      В архив
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(p.id)}
                    className="text-[#FF3333] hover:text-[#FF3333] hover:bg-[#FF3333]/10 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProductForm
        product={editing}
        open={!!editing || creating}
        categories={categories}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={() => { onChange(); setEditing(null); setCreating(false); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0E0E0E] border-2 border-[#FF3333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black font-mono">Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Товар будет удалён навсегда.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-2 border-[#2A2A2A] font-mono uppercase">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={deleting}
              className="bg-[#FF3333] hover:bg-[#FF3333]/80 text-white font-mono uppercase"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk price editing modal */}
      <Dialog open={bulkPriceOpen} onOpenChange={(o) => !o && setBulkPriceOpen(false)}>
        <DialogContent className="max-w-md glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Изменить цены — {selected.size} товаров</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase font-mono">Режим изменения</Label>
              <Select value={bulkPriceMode} onValueChange={(v) => setBulkPriceMode(v as "percent" | "fixed" | "add")}>
                <SelectTrigger className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Процент (%) — например +10 или -15</SelectItem>
                  <SelectItem value="fixed">Фиксированная цена (₽) — например 5000</SelectItem>
                  <SelectItem value="add">Прибавить (₽) — например +500 или -200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase font-mono">
                {bulkPriceMode === "percent"
                  ? "Изменение в % (можно отрицательное)"
                  : bulkPriceMode === "fixed"
                  ? "Новая цена в ₽"
                  : "Прибавка в ₽ (можно отрицательную)"}
              </Label>
              <Input
                type="number"
                value={bulkPriceValue}
                onChange={(e) => setBulkPriceValue(e.target.value)}
                placeholder={bulkPriceMode === "percent" ? "10" : bulkPriceMode === "fixed" ? "5000" : "500"}
                className="bg-[#0A0A0A] border-2 border-[#2A2A2A] font-mono mt-1"
              />
            </div>
            {/* Preview */}
            {bulkPriceValue && selected.size > 0 && (
              <div className="bg-[#121212] border border-[#2A2A2A] p-3 text-xs font-mono">
                <div className="text-[#888] uppercase mb-2">// ПРЕВЬЮ</div>
                {products
                  .filter((p) => selected.has(p.id))
                  .slice(0, 3)
                  .map((p) => {
                    let newPrice = p.price;
                    const v = parseFloat(bulkPriceValue);
                    if (bulkPriceMode === "percent") newPrice = Math.round(p.price * (1 + v / 100));
                    else if (bulkPriceMode === "fixed") newPrice = v;
                    else if (bulkPriceMode === "add") newPrice = p.price + v;
                    if (newPrice < 0) newPrice = 0;
                    return (
                      <div key={p.id} className="flex justify-between py-0.5">
                        <span className="truncate text-foreground flex-1 pr-2">{p.title}</span>
                        <span className="text-[#888] line-through">{p.price} ₽</span>
                        <span className="text-[#BFFF00] ml-2">→ {newPrice} ₽</span>
                      </div>
                    );
                  })}
                {selected.size > 3 && (
                  <div className="text-[#888] mt-1">... и ещё {selected.size - 3}</div>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={applyBulkPrice}
                disabled={!bulkPriceValue || bulkPriceLoading}
                className="flex-1 bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase font-mono"
              >
                {bulkPriceLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Применить к {selected.size}
              </Button>
              <Button onClick={() => setBulkPriceOpen(false)} variant="outline" className="font-mono uppercase">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  product,
  open,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isCreate = !product;
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const initKey = product?.id || "new";
  const [lastKey, setLastKey] = useState("");
  if (initKey !== lastKey && open) {
    setLastKey(initKey);
    if (product) {
      setForm({
        categoryId: product.categoryId,
        title: product.title,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice || "",
        image: product.image || "",
        badges: product.badges || "",
        followers: product.followers || "",
        metadata: product.metadata || "",
        login: product.login,
        password: product.password,
        deliveryNote: product.deliveryNote || "",
        status: product.status,
        featured: product.featured,
      });
    } else {
      setForm({
        categoryId: categories[0]?.id || "",
        title: "",
        description: "",
        price: "",
        oldPrice: "",
        image: "",
        badges: "",
        followers: "",
        metadata: "{}",
        login: "",
        password: "",
        deliveryNote: "",
        status: "available",
        featured: false,
      });
    }
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title || !form.price || !form.login || !form.password) {
      toast({ title: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = isCreate ? "/api/products" : `/api/products/${product!.id}`;
      const method = isCreate ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: isCreate ? "Товар добавлен" : "Товар обновлён" });
      onSave();
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0E0E0E] border-2 border-[#BFFF00]">
        <DialogHeader>
          <DialogTitle className="uppercase font-black tracking-tight font-mono">
            {isCreate ? "// НОВЫЙ_ТОВАР" : "// РЕДАКТИРОВАНИЕ"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// НАЗВАНИЕ *"}</Label>
            <Input
              value={String(form.title || "")}
              onChange={(e) => set("title", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
              placeholder="TikTok аккаунт 10K подписчиков"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// КАТЕГОРИЯ *"}</Label>
            <Select
              value={String(form.categoryId || "")}
              onValueChange={(v) => set("categoryId", v)}
            >
              <SelectTrigger className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono">
                <SelectValue placeholder="Выберите..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// СТАТУС"}</Label>
            <Select
              value={String(form.status || "available")}
              onValueChange={(v) => set("status", v)}
            >
              <SelectTrigger className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">В продаже</SelectItem>
                <SelectItem value="reserved">Забронирован</SelectItem>
                <SelectItem value="sold">Продан</SelectItem>
                <SelectItem value="archived">В архиве</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// ОПИСАНИЕ"}</Label>
            <Textarea
              value={String(form.description || "")}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono text-sm"
              placeholder="Подробное описание..."
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// ЦЕНА (₽) *"}</Label>
            <Input
              type="number"
              value={String(form.price || "")}
              onChange={(e) => set("price", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
              placeholder="1490"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// СТАРАЯ ЦЕНА"}</Label>
            <Input
              type="number"
              value={String(form.oldPrice || "")}
              onChange={(e) => set("oldPrice", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
              placeholder="2490"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// ПОДПИСЧИКИ"}</Label>
            <Input
              value={String(form.followers || "")}
              onChange={(e) => set("followers", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
              placeholder="10K подписчиков"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// БЕЙДЖИ"}</Label>
            <Input
              value={String(form.badges || "")}
              onChange={(e) => set("badges", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono"
              placeholder="hot,verified,premium,top"
            />
            <div className="text-[10px] text-[#888] mt-1 font-mono uppercase">Доступно: hot, verified, top, premium</div>
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#BFFF00]">{"// JSON МЕТА"}</Label>
            <Input
              value={String(form.metadata || "")}
              onChange={(e) => set("metadata", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] font-mono text-xs"
              placeholder='{"country":"RU","age":"6 мес"}'
            />
          </div>

          <div className="md:col-span-2 pt-3 border-t border-[#1F1F1F]">
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ДАННЫЕ ДЛЯ ВЫДАЧИ ПОКУПАТЕЛЮ"}</Label>
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ЛОГИН *"}</Label>
            <Input
              value={String(form.login || "")}
              onChange={(e) => set("login", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono"
              placeholder="user@mail.com"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ПАРОЛЬ *"}</Label>
            <Input
              value={String(form.password || "")}
              onChange={(e) => set("password", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono"
              placeholder="Password123!"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#FF2D87]">{"// ИНСТРУКЦИЯ ПО ДОСТАВКЕ"}</Label>
            <Textarea
              value={String(form.deliveryNote || "")}
              onChange={(e) => set("deliveryNote", e.target.value)}
              rows={2}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#FF2D87] font-mono text-sm"
              placeholder="Смените пароль сразу после входа..."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <button
              onClick={() => set("featured", !form.featured)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-2 text-sm transition-all font-mono uppercase",
                form.featured
                  ? "bg-[#FFE600]/15 text-[#FFE600] border-[#FFE600]/40"
                  : "bg-transparent text-[#888] border-[#2A2A2A]"
              )}
            >
              <Star className="w-4 h-4" fill={form.featured ? "#FFE600" : "none"} />
              Рекомендуемый (показывается первым)
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent border-2 border-[#2A2A2A] font-mono uppercase">
            Отмена
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" strokeWidth={3} />}
            {isCreate ? "Создать" : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
