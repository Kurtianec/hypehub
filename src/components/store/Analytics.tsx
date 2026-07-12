"use client";

import Script from "next/script";
import { useEffect } from "react";

interface AnalyticsProps {
  yandexMetrika?: string;
  googleAnalytics?: string;
  hotjarId?: string;
}

export function Analytics({ yandexMetrika, googleAnalytics, hotjarId }: AnalyticsProps) {
  // Track page views for internal analytics
  useEffect(() => {
    const path = window.location.pathname;
    // Send to our internal tracker
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: path + window.location.search }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Яндекс.Метрика */}
      {yandexMetrika && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(${yandexMetrika}, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              ecommerce:"dataLayer"
            });
          `}
        </Script>
      )}

      {/* Google Analytics */}
      {googleAnalytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalytics}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Hotjar */}
      {hotjarId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* Noscript fallback for Метрика */}
      {yandexMetrika && (
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${yandexMetrika}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      )}
    </>
  );
}

// Track custom events (purchases, clicks, etc.)
export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  // Yandex Metrika
  const ymFunc = (window as unknown as { ym?: (...args: unknown[]) => void }).ym;
  if (typeof ymFunc === "function") {
    const ymId = document.querySelector("script[id='yandex-metrika']");
    if (ymId) {
      const match = ymId.textContent?.match(/ym\((\d+)/);
      if (match) {
        ymFunc(match[1], "reachGoal", event, params);
      }
    }
  }

  // Google Analytics
  const gtagFunc = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtagFunc === "function") {
    gtagFunc("event", event, params);
  }
}
