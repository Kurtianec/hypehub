"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Moon, Search as SearchIcon, Sun, User, X } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import type { Theme } from "@/hooks/use-theme";
import type { Locale } from "@/hooks/use-locale";
import { SearchBar } from "./SearchBar";
import { BrandMark } from "./BrandMark";

const navRu = [["Каталог", "#catalog"], ["Как купить", "#how-to-buy"], ["Преимущества", "#advantages"], ["FAQ", "#faq"]];
const navEn = [["Catalog", "#catalog"], ["How to buy", "#how-to-buy"], ["Benefits", "#advantages"], ["FAQ", "#faq"]];

export function Header({ siteName = "ХайпХаб", products = [], categories = [], favoritesCount = 0, onOpenFavorites, onProductClick, theme, onToggleTheme, locale, onToggleLocale }: {
  siteName?: string; products?: Product[]; categories?: Category[]; favoritesCount?: number;
  onOpenFavorites?: () => void; onProductClick?: (p: Product) => void;
  theme?: Theme; onToggleTheme?: () => void; locale?: Locale; onToggleLocale?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = locale === "en" ? navEn : navRu;

  const go = (href: string) => {
    setOpen(false);
    if (pathname !== "/") return window.location.assign("/" + href);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="prism-header">
        <div className="prism-nav-shell hype-nav-shell">
          <Link href="/" className="prism-brand" aria-label={`${siteName} — главная`}>
            <span className="prism-brand-icon"><BrandMark className="h-full w-full" /></span><span className="prism-brand-name">{siteName}</span>
          </Link>
          <nav className="prism-nav-links" aria-label="Главная навигация">
            {nav.map(([label, href], index) => <button key={href} onClick={() => go(href)}><small>0{index + 1}</small>{label}</button>)}
          </nav>
          <div className="prism-nav-actions">
            {onOpenFavorites && <button onClick={onOpenFavorites} className="prism-icon-btn" aria-label="Избранное"><Heart className="h-4 w-4" />{favoritesCount > 0 && <b>{favoritesCount}</b>}</button>}
            <Link href="/account" className="prism-icon-btn" aria-label="Личный кабинет"><User className="h-4 w-4" /></Link>
            <SearchBar products={products.length ? products : undefined} categories={categories} onProductClick={onProductClick} />
            <button onClick={() => setOpen(true)} className="prism-menu-trigger" aria-label="Открыть навигацию">
              <span className="prism-menu-symbol" aria-hidden="true"><i/><i/><i/><i/></span><span>Меню</span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="prism-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="prism-menu-panel hype-menu-panel" initial={{ opacity: 0, y: -12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .97 }} transition={{ duration: .22, ease: [0.16, 1, 0.3, 1] }}>
              <div className="prism-menu-top"><span>Меню</span><button onClick={() => setOpen(false)} aria-label="Закрыть"><X className="h-5 w-5"/></button></div>
              <div className="prism-menu-links">
                {nav.map(([label, href], index) => <button key={href} onClick={() => go(href)}><small>0{index + 1}</small><span>{label}</span></button>)}
                <Link href="/account" onClick={() => setOpen(false)}><small>05</small><span>Мои заказы</span></Link>
                <Link href="/otzyvy" onClick={() => setOpen(false)}><small>06</small><span>Отзывы</span></Link>
              </div>
              <div className="prism-menu-tools">
                {theme && onToggleTheme && <button onClick={onToggleTheme}>{theme === "dark" ? <Sun/> : <Moon/>}<span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span></button>}
                {locale && onToggleLocale && <button onClick={onToggleLocale}><SearchIcon/><span>{locale === "ru" ? "English" : "Русский"}</span></button>}
              </div>
            </motion.div>
            <button className="prism-menu-backdrop" onClick={() => setOpen(false)} aria-label="Закрыть меню" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
