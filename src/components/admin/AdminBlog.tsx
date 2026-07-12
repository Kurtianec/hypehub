"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Pencil, Trash2, Save, Loader2, X, FileText, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const TOKEN = "hypehub-admin-2024";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog?all=1", { headers: { "x-admin-token": TOKEN } });
      const data = await res.json();
      setPosts(data.posts);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/blog/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: post.published ? "Снято с публикации" : "Опубликовано" });
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const post = posts.find((p) => p.id === deleteId);
    if (!post) return;
    try {
      await fetch(`/api/blog/${post.slug}`, {
        method: "DELETE",
        headers: { "x-admin-token": TOKEN },
      });
      toast({ title: "Статья удалена" });
      setDeleteId(null);
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#A855F7]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#A855F7]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_BLOG"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Блог</h1>
          <p className="text-sm text-[#888] font-mono">&gt; Всего: {posts.length} · Опубликовано: {posts.filter((p) => p.published).length}</p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
        >
          <Plus className="w-4 h-4 mr-1.5" strokeWidth={3} />
          Новая статья
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-[#888] font-mono">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="uppercase">&gt; Нет статей</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border-2 border-[#2A2A2A] hover:border-[#A855F7] p-4 transition-colors"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1A1A1A] border-2 border-[#A855F7]/40 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-[9px] font-black border font-mono uppercase ${p.published ? "bg-[#BFFF00]/15 text-[#BFFF00] border-[#BFFF00]/40" : "bg-[#888]/15 text-[#888] border-[#888]/40"}`}>
                      {p.published ? "ОПУБЛИКОВАН" : "ЧЕРНОВИК"}
                    </span>
                    <span className="text-[10px] text-[#888] font-mono uppercase">
                      {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <h3 className="font-black text-sm leading-tight mb-1 uppercase tracking-tight">{p.title}</h3>
                  <div className="text-[10px] text-[#888] font-mono mb-1">/{p.slug}</div>
                  <p className="text-xs text-[#888] line-clamp-2 font-mono">{p.excerpt}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-[#1F1F1F]">
                <Button size="sm" variant="ghost" onClick={() => setEditing(p)}
                  className="flex-1 text-xs hover:bg-[#A855F7]/10 hover:text-[#A855F7] font-mono uppercase">
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Редактировать
                </Button>
                <Button size="sm" variant="ghost" onClick={() => togglePublish(p)}
                  className="text-xs hover:bg-[#BFFF00]/10 hover:text-[#BFFF00] font-mono uppercase">
                  {p.published ? <><EyeOff className="w-3.5 h-3.5 mr-1" /> Скрыть</> : <><Eye className="w-3.5 h-3.5 mr-1" /> Опубл.</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.id)}
                  className="text-[#FF3333] hover:bg-[#FF3333]/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BlogForm
        post={editing}
        open={!!editing || creating}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={() => { load(); setEditing(null); setCreating(false); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0E0E0E] border-2 border-[#FF3333]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить статью?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-2 border-[#2A2A2A]">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-[#FF3333] hover:bg-[#FF3333]/80 text-white">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BlogForm({
  post,
  open,
  onClose,
  onSave,
}: {
  post: BlogPost | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const isCreate = !post;
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const initKey = post?.id || "new";
  const [lastKey, setLastKey] = useState("");
  if (initKey !== lastKey && open) {
    setLastKey(initKey);
    setForm({
      slug: post?.slug || "",
      title: post?.title || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      tags: post?.tags || "",
      published: post?.published ?? false,
    });
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Заполните заголовок и slug", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = isCreate ? "/api/blog" : `/api/blog/${post!.slug}`;
      const method = isCreate ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({ title: isCreate ? "Статья создана" : "Статья обновлена" });
      onSave();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0E0E0E] border-2 border-[#A855F7]">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-tight font-black">
            {isCreate ? "Новая статья" : "Редактирование"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">{"// ЗАГОЛОВОК *"}</Label>
            <Input value={String(form.title || "")} onChange={(e) => set("title", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#A855F7] font-mono" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">{"// SLUG (URL) *"}</Label>
            <Input value={String(form.slug || "")} onChange={(e) => set("slug", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#A855F7] font-mono" placeholder="kak-kupit-akkaunt-tiktok" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">{"// КРАТКОЕ ОПИСАНИЕ"}</Label>
            <Textarea value={String(form.excerpt || "")} onChange={(e) => set("excerpt", e.target.value)}
              rows={2} className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#A855F7] font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">{"// СОДЕРЖАНИЕ (MARKDOWN)"}</Label>
            <Textarea value={String(form.content || "")} onChange={(e) => set("content", e.target.value)}
              rows={12} className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#A855F7] font-mono text-sm" />
            <div className="text-[10px] text-[#888] font-mono mt-1 uppercase">
              Поддержка: # H2, ## H3, ### H4, - списки, **жирный**, | таблицы
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-mono text-[#A855F7]">{"// ТЕГИ (через запятую)"}</Label>
            <Input value={String(form.tags || "")} onChange={(e) => set("tags", e.target.value)}
              className="mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#A855F7] font-mono" placeholder="tiktok, покупка, безопасность" />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-[#1F1F1F]">
            <button
              onClick={() => set("published", !form.published)}
              className={`flex items-center gap-2 px-3 py-2 border-2 text-sm transition-all font-mono uppercase ${
                form.published
                  ? "bg-[#BFFF00]/15 text-[#BFFF00] border-[#BFFF00]/40"
                  : "bg-transparent text-[#888] border-[#2A2A2A]"
              }`}
            >
              {form.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {form.published ? "Опубликовано" : "Черновик"}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent border-2 border-[#2A2A2A] font-mono uppercase">
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}
            className="flex-1 bg-[#A855F7] text-white hover:bg-[#A855F7]/80 font-black uppercase border-2 border-[#A855F7] font-mono tracking-wide">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" strokeWidth={3} />}
            {isCreate ? "Создать" : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
