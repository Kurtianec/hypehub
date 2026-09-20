"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, MessageSquare,
  Settings as SettingsIcon, LogOut, PanelLeftOpen, X, ExternalLink, Eye, Star, FileText, ScrollText,
  Users, Ticket, ShieldBan,
  MonitorSmartphone, DatabaseBackup, ShieldCheck, HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdminLogin } from "./AdminLogin";
import { AdminProducts } from "./AdminProducts";
import { AdminCategories } from "./AdminCategories";
import { AdminOrders } from "./AdminOrders";
import { AdminSupport } from "./AdminSupport";
import { AdminSettings } from "./AdminSettings";
import { AdminDashboard } from "./AdminDashboard";
import { AdminVisitors } from "./AdminVisitors";
import { AdminReviews } from "./AdminReviews";
import { AdminBlog } from "./AdminBlog";
import { AdminLogs } from "./AdminLogs";
import { AdminNotifications } from "./AdminNotifications";
import { AdminReferral } from "./AdminReferral";
import { AdminPromo } from "./AdminPromo";
import { AdminBlacklist } from "./AdminBlacklist";
import { AdminSessions } from "./AdminSessions";
import { AdminBackups } from "./AdminBackups";
import { AdminWarranty } from "./AdminWarranty";
import { AdminHealth } from "./AdminHealth";
import { cn } from "@/lib/utils";
import type { Category, Product, FaqItem } from "@/lib/types";
import { BrandMark } from "@/components/store/BrandMark";

interface AdminData {
  categories: Category[];
  products: Product[];
  faqs: FaqItem[];
  settings: Record<string, string>;
}

type Tab = "dashboard" | "products" | "categories" | "orders" | "support" | "visitors" | "reviews" | "blog" | "logs" | "referral" | "promo" | "blacklist" | "sessions" | "backups" | "warranty" | "health" | "settings";

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  num: string;
  color: string;
  badgeKey?: "orders" | "support" | "reviews";
}

const TABS: TabDef[] = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard, num: "01", color: "#8E1537" },
  { id: "products", label: "Товары", icon: Package, num: "02", color: "#8E1537" },
  { id: "categories", label: "Категории", icon: Tags, num: "03", color: "#8E1537" },
  { id: "orders", label: "Заказы", icon: ShoppingCart, num: "04", color: "#8E1537", badgeKey: "orders" },
  { id: "support", label: "Поддержка", icon: MessageSquare, num: "05", color: "#8E1537", badgeKey: "support" },
  { id: "visitors", label: "Посетители", icon: Eye, num: "06", color: "#8E1537" },
  { id: "reviews", label: "Отзывы", icon: Star, num: "07", color: "#8E1537", badgeKey: "reviews" },
  { id: "blog", label: "Блог", icon: FileText, num: "08", color: "#8E1537" },
  { id: "logs", label: "Журнал", icon: ScrollText, num: "09", color: "#8E1537" },
  { id: "referral", label: "Рефералы", icon: Users, num: "10", color: "#8E1537" },
  { id: "promo", label: "Промокоды", icon: Ticket, num: "11", color: "#8E1537" },
  { id: "blacklist", label: "Чёрный список", icon: ShieldBan, num: "12", color: "#8E1537" },
  { id: "sessions", label: "Сессии", icon: MonitorSmartphone, num: "13", color: "#8E1537" },
  { id: "backups", label: "Резервные копии", icon: DatabaseBackup, num: "14", color: "#8E1537" },
  { id: "warranty", label: "Гарантии", icon: ShieldCheck, num: "15", color: "#8E1537" },
  { id: "health", label: "Система", icon: HeartPulse, num: "16", color: "#8E1537" },
  { id: "settings", label: "Настройки", icon: SettingsIcon, num: "17", color: "#8E1537" },
];

interface NotificationItem {
  id: string;
  type: "order" | "support" | "review";
  title: string;
  description: string;
  time: string;
}

interface AdminCounts {
  orders: number;       // pending orders count
  support: number;      // new support messages
  reviews: number;      // pending reviews
}

export function AdminPanel({ initialData }: { initialData: AdminData }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<AdminData>(initialData);
  const [counts, setCounts] = useState<AdminCounts>({ orders: 0, support: 0, reviews: 0 });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/session").then((r) => setAuthenticated(r.ok)).catch(() => setAuthenticated(false));
  }, []);

  // === Real-time via SSE (Server-Sent Events) — replaces 15s polling ===
  useEffect(() => {
    if (!authenticated) return;

    // Create audio element for notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1dJ7rKdbqSgq+Uc7+6cUFBQUM+IFCBcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCR");

    const es = new EventSource("/api/admin/events");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const now = new Date().toLocaleTimeString("ru-RU");
        const newNotifications: NotificationItem[] = [];

        if (data.type === "init") {
          // Initial baseline — just set counts
          setCounts({ orders: data.counts.orders, support: data.counts.support, reviews: data.counts.reviews });
          return;
        }

        if (data.type === "new-order") {
          newNotifications.push({
            id: `order_${Date.now()}`,
            type: "order",
            title: "Новый заказ!",
            description: data.order
              ? `Заказ на ${data.order.amount} ₽ от ${data.order.email}`
              : `Получен новый заказ`,
            time: now,
          });
        }
        if (data.type === "new-support") {
          newNotifications.push({
            id: `support_${Date.now()}`,
            type: "support",
            title: "Новое сообщение в поддержку",
            description: `Новых обращений: ${data.counts.support}`,
            time: now,
          });
        }
        if (data.type === "new-review") {
          newNotifications.push({
            id: `review_${Date.now()}`,
            type: "review",
            title: "Новый отзыв на модерацию",
            description: `Ожидают проверки: ${data.counts.reviews}`,
            time: now,
          });
        }

        // Always update counts
        if (data.counts) {
          setCounts({ orders: data.counts.orders, support: data.counts.support, reviews: data.counts.reviews });
        }

        if (newNotifications.length > 0) {
          // Play sound
          if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => {});
          }
          if ("Notification" in window && Notification.permission === "granted") {
            const first = newNotifications[0];
            new Notification(first.title, { body: first.description, icon: "/favicon.svg", tag: first.type });
          }
          setNotifications((prev) => [...newNotifications, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + newNotifications.length);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do here
    };

    return () => {
      es.close();
    };
  }, [authenticated]);

  const onLogin = () => {
    setAuthenticated(true);
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
    toast({ title: "ACCESS_GRANTED", description: "Добро пожаловать в систему" });
  };

  const onLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setAuthenticated(false);
    setTab("dashboard");
  };

  const refresh = useCallback(async () => {
    const [cats, prods] = await Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products?admin=1").then((r) => r.json()),
    ]);
    setData((d) => ({
      ...d,
      categories: cats.categories,
      products: prods.products,
    }));
  }, []);

  useEffect(() => {
    if (authenticated) void refresh();
  }, [authenticated, refresh]);

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleNotifPanel = () => {
    setShowNotifPanel((v) => !v);
    setUnreadCount(0);
  };

  if (authenticated === null) return null;
  if (!authenticated) {
    return <div className="admin-v3"><AdminLogin onLogin={onLogin} /></div>;
  }

  const renderBadge = (badgeKey?: "orders" | "support" | "reviews") => {
    if (!badgeKey) return null;
    const count = counts[badgeKey];
    if (count === 0) return null;
    return (
      <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-[#8E1537] text-white text-[10px] font-black flex items-center justify-center font-mono rounded-sm">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <div className="admin-v3 admin-prism min-h-screen flex">
      {/* Sidebar — desktop */}
      <aside className="admin-sidebar hidden lg:flex w-64 flex-shrink-0 bg-[#0E0E0E] border-r-2 border-[#8E1537]/40 flex-col">
        <div className="p-6 border-b-2 border-[#1F1F1F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#8E1537] flex items-center justify-center border-2 border-[#8E1537]">
              <BrandMark className="w-full h-full" />
            </div>
            <div>
              <div className="font-black uppercase tracking-tighter">
                <span className="text-[#8E1537]">Хайп</span>Хаб
              </div>
              <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">
                Панель управления
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "admin-nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all border-2 font-mono",
                tab === t.id
                  ? "bg-[#8E1537]/10 text-[#8E1537] border-[#8E1537]"
                  : "text-[#888] border-transparent hover:bg-white/5 hover:text-foreground"
              )}
            >
              <span className="text-[10px] font-mono opacity-60">{t.num}</span>
              <t.icon className="w-4 h-4 flex-shrink-0" style={{ color: tab === t.id ? t.color : undefined }} />
              <span className="truncate">{t.label}</span>
              {renderBadge(t.badgeKey)}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-[#1F1F1F] space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#888] hover:bg-white/5 hover:text-foreground transition-all font-mono"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть сайт
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#8E1537] hover:bg-[#8E1537]/10 transition-all font-mono"
          >
            <LogOut className="w-4 h-4" />
            Выход
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/90" onClick={() => setSidebarOpen(false)} />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="admin-sidebar absolute left-0 top-0 bottom-0 w-64 bg-[#0E0E0E] border-r-2 border-[#8E1537] flex flex-col"
          >
            <div className="p-6 border-b-2 border-[#1F1F1F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#8E1537] flex items-center justify-center border-2 border-[#8E1537]">
                  <BrandMark className="w-full h-full" />
                </div>
                <div className="font-black uppercase tracking-tighter">
                  <span className="text-[#8E1537]">Хайп</span>Хаб
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                  className={cn(
                    "admin-nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all border-2 font-mono",
                    tab === t.id
                      ? "bg-[#8E1537]/10 text-[#8E1537] border-[#8E1537]"
                      : "text-[#888] border-transparent hover:bg-white/5"
                  )}
                >
                  <span className="text-[10px] font-mono opacity-60">{t.num}</span>
                  <t.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t.label}</span>
                  {renderBadge(t.badgeKey)}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t-2 border-[#1F1F1F]">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#8E1537] hover:bg-[#8E1537]/10 font-mono"
              >
                <LogOut className="w-4 h-4" />
                Выход
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main */}
      <main className="admin-main flex-1 overflow-x-hidden flex flex-col">
        {/* Desktop top bar with notification bell — fixed positioning context */}
        <header className="admin-topbar hidden lg:flex sticky top-0 z-30 bg-[#0E0E0E]/95 backdrop-blur border-b-2 border-[#1F1F1F] px-6 py-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest">
              Раздел · {TABS.find((item) => item.id === tab)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AdminNotifications
              notifications={notifications}
              unreadCount={unreadCount}
              showPanel={showNotifPanel}
              onTogglePanel={toggleNotifPanel}
              onClosePanel={() => setShowNotifPanel(false)}
              onClear={clearNotifications}
              onRemove={removeNotification}
              counts={counts}
            />
          </div>
        </header>

        {/* Mobile header */}
        <header className="admin-topbar lg:hidden sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#8E1537]/40 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 border-2 border-[#8E1537] bg-[#8E1537] text-black flex items-center justify-center">
            <PanelLeftOpen className="w-5 h-5" strokeWidth={2.2} />
          </button>
          <div className="font-black uppercase tracking-tighter font-mono">
            <span className="text-[#8E1537]">Хайп</span>Хаб <span className="text-[#888] text-xs">· ADMIN</span>
          </div>
          <AdminNotifications
            notifications={notifications}
            unreadCount={unreadCount}
            showPanel={showNotifPanel}
            onTogglePanel={toggleNotifPanel}
            onClosePanel={() => setShowNotifPanel(false)}
            onClear={clearNotifications}
            onRemove={removeNotification}
            counts={counts}
          />
        </header>

        <div className="admin-content p-4 md:p-7 flex-1">
          {tab === "dashboard" && <AdminDashboard data={data} />}
          {tab === "products" && (
            <AdminProducts
              products={data.products}
              categories={data.categories}
              onChange={refresh}
            />
          )}
          {tab === "categories" && (
            <AdminCategories
              categories={data.categories}
              onChange={refresh}
            />
          )}
          {tab === "orders" && <AdminOrders />}
          {tab === "support" && <AdminSupport />}
          {tab === "visitors" && <AdminVisitors />}
          {tab === "reviews" && <AdminReviews />}
          {tab === "blog" && <AdminBlog />}
          {tab === "logs" && <AdminLogs />}
          {tab === "referral" && <AdminReferral />}
          {tab === "promo" && <AdminPromo />}
          {tab === "blacklist" && <AdminBlacklist />}
          {tab === "sessions" && <AdminSessions />}
          {tab === "backups" && <AdminBackups />}
          {tab === "warranty" && <AdminWarranty />}
          {tab === "health" && <AdminHealth />}
          {tab === "settings" && <AdminSettings settings={data.settings} />}
        </div>
      </main>
    </div>
  );
}
