"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  nbPrestataires: number;
  nbMaries: number;
  nbFaireParts: number;
  totalCagnotteCents: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [
        { count: nbPrestataires },
        { count: nbMaries },
        { count: nbFaireParts },
        { data: contributions },
      ] = await Promise.all([
        supabase.from("prestataires").select("*", { count: "exact", head: true }),
        supabase.from("maries").select("*", { count: "exact", head: true }),
        supabase.from("invitations").select("*", { count: "exact", head: true }),
        supabase
          .from("cagnotte_contributions")
          .select("montant_cents")
          .eq("statut", "paye"),
      ]);

      const totalCagnotteCents = (contributions ?? []).reduce(
        (sum, c) => sum + (c.montant_cents ?? 0),
        0
      );

      setStats({
        nbPrestataires: nbPrestataires ?? 0,
        nbMaries: nbMaries ?? 0,
        nbFaireParts: nbFaireParts ?? 0,
        totalCagnotteCents,
      });
    }
    load();
  }, []);

  if (!stats) {
    return <div className="text-sm text-gray-400">Chargement…</div>;
  }

  const commissionCents = Math.round(stats.totalCagnotteCents * 0.02);

  const cards = [
    {
      label: "Prestataires inscrits",
      value: stats.nbPrestataires.toLocaleString("fr-FR"),
      color: "#3B82F6",
      bg: "#EFF6FF",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "Mariés inscrits",
      value: stats.nbMaries.toLocaleString("fr-FR"),
      color: "#F06292",
      bg: "#FFF0F5",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: "Faire-parts créés",
      value: stats.nbFaireParts.toLocaleString("fr-FR"),
      color: "#8B5CF6",
      bg: "#F5F3FF",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Total cagnottes collectées",
      value: (stats.totalCagnotteCents / 100).toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
      color: "#10B981",
      bg: "#ECFDF5",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Revenus commission (2 %)",
      value: (commissionCents / 100).toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
      color: "#F59E0B",
      bg: "#FFFBEB",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vue d'ensemble</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium truncate">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
