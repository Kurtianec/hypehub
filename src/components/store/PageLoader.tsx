"use client";

import { useState, useEffect } from "react";

export function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add pulse class to body immediately
    document.body.classList.add("site-loading");

    const timer = setTimeout(() => {
      setLoading(false);
      document.body.classList.remove("site-loading");
    }, 800);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("site-loading");
    };
  }, []);

  return null;
}
