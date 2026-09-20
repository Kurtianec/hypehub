"use client";
import { useEffect, useState } from "react";
import { MonitorSmartphone, RefreshCw, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Session { id: string; ip?: string | null; userAgent?: string | null; createdAt: string; lastSeenAt: string; expiresAt: string }

export function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]); const [current, setCurrent] = useState(""); const { toast } = useToast();
  const load = async () => { const r = await fetch("/api/admin/session"); const d = await r.json(); setSessions(d.sessions || []); setCurrent(d.currentSessionId || ""); };
  useEffect(() => { load(); }, []);
  const revoke = async (id?: string, others = false) => { if (!window.confirm(others ? "Завершить все остальные активные сессии?" : "Завершить выбранную сессию?")) return; await fetch(`/api/admin/session?${others ? "others=1" : `id=${id}`}`, { method: "DELETE" }); toast({ title: "Сессия завершена" }); load(); };
  const browser = (ua?: string | null) => !ua ? "Неизвестное устройство" : /Edg/.test(ua) ? "Microsoft Edge" : /Chrome/.test(ua) ? "Google Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Браузер";
  return <div><div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-black uppercase">Активные сессии</h1><p className="text-sm text-[#888] font-mono">Устройства с доступом к админке</p></div><Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Обновить</Button></div>
    <Button onClick={() => revoke(undefined, true)} className="mb-4 bg-[#F7A600] text-white"><ShieldX className="w-4 h-4 mr-2" />Завершить все, кроме текущей</Button>
    <div className="space-y-2">{sessions.map((s) => <div key={s.id} className="bg-[#121212] border border-[#2A2A2A] p-4 flex flex-col md:flex-row md:items-center gap-3"><MonitorSmartphone className="w-6 h-6 text-[#F7A600]" /><div className="flex-1"><div className="font-bold">{browser(s.userAgent)} {s.id === current && <span className="text-[#F7A600] text-xs">· текущая</span>}</div><div className="text-xs text-[#888] font-mono">IP: {s.ip || "—"} · Вход: {new Date(s.createdAt).toLocaleString("ru-RU")} · Активность: {new Date(s.lastSeenAt).toLocaleString("ru-RU")}</div></div>{s.id !== current && <Button variant="destructive" size="sm" onClick={() => revoke(s.id)}>Завершить</Button>}</div>)}</div>
  </div>;
}
