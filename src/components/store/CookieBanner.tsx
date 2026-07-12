"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import Link from "next/link";

const COOKIE_KEY = "hypehub_cookie_accepted";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "1");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "0");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-4 md:right-4 md:w-auto md:max-w-2xl z-40"
        >
          <div
            className="bg-[#0E0E0E] border-2 border-[#BFFF00] p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4"
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
          >
            <div className="w-10 h-10 bg-[#BFFF00]/15 border-2 border-[#BFFF00]/40 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-[#BFFF00]" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#BFFF00] mb-1">{"// COOKIE_POLICY"}</div>
              <p className="text-xs text-[#888] font-mono leading-relaxed">
                &gt; Мы используем cookies для аналитики, сохранения избранного и улучшения работы сайта.
                Продолжая, вы соглашаетесь с{" "}
                <Link href="/privacy" className="text-[#BFFF00] hover:underline">политикой конфиденциальности</Link>.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={accept}
                className="flex-1 md:flex-none px-4 py-2 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors font-mono text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                Принять
              </button>
              <button
                onClick={decline}
                className="px-3 py-2 bg-transparent text-[#888] border-2 border-[#2A2A2A] hover:border-[#888] hover:text-foreground transition-colors font-mono text-xs"
                aria-label="Отклонить"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
