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
  product?: { title: string };
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
  tiktok: "#FF0050",
  youtube: "#FF0000",
  vk: "#0077FF",
  instagram: "#E1306C",
  telegram: "#229ED9",
  other: "#A855F7",
};

export const PLATFORM_GRADIENTS: Record<Platform, string> = {
  tiktok: "linear-gradient(135deg, #00F2EA 0%, #FF0050 100%)",
  youtube: "linear-gradient(135deg, #FF0000 0%, #CC0066 100%)",
  vk: "linear-gradient(135deg, #0077FF 0%, #4194E8 100%)",
  instagram: "linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)",
  telegram: "linear-gradient(135deg, #229ED9 0%, #0088CC 100%)",
  other: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
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
  hot: { label: "Хит", color: "#FF0050", icon: "Flame" },
  verified: { label: "Проверен", color: "#00F2EA", icon: "BadgeCheck" },
  top: { label: "Топ", color: "#FFD700", icon: "Trophy" },
  premium: { label: "Премиум", color: "#A855F7", icon: "Crown" },
};
