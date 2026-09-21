"use client";
import { useEffect, useState } from "react";
import { DatabaseBackup, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Backup { id: string; name: string; counts: string; createdBy: string; createdAt: string }
export function AdminBackups() {
  const [items, setItems] = useState<Backup[]>([]); const [busy, setBusy] = useState(false); const { toast } = useToast();
  const load = async () => { const r = await fetch("/api/backups"); const d = await r.json(); setItems(d.backups || []); }; useEffect(() => { load(); }, []);
  const create = async () => { setBusy(true); const response = await fetch("/api/backups", { method: "POST" }); await load(); setBusy(false); toast({ title: response.ok ? "Новая копия создана" : "Не удалось создать копию", description: response.ok ? "Предыдущая резервная копия удалена автоматически" : undefined, variant: response.ok ? "default" : "destructive" }); };
  const restore = async (id: string) => { if (!window.confirm("Восстановить товары, заказы и настройки из этой копии? Текущие записи с такими ID будут заменены.")) return; setBusy(true); const r = await fetch("/api/backups", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); setBusy(false); toast({ title: r.ok ? "Данные восстановлены" : "Ошибка восстановления", variant: r.ok ? "default" : "destructive" }); };
  return <div><div className="flex items-center justify-between mb-6 gap-4"><div><h1 className="text-2xl font-black uppercase">Резервная копия</h1><p className="text-sm text-[#888] font-mono">Хранится только последняя актуальная копия</p></div><Button onClick={create} disabled={busy} className="bg-[#8E1537] text-white"><DatabaseBackup className="w-4 h-4 mr-2" />Обновить копию</Button></div><div className="space-y-2">{items.map((b) => { const c = JSON.parse(b.counts); return <div key={b.id} className="admin-surface p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl flex items-center gap-3"><DatabaseBackup className="w-5 h-5 text-[#D05B7D]" /><div className="flex-1"><div className="font-bold">{b.name}</div><div className="text-xs text-[#888] font-mono">{new Date(b.createdAt).toLocaleString("ru-RU")} · товаров {c.products || 0} · заказов {c.orders || 0}</div></div><Button size="sm" variant="outline" onClick={() => restore(b.id)} disabled={busy}><RotateCcw className="w-3.5 h-3.5 mr-1" />Восстановить</Button></div>; })}{items.length === 0 && <div className="text-center text-[#888] py-12"><RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-40" />Копия ещё не создана</div>}</div></div>;
}
