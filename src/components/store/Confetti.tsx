"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

const COLORS = ["#BFFF00", "#FF2D87", "#FFE600", "#00F0FF", "#A855F7", "#10B981"];

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 80 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 1, rotate: p.rotation }}
            animate={{
              x: `${p.x + (Math.random() - 0.5) * 30}vw`,
              y: `100vh`,
              opacity: 0,
              rotate: p.rotation + 720,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 + Math.random(), ease: "linear" }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * 0.6,
              background: p.color,
              borderRadius: 2,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
