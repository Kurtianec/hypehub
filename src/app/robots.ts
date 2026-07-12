import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/kupit-akkaunt-tiktok", "/kupit-gruppu-vk", "/kupit-kanal-youtube"],
        disallow: [
          "/api/admin/",
          "/api/orders",
          "/api/support",
          "/api/checkout",
          "/api/assistant",
          "/api/track",
          "/api/visitors",
          "/*?admin=1",
        ],
      },
    ],
    sitemap: "https://hypehub.shop/sitemap.xml",
    host: "https://hypehub.shop",
  };
}
