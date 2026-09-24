"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function StoreMobileBridge() {
  const [native, setNative] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "1") return;
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      setNative(true);
      document.documentElement.classList.add("hypehub-store-app");
      const [{ Network }, { App }, { StatusBar, Style }] = await Promise.all([
        import("@capacitor/network"),
        import("@capacitor/app"),
        import("@capacitor/status-bar"),
      ]);
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      await StatusBar.setBackgroundColor({ color: "#0A0A0A" }).catch(() => {});
      const status = await Network.getStatus();
      setOnline(status.connected);
      const networkHandle = await Network.addListener("networkStatusChange", next => setOnline(next.connected));
      const backHandle = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) history.back();
        else void App.minimizeApp();
      });
      cleanup = () => { void networkHandle.remove(); void backHandle.remove(); };
    })();
    return () => { cleanup?.(); document.documentElement.classList.remove("hypehub-store-app"); };
  }, []);

  if (!native || online) return null;
  return <div className="store-mobile-offline-banner"><WifiOff className="h-4 w-4" />Нет подключения к интернету</div>;
}
