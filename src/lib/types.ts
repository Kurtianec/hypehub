// ХайпХаб — общие типы и утилиты

export type Platform = "tiktok" | "youtube" | "vk" | "instagram" | "telegram" | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  platform: Platform;
  description?: string | null;
  order: number;
  _count?: { products: number };
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  title: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  currency: string;
  image?: string | null;
  images?: string | null; // JSON array string
  badges?: string | null;
  followers?: string | null;
  metadata?: string | null;
  login: string;
  password: string;
  deliveryNote?: string | null;
  status: string;
  featured: boolean;
  views: number;
  warrantyDays?: number;
  lastCheckedAt?: string | null;
  publishedAt?: string | null;
  internalNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Parse images JSON string → string[]
export function getProductImages(product: Product): string[] {
  if (!product.images) return [];
  try {
    const arr = JSON.parse(product.images);
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
}

// Get hover image (second image, or first from images array)
export function getHoverImage(product: Product): string | null {
  const images = getProductImages(product);
  return images[0] || product.image || null;
}

export interface Order {
  id: string;
  productId: string;
  buyerEmail: string;
  buyerContact: string;
  paymentMethod: string;
  paymentAddress?: string | null;
  amount: number;
  currency: string;
  txnHash?: string | null;
  status: string;
  deliveryLogin?: string | null;
  deliveryPass?: string | null;
  deliveryNote?: string | null;
  product?: { title: string; status?: string; reservedUntil?: string | null };
  events?: { id?: string; type: string; label: string; actor: string; details?: string | null; createdAt: string }[];
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  contact: string;
  message: string;
  reply?: string | null;
  status: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface Settings {
  site_name?: string;
  tagline?: string;
  crypto_btc?: string;
  crypto_usdt?: string;
  crypto_ton?: string;
  support_email?: string;
  support_telegram?: string;
  stats_accounts?: string;
  stats_clients?: string;
  stats_rating?: string;
  stats_support?: string;
  yandex_metrika?: string;
  google_analytics?: string;
  hotjar_id?: string;
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  tiktok: "#111111",
  youtube: "#FF0033",
  vk: "#0077FF",
  instagram: "#C13584",
  telegram: "#229ED9",
  other: "#8E1537",
};

export const PLATFORM_GRADIENTS: Record<Platform, string> = {
  tiktok: "linear-gradient(135deg, #25F4EE 0%, #111111 48%, #FE2C55 100%)",
  youtube: "linear-gradient(135deg, #FF0033 0%, #B90024 100%)",
  vk: "linear-gradient(135deg, #0077FF 0%, #005FCC 100%)",
  instagram: "linear-gradient(135deg, #FEDA75 0%, #D62976 50%, #4F5BD5 100%)",
  telegram: "linear-gradient(135deg, #2AABEE 0%, #168AC0 100%)",
  other: "linear-gradient(135deg, #8E1537 0%, #8E1537 100%)",
};

export function formatPrice(price: number, currency = "RUB"): string {
  if (currency === "RUB") {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price);
  }
  return `$${price}`;
}

export function parseBadges(badges?: string | null): string[] {
  if (!badges) return [];
  return badges.split(",").map((b) => b.trim()).filter(Boolean);
}

export const BADGE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  hot: { label: "Хит", color: "#8E1537", icon: "Flame" },
  verified: { label: "Проверен", color: "#8E1537", icon: "BadgeCheck" },
  top: { label: "Топ", color: "#8E1537", icon: "Trophy" },
  premium: { label: "Премиум", color: "#8E1537", icon: "Crown" },
};
