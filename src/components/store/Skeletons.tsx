"use client";

import { motion } from "framer-motion";

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#121212] border-2 border-[#2A2A2A] overflow-hidden"
      style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
      {/* Image skeleton */}
      <div className="aspect-[16/9] bg-[#1A1A1A] relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BFFF00]/10 to-transparent"
        />
      </div>
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-[#1A1A1A] relative overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BFFF00]/10 to-transparent"
          />
        </div>
        <div className="h-4 w-full bg-[#1A1A1A] relative overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BFFF00]/10 to-transparent"
          />
        </div>
        <div className="h-4 w-2/3 bg-[#1A1A1A] relative overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BFFF00]/10 to-transparent"
          />
        </div>
        <div className="flex justify-between items-center pt-3 border-t-2 border-[#1F1F1F]">
          <div className="h-6 w-16 bg-[#1A1A1A] relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BFFF00]/10 to-transparent"
            />
          </div>
          <div className="h-8 w-20 bg-[#1A1A1A] relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BFFF00]/10 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
