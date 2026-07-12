// Generate OG preview image as PNG using sharp
import sharp from "sharp";
import path from "path";

const width = 1200;
const height = 630;

// Build an SVG with cyberpunk brutalist design
const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0A0A0A"/>
      <stop offset="1" stop-color="#161616"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#BFFF00" stroke-width="0.5" opacity="0.15"/>
    </pattern>
  </defs>
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  
  <!-- Glow blobs -->
  <circle cx="200" cy="150" r="180" fill="#BFFF00" opacity="0.1"/>
  <circle cx="1000" cy="450" r="200" fill="#FF2D87" opacity="0.1"/>
  
  <!-- Lightning logo -->
  <g transform="translate(80, 250)">
    <path d="M0 0 L0 130 L20 130 L0 0 Z" fill="#0A0A0A" stroke="#BFFF00" stroke-width="3"/>
    <path d="M70 10 L20 80 L50 80 L40 130 L95 60 L65 60 L75 10 Z" fill="#BFFF00" stroke="#0A0A0A" stroke-width="2"/>
  </g>
  
  <!-- Brand text -->
  <text x="240" y="280" font-family="Arial Black, sans-serif" font-size="80" font-weight="900" fill="#BFFF00" letter-spacing="-2">ХАЙП</text>
  <text x="500" y="280" font-family="Arial Black, sans-serif" font-size="80" font-weight="900" fill="#F5F5F5" letter-spacing="-2">ХАБ</text>
  
  <!-- Subtitle katakana -->
  <text x="240" y="320" font-family="monospace" font-size="22" fill="#FF2D87" letter-spacing="6">ハイプハブ // CYBER MARKET</text>
  
  <!-- Tagline -->
  <text x="240" y="380" font-family="monospace" font-size="26" fill="#888888">&gt; Маркетплейс аккаунтов TikTok, YouTube, VK</text>
  <text x="240" y="420" font-family="monospace" font-size="26" fill="#888888">&gt; Оплата криптой или QIWI · Мгновенная выдача</text>
  
  <!-- Features -->
  <g transform="translate(240, 480)">
    <rect x="0" y="0" width="180" height="60" fill="#0E0E0E" stroke="#BFFF00" stroke-width="2"/>
    <text x="90" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#BFFF00" text-anchor="middle">TIKTOK</text>
    
    <rect x="200" y="0" width="180" height="60" fill="#0E0E0E" stroke="#FF2D87" stroke-width="2"/>
    <text x="290" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#FF2D87" text-anchor="middle">YOUTUBE</text>
    
    <rect x="400" y="0" width="180" height="60" fill="#0E0E0E" stroke="#00F0FF" stroke-width="2"/>
    <text x="490" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#00F0FF" text-anchor="middle">VK</text>
    
    <rect x="600" y="0" width="180" height="60" fill="#0E0E0E" stroke="#FFE600" stroke-width="2"/>
    <text x="690" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#FFE600" text-anchor="middle">+ ЕЩЁ</text>
  </g>
  
  <!-- Bottom badges -->
  <text x="240" y="590" font-family="monospace" font-size="16" fill="#888888">SSL · ГАРАНТИЯ 14 ДНЕЙ · 24/7 ПОДДЕРЖКА · TRUSTPILOT 4.9/5</text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(process.cwd(), "public", "og.png"))
  .then(() => console.log("✅ og.png generated"))
  .catch((e) => console.error(e));
