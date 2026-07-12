"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, MessageSquare,
  Settings as SettingsIcon, LogOut, Sparkles, Menu, X, ExternalLink, Eye, Star, FileText, ScrollText,
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
import { cn } from "@/lib/utils";
import type { Category, Product, FaqItem } from "@/lib/types";

interface AdminData {
  categories: Category[];
  products: Product[];
  faqs: FaqItem[];
  settings: Record<string, string>;
}

type Tab = "dashboard" | "products" | "categories" | "orders" | "support" | "visitors" | "reviews" | "blog" | "logs" | "settings";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; num: string; color: string }[] = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard, num: "01", color: "#BFFF00" },
  { id: "products", label: "Товары", icon: Package, num: "02", color: "#FF2D87" },
  { id: "categories", label: "Категории", icon: Tags, num: "03", color: "#FFE600" },
  { id: "orders", label: "Заказы", icon: ShoppingCart, num: "04", color: "#00F0FF" },
  { id: "support", label: "Поддержка", icon: MessageSquare, num: "05", color: "#A855F7" },
  { id: "visitors", label: "Посетители", icon: Eye, num: "06", color: "#10B981" },
  { id: "reviews", label: "Отзывы", icon: Star, num: "07", color: "#FFD700" },
  { id: "blog", label: "Блог", icon: FileText, num: "08", color: "#EC4899" },
  { id: "logs", label: "Журнал", icon: ScrollText, num: "09", color: "#FF7A00" },
  { id: "settings", label: "Настройки", icon: SettingsIcon, num: "10", color: "#22D3EE" },
];

const ADMIN_TOKEN_KEY = "hypehub_admin_token";
const ADMIN_TOKEN_VALUE = "hypehub-admin-2024";

export function AdminPanel({ initialData }: { initialData: AdminData }) {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<AdminData>(initialData);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (saved === ADMIN_TOKEN_VALUE) {
      queueMicrotask(() => setToken(saved));
    }
  }, []);

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

  if (!token) {
    return <AdminLogin onLogin={onLogin} />;
  }

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

        <nav className="flex-1 p-3 space-y-1">
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
              <t.icon className="w-4 h-4" style={{ color: tab === t.id ? t.color : undefined }} />
              {t.label}
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
            <nav className="flex-1 p-3 space-y-1">
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
                  <t.icon className="w-4 h-4" />
                  {t.label}
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
      <main className="flex-1 overflow-x-hidden">
        <header className="lg:hidden sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#BFFF00]/40 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 border-2 border-[#BFFF00] bg-[#BFFF00] text-black flex items-center justify-center">
            <Menu className="w-5 h-5" strokeWidth={3} />
          </button>
          <div className="font-black uppercase tracking-tighter font-mono">
            <span className="text-[#BFFF00]">Хайп</span>Хаб <span className="text-[#888] text-xs">{"// ADMIN"}</span>
          </div>
          <div className="w-10" />
        </header>

        <div className="p-4 md:p-8">
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
          {tab === "settings" && <AdminSettings settings={data.settings} />}
        </div>
      </main>
    </div>
  );
}
