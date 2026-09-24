"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function AdminMobileBridge({ authenticated }: { authenticated: boolean }) {
  const [native, setNative] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;
      setNative(true);
      document.documentElement.classList.add("hypehub-admin-app");

      const [{ Network }, { App }, { StatusBar, Style }, { Preferences }] = await Promise.all([
        import("@capacitor/network"),
        import("@capacitor/app"),
        import("@capacitor/status-bar"),
        import("@capacitor/preferences"),
      ]);
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      await StatusBar.setBackgroundColor({ color: "#0A0A0A" }).catch(() => {});
      const status = await Network.getStatus();
      setOnline(status.connected);
      const networkHandle = await Network.addListener("networkStatusChange", (next) => setOnline(next.connected));
      const backHandle = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) history.back(); else void App.minimizeApp();
      });

      if (authenticated) {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        let permission = await PushNotifications.checkPermissions();
        if (permission.receive === "prompt") permission = await PushNotifications.requestPermissions();
        if (permission.receive === "granted") await PushNotifications.register();
        const registrationHandle = await PushNotifications.addListener("registration", async ({ value: token }) => {
          let stored = await Preferences.get({ key: "hypehub_admin_device_id" });
          if (!stored.value) {
            const generatedId = crypto.randomUUID();
            await Preferences.set({ key: "hypehub_admin_device_id", value: generatedId });
            stored = { value: generatedId };
          }
          await fetch("/api/admin/push/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, platform: "android", deviceId: stored.value }),
          }).catch(() => {});
        });
        const actionHandle = await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
          const tab = String(notification.data?.tab || "dashboard");
          window.dispatchEvent(new CustomEvent("hypehub-admin-tab", { detail: { tab } }));
        });
        cleanup = () => { void registrationHandle.remove(); void actionHandle.remove(); void networkHandle.remove(); void backHandle.remove(); };
      } else {
        cleanup = () => { void networkHandle.remove(); void backHandle.remove(); };
      }
    })();
    return () => { cleanup?.(); document.documentElement.classList.remove("hypehub-admin-app"); };
  }, [authenticated]);

  if (!native || online) return null;
  return <div className="admin-offline-banner"><WifiOff className="h-4 w-4" />Нет подключения к интернету. Изменения временно недоступны.</div>;
}
