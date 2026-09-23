"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, Copy, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type TrackedOrder = {
  id: string; status: string; amount: number; currency: string; createdAt: string;
  product: { title: string; reservedUntil?: string | null };
  events: { id: string; label: string; actor: string; createdAt: string }[];
  deliveryLogin?: string | null; deliveryPass?: string | null; deliveryNote?: string | null;
};

export function OrderTracking({ id }: { id: string }) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const load = useCallback(async () => {
    const response = await fetch(`/api/orders/${id}/tracking`);
    const data = await response.json();
    if (!response.ok) setError(data.error); else { setOrder(data.order); setError(""); }
  }, [id]);

  useEffect(() => { void load(); const poll = setInterval(load, 15_000); return () => clearInterval(poll); }, [load]);
  useEffect(() => {
    if (!order?.product.reservedUntil) return;
    const tick = () => setSeconds(Math.max(0, Math.ceil((new Date(order.product.reservedUntil!).getTime() - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [order?.product.reservedUntil]);

  if (error) return <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"><p>{error}</p><Link className="mt-3 text-primary" href="/account">Войти в кабинет</Link></main>;
  if (!order) return <main className="min-h-[70vh] pt-32"><div className="skeleton-block mx-auto h-72 max-w-3xl rounded-2xl" /></main>;

  return <main className="order-tracking-page flex-1 pb-16 pt-28 md:pt-32">
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="mb-5"><div className="text-xs font-semibold text-primary">Заказ № {order.id}</div><h1 className="mt-2 break-words text-2xl font-black md:text-3xl">{order.product.title}</h1></div>
      <section className="order-panel rounded-2xl border bg-card p-4 shadow-sm md:p-6">
        {seconds > 0 && order.status === "pending" && <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><Clock className="h-4 w-4 shrink-0"/>Товар зарезервирован ещё на {String(Math.floor(seconds / 60)).padStart(2,"0")}:{String(seconds % 60).padStart(2,"0")}</div>}
        <div className="space-y-1">
          {order.events.map((event, index) => <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < order.events.length - 1 && <div className="absolute left-3 top-7 h-[calc(100%-1.4rem)] w-px bg-border" />}
            <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10"><Check className="h-3.5 w-3.5 text-primary"/></div>
            <div className="min-w-0"><div className="order-event-label break-words text-sm font-semibold">{event.label}</div><div className="order-event-meta mt-0.5 text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString("ru-RU")} · {event.actor}</div></div>
          </div>)}
        </div>
        {order.status === "delivered" && order.deliveryLogin && <div className="mt-6 border-t pt-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold"><PackageCheck className="h-4 w-4 text-primary"/>Данные аккаунта</h2>
          <div className="space-y-2">{[["Логин",order.deliveryLogin],["Пароль",order.deliveryPass || ""]].map(([label,value]) => <div key={label} className="grid grid-cols-[60px_minmax(0,1fr)_40px] items-center gap-2"><span className="text-xs text-muted-foreground">{label}</span><code className="min-w-0 break-all rounded-lg bg-muted p-2 text-xs">{value}</code><Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(value)}><Copy className="h-4 w-4"/></Button></div>)}</div>
          {order.deliveryNote && <p className="mt-3 break-words text-xs text-muted-foreground">{order.deliveryNote}</p>}
        </div>}
      </section>
      <div className="mt-4 flex flex-wrap gap-2"><Link href="/account"><Button className="order-account-button" variant="outline">Все заказы</Button></Link><Link href="/"><Button className="order-catalog-button" variant="ghost">В каталог</Button></Link></div>
    </div>
  </main>;
}
