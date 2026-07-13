import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Buy TikTok account with followers — HypeHub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(135deg, #0A0A0A 0%, #1A0A2F 100%)", padding: "60px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "56px", height: "56px", background: "#BFFF00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#000", borderRadius: "4px", fontWeight: 900 }}>H</div>
          <div style={{ display: "flex", fontSize: "28px", fontWeight: 900, color: "#fff" }}><span style={{ color: "#BFFF00" }}>Hype</span>Hub</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: "24px", color: "#25F2EE", fontFamily: "monospace", letterSpacing: "3px" }}>// TIKTOK</div>
          <div style={{ display: "flex", fontSize: "68px", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-2px" }}>Buy TikTok Account</div>
          <div style={{ display: "flex", fontSize: "68px", fontWeight: 900, color: "#25F2EE", lineHeight: 1, letterSpacing: "-2px" }}>with Followers</div>
          <div style={{ display: "flex", fontSize: "22px", color: "#888", fontFamily: "monospace" }}>Verified / Instant delivery / Crypto payment</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", padding: "16px 32px", background: "#BFFF00", color: "#000", fontSize: "20px", fontWeight: 900, borderRadius: "4px" }}>hypehub.shop</div>
          <div style={{ display: "flex", fontSize: "18px", color: "#888", fontFamily: "monospace" }}>from 999 RUB</div>
        </div>
      </div>
    ),
    size
  );
}
