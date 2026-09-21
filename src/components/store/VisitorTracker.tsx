"use client";

import { useEffect } from "react";

// Молчаливо логирует посещение при заходе на сайт
export function VisitorTracker() {
  useEffect(() => {
    let sessionId = sessionStorage.getItem("hypehub_session");
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem("hypehub_session", sessionId);
    }

    // Дебаунс — не шлём повторно для того же пути в течение 30 сек
    const lastKey = `hypehub_tracked_${window.location.pathname}`;
    const last = sessionStorage.getItem(lastKey);
    if (last && Date.now() - parseInt(last) < 30000) return;
    sessionStorage.setItem(lastKey, String(Date.now()));

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname + window.location.search,
        referrer: document.referrer || null,
        sessionId,
        client: {
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${window.screen.width}×${window.screen.height}`,
          touch: navigator.maxTouchPoints > 0,
          connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType,
        },
      }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
