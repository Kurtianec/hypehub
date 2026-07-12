"use client";

import { useState, useEffect } from "react";

const AB_KEY = "hypehub_ab";

export function useABTest(testName: string, variants: string[]): string {
  const [variant, setVariant] = useState<string>(variants[0]);

  useEffect(() => {
    try {
      const allTests = JSON.parse(localStorage.getItem(AB_KEY) || "{}");
      if (allTests[testName]) {
        queueMicrotask(() => setVariant(allTests[testName]));
      } else {
        const random = variants[Math.floor(Math.random() * variants.length)];
        allTests[testName] = random;
        localStorage.setItem(AB_KEY, JSON.stringify(allTests));
        queueMicrotask(() => setVariant(random));
      }
    } catch {
      queueMicrotask(() => setVariant(variants[0]));
    }
  }, [testName]);

  return variant;
}

// Track conversion for a specific variant
export function trackABConversion(testName: string) {
  if (typeof window === "undefined") return;
  try {
    const allTests = JSON.parse(localStorage.getItem(AB_KEY) || "{}");
    const variant = allTests[testName];
    if (variant) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `/ab-conversion/${testName}/${variant}`,
        }),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}
