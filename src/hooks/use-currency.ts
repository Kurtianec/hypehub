"use client";

import { useState, useEffect, useCallback } from "react";

export type Currency = "RUB" | "USDT";

const CURRENCY_KEY = "hypehub_currency";
// Approximate exchange rate (in production, fetch from API)
const USDT_TO_RUB = 95;

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("RUB");

  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null;
    if (saved === "RUB" || saved === "USDT") {
      queueMicrotask(() => setCurrency(saved));
    }
  }, []);

  const toggle = useCallback(() => {
    setCurrency((prev) => {
      const next = prev === "RUB" ? "USDT" : "RUB";
      localStorage.setItem(CURRENCY_KEY, next);
      return next;
    });
  }, []);

  const convert = useCallback(
    (rubAmount: number): { amount: number; symbol: string; formatted: string } => {
      if (currency === "USDT") {
        const usdt = rubAmount / USDT_TO_RUB;
        return {
          amount: usdt,
          symbol: "USDT",
          formatted: `${usdt.toFixed(2)} USDT`,
        };
      }
      return {
        amount: rubAmount,
        symbol: "₽",
        formatted: new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "RUB",
          maximumFractionDigits: 0,
        }).format(rubAmount),
      };
    },
    [currency]
  );

  return { currency, toggle, convert };
}
