"use client";

import { useState, useEffect } from "react";

export default function NotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  // N'afficher que dans l'app PWA installée
  if (!isStandalone) return null;
  // Déjà accordé → rien à montrer
  if (permission === "granted") return null;
  // En cours de chargement
  if (permission === null) return null;

  const handleEnable = async () => {
    if (!("Notification" in window)) return;
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } finally {
      setRequesting(false);
    }
  };

  if (permission === "denied") {
    return (
      <div
        className="flex items-start gap-3 px-4 py-3.5 rounded-2xl text-sm"
        style={{
          background: "#FFF7ED",
          border: "1px solid #FED7AA",
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          style={{ color: "#F97316" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17H20L18.595 15.595A1.5 1.5 0 0118 14.5V11a6.001 6.001 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.5c0 .386-.146.756-.405 1.036L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <div>
          <p className="font-semibold text-orange-700 mb-0.5">Notifications bloquées</p>
          <p className="text-orange-600 text-xs leading-relaxed">
            Pour les réactiver : <strong>Réglages → Safari → Notifications</strong> puis autorisez ce site.
          </p>
        </div>
      </div>
    );
  }

  // permission === "default" — bouton pour activer manuellement
  return (
    <button
      onClick={handleEnable}
      disabled={requesting}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-60"
      style={{
        background: "white",
        border: "1px solid #FECDD3",
        boxShadow: "0 4px 24px rgba(240,98,146,0.08)",
        textAlign: "left",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "#FFF0F5", color: "#F06292" }}
      >
        {requesting ? (
          <div
            className="w-4 h-4 border-2 border-transparent rounded-full animate-spin"
            style={{ borderTopColor: "#F06292" }}
          />
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17H20L18.595 15.595A1.5 1.5 0 0118 14.5V11a6.001 6.001 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.5c0 .386-.146.756-.405 1.036L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">Activer les notifications</p>
        <p className="text-xs text-gray-400 mt-0.5">Soyez alerté à chaque nouveau message</p>
      </div>
      <svg
        className="w-4 h-4 text-gray-300 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
