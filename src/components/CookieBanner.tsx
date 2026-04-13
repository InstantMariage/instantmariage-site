"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type CookieConsent = {
  analytics: boolean;
  timestamp: number;
  version: string;
};

const CONSENT_KEY = "im_cookie_consent";
const CONSENT_VERSION = "1.0";
const CONSENT_DURATION_MS = 13 * 30 * 24 * 60 * 60 * 1000; // 13 mois (CNIL)

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data: CookieConsent = JSON.parse(raw);
    // Expiration après 13 mois
    if (Date.now() - data.timestamp > CONSENT_DURATION_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  // Dispatch event pour que GoogleAnalytics réagisse sans rechargement
  window.dispatchEvent(new CustomEvent("cookieConsentUpdate", { detail: consent }));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      // Légère attente pour éviter le flash au premier rendu SSR
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  function acceptAll() {
    saveConsent({ analytics: true, timestamp: Date.now(), version: CONSENT_VERSION });
    setVisible(false);
  }

  function refuseAll() {
    saveConsent({ analytics: false, timestamp: Date.now(), version: CONSENT_VERSION });
    setVisible(false);
  }

  function saveCustom() {
    saveConsent({ analytics: analyticsEnabled, timestamp: Date.now(), version: CONSENT_VERSION });
    setVisible(false);
  }

  return (
    <>
      {/* Overlay semi-transparent quand le panneau de personnalisation est ouvert */}
      {showCustomize && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm"
          onClick={() => setShowCustomize(false)}
          aria-hidden="true"
        />
      )}

      {/* Bandeau principal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gestion des cookies"
        className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pt-0"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Barre rose supérieure */}
          <div className="h-1 w-full bg-gradient-to-r from-rose-400 to-pink-500" />

          {!showCustomize ? (
            /* ── Vue principale ── */
            <div className="px-6 py-5 md:px-8 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Icône + texte */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm" style={{ fontFamily: "var(--font-playfair), serif" }}>
                      Nous utilisons des cookies
                    </p>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      Nous utilisons des cookies analytiques (Google Analytics) pour mesurer l&apos;audience de notre site et améliorer votre expérience. Votre choix est valable 13 mois.{" "}
                      <Link href="/cookies" className="text-rose-400 hover:text-rose-500 underline underline-offset-2 transition-colors">
                        En savoir plus
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-full border border-gray-200 hover:border-gray-400 transition-all duration-200 whitespace-nowrap"
                  >
                    Personnaliser
                  </button>
                  <button
                    onClick={refuseAll}
                    className="text-rose-400 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-full border-2 border-rose-400 hover:bg-rose-400 transition-all duration-200 whitespace-nowrap"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={acceptAll}
                    className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    Tout accepter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Vue personnalisation ── */
            <div className="px-6 py-5 md:px-8 md:py-6">
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-gray-900 font-bold text-lg"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Personnaliser mes préférences
                </h2>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Fermer la personnalisation"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Cookies essentiels — toujours actifs */}
                <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Cookies essentiels</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Nécessaires au fonctionnement du site (session, sécurité, préférences). Ne peuvent pas être désactivés.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-rose-400 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      Toujours actifs
                    </span>
                  </div>
                </div>

                {/* Cookies analytiques — optionnel */}
                <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Cookies analytiques</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Google Analytics — mesure d&apos;audience anonymisée (pages vues, parcours utilisateur). Aucune donnée personnelle vendue.
                    </p>
                  </div>
                  {/* Toggle switch */}
                  <button
                    role="switch"
                    aria-checked={analyticsEnabled}
                    aria-label="Activer les cookies analytiques"
                    onClick={() => setAnalyticsEnabled((v) => !v)}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
                      analyticsEnabled ? "bg-rose-400" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        analyticsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={refuseAll}
                  className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-full border border-gray-200 hover:border-gray-400 transition-all duration-200"
                >
                  Tout refuser
                </button>
                <button
                  onClick={saveCustom}
                  className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Enregistrer mes choix
                </button>
                <button
                  onClick={acceptAll}
                  className="text-rose-400 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-full border-2 border-rose-400 hover:bg-rose-400 transition-all duration-200"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Bouton discret dans le footer permettant de rouvrir le bandeau à tout moment.
 * Conforme CNIL : le retrait du consentement doit être aussi facile que son octroi.
 */
export function CookieReopenButton({ className }: { className?: string }) {
  function reopen() {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  }
  return (
    <button onClick={reopen} className={className}>
      Gestion des cookies
    </button>
  );
}
