"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Zap, Heart, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/lib/types";
import { SearchBar } from "./SearchBar";
import type { Theme } from "@/hooks/use-theme";
import type { Locale } from "@/hooks/use-locale";

const NAV_ITEMS_RU = [
  { label: "Каталог", href: "#catalog", num: "01" },
  { label: "Как купить", href: "#how-to-buy", num: "02" },
  { label: "Преимущества", href: "#advantages", num: "03" },
  { label: "FAQ", href: "#faq", num: "04" },
  { label: "Контакты", href: "#footer", num: "05" },
];

const NAV_ITEMS_EN = [
  { label: "Catalog", href: "#catalog", num: "01" },
  { label: "How to Buy", href: "#how-to-buy", num: "02" },
  { label: "Advantages", href: "#advantages", num: "03" },
  { label: "FAQ", href: "#faq", num: "04" },
  { label: "Contacts", href: "#footer", num: "05" },
];

export function Header({
  siteName = "ХайпХаб",
  products = [],
  categories = [],
  favoritesCount = 0,
  onOpenFavorites,
  onProductClick,
  theme,
  onToggleTheme,
  locale,
  onToggleLocale,
}: {
  siteName?: string;
  products?: Product[];
  categories?: Category[];
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onProductClick?: (p: Product) => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  locale?: Locale;
  onToggleLocale?: () => void;
}) {
  const NAV_ITEMS = locale === "en" ? NAV_ITEMS_EN : NAV_ITEMS_RU;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(`#${e.target.id}`);
        }
      },
      { rootMargin: "-30% 0px -50% 0px" }
    );
    ["catalog", "how-to-buy", "advantages", "faq", "footer"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    if (!isHome) {
      window.location.assign("/" + href);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-2 md:py-3">
        <div className="container mx-auto px-3 md:px-4">
          {/* NO clip-path on this container — so search dropdown isn't clipped */}
          <div
            className={cn(
              "flex items-center justify-between px-3 md:px-5 py-2.5 border-2 transition-all rounded-lg",
              scrolled
                ? "bg-[#0A0A0A] border-[#BFFF00]/40 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]"
                : "bg-[#0E0E0E] border-[#2A2A2A]"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label={`${siteName} — на главную`}>
              <div className="relative w-9 h-9 bg-[#BFFF00] flex items-center justify-center border-2 border-[#BFFF00] group-hover:bg-[#FF2D87] group-hover:border-[#FF2D87] transition-colors">
                <Zap className="w-5 h-5 text-black" strokeWidth={3} fill="black" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg md:text-xl font-black tracking-tighter uppercase">
                  <span className="text-[#BFFF00]">Хайп</span>
                  <span className="text-foreground">Хаб</span>
                </span>
                <span className="text-[9px] md:text-[10px] text-[#888] font-mono uppercase tracking-widest">
                  {"// v.2026"}
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0" aria-label="Главная навигация">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all border-r border-[#2A2A2A] last:border-r-0",
                    activeSection === item.href
                      ? "text-[#BFFF00] bg-[#BFFF00]/10"
                      : "text-[#888] hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <span className="text-[10px] mr-1.5 font-mono opacity-60">{item.num}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right side: small toggles (left) + account/search (far right) */}
            <div className="flex items-center gap-2">
              {/* Small toggles — theme + language */}
              <div className="flex items-center gap-1">
                {theme && onToggleTheme && (
                  <button
                    onClick={onToggleTheme}
                    className="w-8 h-8 border border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] flex items-center justify-center transition-colors"
                    aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
                  >
                    {theme === "dark" ? (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFE600" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0EA5E9" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    )}
                  </button>
                )}
                {locale && onToggleLocale && (
                  <button
                    onClick={onToggleLocale}
                    className="w-8 h-8 border border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] flex items-center justify-center transition-colors font-mono text-[10px] font-black"
                    aria-label="Switch language"
                  >
                    <span className={locale === "ru" ? "text-[#BFFF00]" : "text-[#00F0FF]"}>{locale.toUpperCase()}</span>
                  </button>
                )}
              </div>

              {/* Favorites */}
              {onOpenFavorites !== undefined && (
                <button
                  onClick={onOpenFavorites}
                  className="relative w-10 h-10 border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#FF2D87] flex items-center justify-center transition-colors group"
                  aria-label="Избранное"
                >
                  <Heart
                    className="w-4 h-4 text-[#888] group-hover:text-[#FF2D87]"
                    fill={favoritesCount > 0 ? "#FF2D87" : "none"}
                    stroke={favoritesCount > 0 ? "#FF2D87" : "currentColor"}
                    strokeWidth={2.5}
                  />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF2D87] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center font-mono">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              )}

              {/* Account */}
              <a
                href="/account"
                className="w-10 h-10 border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#BFFF00] flex items-center justify-center transition-colors group"
                aria-label="Личный кабинет"
                title="Личный кабинет"
              >
                <User className="w-4 h-4 text-[#888] group-hover:text-[#BFFF00]" strokeWidth={2.5} />
              </a>

              {/* Search */}
              {onProductClick && products.length > 0 && (
                <SearchBar products={products} categories={categories} onProductClick={onProductClick} />
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden w-10 h-10 border-2 border-[#BFFF00] bg-[#BFFF00] text-black flex items-center justify-center touch-manipulation hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors"
                aria-label="Открыть меню"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" strokeWidth={3} /> : <Menu className="w-5 h-5" strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/90"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0A0A0A] border-l-2 border-[#BFFF00] p-6 pt-24 flex flex-col gap-0 overflow-y-auto"
              aria-label="Мобильная навигация"
            >
              {NAV_ITEMS.map((item, idx) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleNav(item.href)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 text-left text-base font-black uppercase tracking-wide transition-colors border-b border-[#1F1F1F]",
                    activeSection === item.href
                      ? "text-[#BFFF00] bg-[#BFFF00]/5"
                      : "text-[#888] hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <span className="text-[10px] font-mono text-[#BFFF00]">{item.num}</span>
                  {item.label}
                </motion.button>
              ))}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_ITEMS.length * 0.05 }}
                className="flex gap-2 px-4 py-4 border-b border-[#1F1F1F]"
              >
                <Link href="/otzyvy" onClick={() => setMobileOpen(false)} className="flex-1 px-3 py-2 text-xs font-black uppercase tracking-wide border-2 border-[#2A2A2A] text-[#888] hover:text-foreground hover:border-[#BFFF00] text-center font-mono">{locale === "en" ? "Reviews" : "Отзывы"}</Link>
                <Link href="/blog" onClick={() => setMobileOpen(false)} className="flex-1 px-3 py-2 text-xs font-black uppercase tracking-wide border-2 border-[#2A2A2A] text-[#888] hover:text-foreground hover:border-[#BFFF00] text-center font-mono">{locale === "en" ? "Blog" : "Блог"}</Link>
              </motion.div>

              <div className="mt-6 pt-6 border-t-2 border-[#BFFF00]/30 space-y-3">
                <button
                  onClick={() => handleNav("#catalog")}
                  className="w-full bg-[#BFFF00] text-black font-black uppercase py-4 text-base border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors hover-press"
                >
                  {locale === "en" ? "View Catalog →" : "Смотреть каталог →"}
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
