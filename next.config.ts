import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel сам управляет output, не нужно standalone */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
