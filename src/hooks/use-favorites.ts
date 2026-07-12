"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/types";

const FAVORITES_KEY = "hypehub_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        queueMicrotask(() => setFavorites(JSON.parse(raw)));
      }
    } catch {}
  }, []);

  const save = (list: Product[]) => {
    setFavorites(list);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  };

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      const next = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((p) => p.id === id),
    [favorites]
  );

  const clearFavorites = () => save([]);

  return {
    favorites,
    showFavorites,
    setShowFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
