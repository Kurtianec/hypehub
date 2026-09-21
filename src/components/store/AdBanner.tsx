"use client";

import Image from "next/image";
import type { Settings } from "@/lib/types";

export function AdBanner({ variant, settings }: { variant: "wide" | "portrait"; settings: Settings }) {
  const prefix = variant === "wide" ? "ad_wide" : "ad_portrait";
  const enabled = settings[`${prefix}_enabled` as keyof Settings] === "true";
  const image = String(settings[`${prefix}_image` as keyof Settings] || "").trim();
  const href = String(settings[`${prefix}_url` as keyof Settings] || "").trim();
  const title = String(settings[`${prefix}_title` as keyof Settings] || "Рекламное место").trim();
  const validImage = enabled && /^(https?:\/\/|\/|data:image\/(jpeg|png|webp|gif);base64,)/i.test(image);
  const validHref = /^https?:\/\//i.test(href);

  const content = (
    <div className={`ad-banner ad-banner-${variant}${validImage ? "" : " ad-banner-empty"}`}>
      <span className="ad-banner-label">Реклама</span>
      {validImage ? (
        <Image src={image} alt={title} fill unoptimized sizes={variant === "wide" ? "(max-width: 1024px) 100vw, 970px" : "300px"} />
      ) : (
        <div className="ad-banner-placeholder">
          <strong>Реклама</strong>
          <span>{variant === "wide" ? "Размер баннера 970 × 250" : "Размер баннера 300 × 600"}</span>
        </div>
      )}
    </div>
  );

  return validImage && validHref ? <a className="ad-banner-link" href={href} target="_blank" rel="sponsored noopener noreferrer" aria-label={title}>{content}</a> : content;
}
