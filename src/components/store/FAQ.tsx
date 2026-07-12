"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Plus } from "lucide-react";
import type { FaqItem } from "@/lib/types";

export function FAQ({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section
      id="faq"
      className="relative py-12 md:py-20 scroll-mt-20"
      aria-label="Часто задаваемые вопросы"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#00F0FF]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_04"}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            <span className="text-foreground">Частые </span>
            <span className="text-gradient-neon">вопросы</span>
          </h2>
          <p className="text-[#888] text-sm md:text-base mt-2 font-mono">
            &gt; Не нашли ответ? Напишите в чат поддержки.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.id}
                value={`item-${i}`}
                className="bg-[#121212] border-2 border-[#2A2A2A] data-[state=open]:border-[#BFFF00] transition-colors"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                <AccordionTrigger className="text-left font-black text-base md:text-lg uppercase tracking-tight hover:no-underline py-5 px-5 flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[#BFFF00] flex-shrink-0">
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-[#888] leading-relaxed pb-5 px-5 font-mono">
                  <div className="pl-8 border-l-2 border-[#BFFF00]/30">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center bg-[#0E0E0E] border-2 border-[#FF2D87] p-6 md:p-8"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
        >
          <MessageCircle className="w-10 h-10 mx-auto mb-3 text-[#FF2D87]" strokeWidth={2.5} />
          <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Остались вопросы?</h3>
          <p className="text-sm text-[#888] mb-4 font-mono">
            &gt; AI-ассистент ответит мгновенно. Для сложных — живой чат 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-assistant"))}
              className="px-6 py-3 bg-[#BFFF00] text-black font-black uppercase border-2 border-[#BFFF00] hover:bg-[#FF2D87] hover:border-[#FF2D87] hover:text-white transition-colors hover-press font-mono tracking-wide"
            >
              AI-ассистент
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-support"))}
              className="px-6 py-3 bg-transparent text-foreground font-black uppercase border-2 border-[#2A2A2A] hover:border-[#BFFF00] hover:text-[#BFFF00] transition-colors hover-press font-mono tracking-wide"
            >
              Чат поддержки
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
