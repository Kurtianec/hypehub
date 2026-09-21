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
import { FavoritesBar } from "./FavoritesBar";
import { ProductModal } from "./ProductModal";
import { AdBanner } from "./AdBanner";
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
    ad_wide_enabled: settings.ad_wide_enabled,
    ad_wide_image: settings.ad_wide_image,
    ad_wide_url: settings.ad_wide_url,
    ad_wide_title: settings.ad_wide_title,
    ad_portrait_enabled: settings.ad_portrait_enabled,
    ad_portrait_image: settings.ad_portrait_image,
    ad_portrait_url: settings.ad_portrait_url,
    ad_portrait_title: settings.ad_portrait_title,
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
    <div className="storefront-v3 min-h-screen flex flex-col">
      <div className="ambient-sparks" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
      </div>
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
        <div className="storefront-light-zone">
          <div className="subtle-background-pulses" aria-hidden="true">
            {Array.from({ length: 11 }, (_, index) => <span key={index} />)}
          </div>
          <Catalog
            categories={categories}
            products={products}
            settings={settingsObj}
            favoritesHook={favoritesHook}
            convertPrice={convert}
            currency={currency}
            onToggleCurrency={toggleCurrency}
          />
          <div className="wide-ad-slot container mx-auto px-4 md:px-6">
            <AdBanner variant="wide" settings={settingsObj} />
          </div>
          <HowToBuy />
          <Advantages settings={settingsObj} />
          <FAQ faqs={faqs} />
        </div>
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
    </div>
  );
}
