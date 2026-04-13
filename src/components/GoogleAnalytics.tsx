"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getCookieConsent, type CookieConsent } from "./CookieBanner";

const GA_ID = "G-ZP327QEQKW";

export default function GoogleAnalytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    // Lecture initiale du consentement
    const consent = getCookieConsent();
    if (consent?.analytics) {
      setAnalyticsAllowed(true);
    }

    // Écoute les mises à jour du consentement sans rechargement de page
    function handleUpdate(e: Event) {
      const detail = (e as CustomEvent<CookieConsent>).detail;
      setAnalyticsAllowed(detail.analytics);

      // Si l'utilisateur retire son consentement, on désactive la collecte en live
      if (!detail.analytics && typeof window !== "undefined" && window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }
    }

    window.addEventListener("cookieConsentUpdate", handleUpdate);
    return () => window.removeEventListener("cookieConsentUpdate", handleUpdate);
  }, []);

  if (!analyticsAllowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            wait_for_update: 0
          });
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

// Typage global pour éviter les erreurs TS
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
