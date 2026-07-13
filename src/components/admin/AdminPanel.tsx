"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, MessageSquare,
  Settings as SettingsIcon, LogOut, Sparkles, Menu, X, ExternalLink, Eye, Star, FileText, ScrollText,
  Users, Ticket, ShieldBan,
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
import { cn } from "@/lib/utils";
import type { Category, Product, FaqItem } from "@/lib/types";

interface AdminData {
  categories: Category[];
  products: Product[];
  faqs: FaqItem[];
  settings: Record<string, string>;
}

type Tab = "dashboard" | "products" | "categories" | "orders" | "support" | "visitors" | "reviews" | "blog" | "logs" | "referral" | "promo" | "blacklist" | "settings";

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  num: string;
  color: string;
  badgeKey?: "orders" | "support" | "reviews";
}

const TABS: TabDef[] = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard, num: "01", color: "#BFFF00" },
  { id: "products", label: "Товары", icon: Package, num: "02", color: "#FF2D87" },
  { id: "categories", label: "Категории", icon: Tags, num: "03", color: "#FFE600" },
  { id: "orders", label: "Заказы", icon: ShoppingCart, num: "04", color: "#00F0FF", badgeKey: "orders" },
  { id: "support", label: "Поддержка", icon: MessageSquare, num: "05", color: "#A855F7", badgeKey: "support" },
  { id: "visitors", label: "Посетители", icon: Eye, num: "06", color: "#10B981" },
  { id: "reviews", label: "Отзывы", icon: Star, num: "07", color: "#FFD700", badgeKey: "reviews" },
  { id: "blog", label: "Блог", icon: FileText, num: "08", color: "#EC4899" },
  { id: "logs", label: "Журнал", icon: ScrollText, num: "09", color: "#FF7A00" },
  { id: "referral", label: "Рефералы", icon: Users, num: "10", color: "#22D3EE" },
  { id: "promo", label: "Промокоды", icon: Ticket, num: "11", color: "#10B981" },
  { id: "blacklist", label: "Чёрный список", icon: ShieldBan, num: "12", color: "#FF3333" },
  { id: "settings", label: "Настройки", icon: SettingsIcon, num: "13", color: "#22D3EE" },
];

const ADMIN_TOKEN_KEY = "hypehub_admin_token";
const ADMIN_TOKEN_VALUE = "hypehub-admin-2024";

const TOKEN = "hypehub-admin-2024";

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
  const [token, setToken] = useState<string | null>(null);
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
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (saved === ADMIN_TOKEN_VALUE) {
      queueMicrotask(() => setToken(saved));
    }
  }, []);

  // === Real-time via SSE (Server-Sent Events) — replaces 15s polling ===
  useEffect(() => {
    if (!token) return;

    // Create audio element for notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1dJ7rKdbqSgq+Uc7+6cUFBQUM+IFCBcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCRcUFBQUCR");

    // EventSource can't set custom headers, so pass token via query param
    const es = new EventSource(`/api/admin/events?token=${TOKEN}`);

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
  }, [token]);

  const onLogin = () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_TOKEN_VALUE);
    setToken(ADMIN_TOKEN_VALUE);
    toast({ title: "ACCESS_GRANTED", description: "Добро пожаловать в систему" });
  };

  const onLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setTab("dashboard");
  };

  const refresh = useCallback(async () => {
    const [cats, prods] = await Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]);
    setData((d) => ({
      ...d,
      categories: cats.categories,
      products: prods.products,
    }));
  }, []);

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

  if (!token) {
    return <AdminLogin onLogin={onLogin} />;
  }

  const renderBadge = (badgeKey?: "orders" | "support" | "reviews") => {
    if (!badgeKey) return null;
    const count = counts[badgeKey];
    if (count === 0) return null;
    return (
      <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-[#FF2D87] text-white text-[10px] font-black flex items-center justify-center font-mono animate-pulse rounded-sm">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#0E0E0E] border-r-2 border-[#BFFF00]/40 flex-col">
        <div className="p-6 border-b-2 border-[#1F1F1F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#BFFF00] flex items-center justify-center border-2 border-[#BFFF00]">
              <Sparkles className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-black uppercase tracking-tighter">
                <span className="text-[#BFFF00]">Хайп</span>Хаб
              </div>
              <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest">
                {"// ADMIN_PANEL v.2024"}
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
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all border-2 font-mono",
                tab === t.id
                  ? "bg-[#BFFF00]/10 text-[#BFFF00] border-[#BFFF00]"
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
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#FF3333] hover:bg-[#FF3333]/10 transition-all font-mono"
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
            className="absolute left-0 top-0 bottom-0 w-64 bg-[#0E0E0E] border-r-2 border-[#BFFF00] flex flex-col"
          >
            <div className="p-6 border-b-2 border-[#1F1F1F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#BFFF00] flex items-center justify-center border-2 border-[#BFFF00]">
                  <Sparkles className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
                <div className="font-black uppercase tracking-tighter">
                  <span className="text-[#BFFF00]">Хайп</span>Хаб
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
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all border-2 font-mono",
                    tab === t.id
                      ? "bg-[#BFFF00]/10 text-[#BFFF00] border-[#BFFF00]"
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
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#FF3333] hover:bg-[#FF3333]/10 font-mono"
              >
                <LogOut className="w-4 h-4" />
                Выход
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Desktop top bar with notification bell — fixed positioning context */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#0E0E0E]/95 backdrop-blur border-b-2 border-[#1F1F1F] px-6 py-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest">
              {"// SECTION_"}{tab.toUpperCase()}
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
        <header className="lg:hidden sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#BFFF00]/40 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 border-2 border-[#BFFF00] bg-[#BFFF00] text-black flex items-center justify-center">
            <Menu className="w-5 h-5" strokeWidth={3} />
          </button>
          <div className="font-black uppercase tracking-tighter font-mono">
            <span className="text-[#BFFF00]">Хайп</span>Хаб <span className="text-[#888] text-xs">{"// ADMIN"}</span>
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

        <div className="p-4 md:p-8 flex-1">
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
          {tab === "settings" && <AdminSettings settings={data.settings} />}
        </div>
      </main>
    </div>
  );
}
