"use client";

import type { Settings } from "@/lib/types";

export function AdBanner({ variant, settings }: { variant: "wide" | "portrait"; settings: Settings }) {
  const prefix = variant === "wide" ? "ad_wide" : "ad_portrait";
  const enabled = settings[`${prefix}_enabled` as keyof Settings] === "true";
  const image = String(settings[`${prefix}_image` as keyof Settings] || "").trim();
  const href = String(settings[`${prefix}_url` as keyof Settings] || "").trim();
  const title = String(settings[`${prefix}_title` as keyof Settings] || "Рекламное место").trim();
  const validImage = enabled && /^(https?:\/\/|\/|data:image\/(jpeg|png|webp|gif);base64,)/i.test(image);
  const normalizedHref = href && !/^https?:\/\//i.test(href) ? `https://${href}` : href;
  const validHref = /^https?:\/\//i.test(normalizedHref);

  const content = (
    <div className={`ad-banner ad-banner-${variant}${validImage ? "" : " ad-banner-empty"}`}>
      <span className="ad-banner-label">Реклама</span>
      {validImage ? (
        <div className="ad-banner-image" style={{ backgroundImage: `url(${JSON.stringify(image)})` }} role="img" aria-label={title} />
      ) : (
        <div className="ad-banner-placeholder">
          <strong>Реклама</strong>
          <span>{variant === "wide" ? "Размер баннера 970 × 250" : "Размер баннера 300 × 600"}</span>
        </div>
      )}
    </div>
  );

  return validImage && validHref ? <a className="ad-banner-link" href={normalizedHref} target="_blank" rel="sponsored noopener noreferrer" aria-label={title}>{content}</a> : content;
}
