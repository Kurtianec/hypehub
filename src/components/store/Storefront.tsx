"use client";

import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Catalog } from "./Catalog";
import { HowToBuy } from "./HowToBuy";
import { Advantages } from "./Advantages";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";
import { AIAssistant } from "./AIAssistant";
import { SupportChat } from "./SupportChat";
import { VisitorTracker } from "./VisitorTracker";
import { CookieBanner } from "./CookieBanner";
import { Analytics } from "./Analytics";
import { PageLoader } from "./PageLoader";
import { FavoritesBar } from "./FavoritesBar";
import { ProductModal } from "./ProductModal";
import { useFavorites } from "@/hooks/use-favorites";
import { useCurrency } from "@/hooks/use-currency";
import { useTheme } from "@/hooks/use-theme";
import { useLocale } from "@/hooks/use-locale";
import type { Category, Product, FaqItem, Settings } from "@/lib/types";

interface StorefrontProps {
  categories: Category[];
  products: Product[];
  faqs: FaqItem[];
  settings: Record<string, string>;
}

export function Storefront({
  categories,
  products,
  faqs,
  settings,
}: StorefrontProps) {
  const [visitors, setVisitors] = useState<{ today: number; total: number }>({
    today: 0,
    total: 0,
  });
  const [searchProduct, setSearchProduct] = useState<Product | null>(null);
  const favoritesHook = useFavorites();
  const { currency, toggle: toggleCurrency, convert } = useCurrency();
  const { theme, toggle: toggleTheme } = useTheme();
  const { locale, toggle: toggleLocale, t } = useLocale();

  const settingsObj: Settings = {
    site_name: settings.site_name,
    tagline: settings.tagline,
    crypto_btc: settings.crypto_btc,
    crypto_usdt: settings.crypto_usdt,
    crypto_ton: settings.crypto_ton,
    support_email: settings.support_email,
    support_telegram: settings.support_telegram,
    stats_accounts: settings.stats_accounts,
    stats_clients: settings.stats_clients,
    stats_rating: settings.stats_rating,
    stats_support: settings.stats_support,
    yandex_metrika: settings.yandex_metrika,
    google_analytics: settings.google_analytics,
    hotjar_id: settings.hotjar_id,
  };

  useEffect(() => {
    fetch("/api/visitors?public=1")
      .then((r) => r.json())
      .then((d) => {
        if (d?.today !== undefined) {
          setVisitors({ today: d.today, total: d.total });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageLoader />
      <VisitorTracker />
      <Header
        siteName={settings.site_name}
        products={products}
        categories={categories}
        favoritesCount={favoritesHook.favorites.length}
        onOpenFavorites={() => favoritesHook.setShowFavorites(true)}
        onProductClick={(p) => setSearchProduct(p)}
        theme={theme}
        onToggleTheme={toggleTheme}
        locale={locale}
        onToggleLocale={toggleLocale}
      />
      <main className="flex-1">
        <Hero />
        <Catalog
          categories={categories}
          products={products}
          settings={settingsObj}
          favoritesHook={favoritesHook}
          convertPrice={convert}
          currency={currency}
          onToggleCurrency={toggleCurrency}
        />
        <HowToBuy />
        <Advantages settings={settingsObj} />
        <FAQ faqs={faqs} />
      </main>
      <Footer
        settings={settingsObj}
        visitorsToday={visitors.today}
        visitorsTotal={visitors.total}
      />
      <AIAssistant />
      <SupportChat />
      <CookieBanner />
      <Analytics
        yandexMetrika={settings.yandex_metrika}
        googleAnalytics={settings.google_analytics}
        hotjarId={settings.hotjar_id}
      />

      {/* Favorites panel */}
      <FavoritesBar
        favorites={favoritesHook.favorites}
        categories={categories}
        open={favoritesHook.showFavorites}
        onClose={() => favoritesHook.setShowFavorites(false)}
        onProductClick={(p) => setSearchProduct(p)}
        onRemove={(id) => favoritesHook.toggleFavorite(favoritesHook.favorites.find((f) => f.id === id)!)}
        onClear={favoritesHook.clearFavorites}
      />

      {/* Product modal from search/favorites */}
      <ProductModal
        product={searchProduct}
        onClose={() => setSearchProduct(null)}
        settings={settingsObj}
        onSwitchProduct={(p) => setSearchProduct(p)}
      />
    </>
  );
}
