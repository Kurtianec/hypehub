import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "ХайпХаб — Маркетплейс аккаунтов TikTok, YouTube, VK, Instagram, Telegram";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top — logo + tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#BFFF00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 900,
              color: "#000",
              borderRadius: "4px",
            }}
          >
            H
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "36px", fontWeight: 900, color: "#fff", letterSpacing: "-2px" }}>
              <span style={{ color: "#BFFF00" }}>Hype</span>Hub
            </div>
            <div style={{ display: "flex", fontSize: "14px", color: "#888", fontFamily: "monospace", letterSpacing: "2px" }}>
              HYPEHUB.SHOP
            </div>
          </div>
        </div>

        {/* Middle — headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "64px", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-2px" }}>
            Marketplace for
          </div>
          <div style={{ display: "flex", fontSize: "64px", fontWeight: 900, color: "#BFFF00", lineHeight: 1.05, letterSpacing: "-2px" }}>
            social accounts
          </div>
          <div style={{ display: "flex", fontSize: "24px", color: "#888", fontFamily: "monospace" }}>
            TikTok / YouTube / VK / Instagram / Telegram
          </div>
        </div>

        {/* Bottom — features */}
        <div style={{ display: "flex", gap: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "2px solid #FF7A0040", borderRadius: "8px" }}>
            <div style={{ display: "flex", width: "10px", height: "10px", background: "#FF7A00", borderRadius: "50%" }} />
            <span style={{ display: "flex", fontSize: "18px", color: "#fff", fontWeight: 700 }}>Crypto payment</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "2px solid #00F2EA40", borderRadius: "8px" }}>
            <div style={{ display: "flex", width: "10px", height: "10px", background: "#00F2EA", borderRadius: "50%" }} />
            <span style={{ display: "flex", fontSize: "18px", color: "#fff", fontWeight: 700 }}>Instant delivery</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "2px solid #BFFF0040", borderRadius: "8px" }}>
            <div style={{ display: "flex", width: "10px", height: "10px", background: "#BFFF00", borderRadius: "50%" }} />
            <span style={{ display: "flex", fontSize: "18px", color: "#fff", fontWeight: 700 }}>Warranty 24h-14d</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
