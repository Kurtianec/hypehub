"use client";

import { PLATFORM_GRADIENTS, type Platform } from "@/lib/types";
import { PlatformLogos } from "./PlatformLogos";

interface ProductImageProps {
  platform: Platform;
  followers?: string | null;
  title?: string;
  className?: string;
  variant?: "card" | "modal";
}

export function ProductImage({
  platform,
  title,
  className = "",
  variant = "card",
}: ProductImageProps) {
  const Logo = PlatformLogos[platform];
  const isModal = variant === "modal";

  // Solid colors per platform
  const solidColors: Record<Platform, string> = {
    tiktok: "#000000",
    youtube: "#FF0000",
    vk: "#0077FF",
    instagram: "#E1306C",
    telegram: "#229ED9",
    other: "#A855F7",
  };

  const accentColors: Record<Platform, string> = {
    tiktok: "#00F2EA",
    youtube: "#FFFFFF",
    vk: "#FFFFFF",
    instagram: "#FFD700",
    telegram: "#FFFFFF",
    other: "#FFE600",
  };

  const bg = solidColors[platform];
  const accent = accentColors[platform];

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(${accent}20 1px, transparent 1px), linear-gradient(90deg, ${accent}20 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Diagonal accent stripes */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 opacity-20"
        style={{
          background: `repeating-linear-gradient(45deg, ${accent}, ${accent} 8px, transparent 8px, transparent 16px)`,
        }}
      />

      {/* Logo center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Logo ? (
          <Logo
            size={isModal ? 100 : 70}
            className="drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"
            // @ts-expect-error - style prop on svg component
            style={{ color: accent }}
          />
        ) : null}
      </div>

      {/* Corner accent */}
      <div
        className="absolute bottom-0 right-0 w-12 h-12"
        style={{
          background: accent,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Title bottom (modal only) */}
      {isModal && title && (
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-black/80 backdrop-blur-sm border-t-2" style={{ borderColor: accent }}>
          <h2 className="text-white font-black text-2xl uppercase tracking-tight">{title}</h2>
        </div>
      )}
    </div>
  );
}
