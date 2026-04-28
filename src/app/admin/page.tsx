"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculerCommission } from "@/lib/cagnotte-utils";

type Stats = {
  nbPrestataires: number;
  nbMaries: number;
  nbFaireParts: number;
  totalCagnotteCents: number;
  commissionCents: number;
  caTotalCents: number;
  commandesEnAttente: number;
  ventesEmois: number;
  panierMoyenCents: number;
  albumsCrees: number;
  photosInvites: number;
  messagesEchanges: number;
  documentsGeneres: number;
  prestatairesGratuit: number;
  virementsEnAttente: number;
};

type Alerte = {
  bg: string;
  border: string;
  dot: string;
  text: string;
  btnBg: string;
  message: string;
  href: string;
  cta: string;
};

type Card = {
  label: string;
  value: string;
  color: string;
  bg: string;
  badge?: boolean;
  icon: React.ReactNode;
};

function StatCard({ card }: { card: Card }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative"
        style={{ background: card.bg, color: card.color }}
      >
        {card.icon}
        {card.badge && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{card.label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">{card.value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const debutMois = new Date();
      debutMois.setDate(1);
      debutMois.setHours(0, 0, 0, 0);

      const [
        { count: nbPrestataires },
        { count: nbMaries },
        { count: nbFaireParts },
        { data: contributions },
        { data: commandesRows },
        { count: albumsCrees },
        { count: photosInvites },
        { count: messagesEchanges },
        { count: documentsGeneres },
        { count: prestatairesGratuit },
        { count: virementsEnAttente },
      ] = await Promise.all([
        supabase.from("prestataires").select("*", { count: "exact", head: true }),
        supabase.from("maries").select("*", { count: "exact", head: true }),
        supabase.from("invitations").select("*", { count: "exact", head: true }),
        supabase
          .from("cagnotte_contributions")
          .select("montant_cents, invitation_id")
          .eq("statut", "paye"),
        supabase.from("commandes").select("montant, statut, created_at"),
        supabase.from("maries").select("*", { count: "exact", head: true }).not("album_slug", "is", null),
        supabase.from("album_photos").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("documents_prestataire").select("*", { count: "exact", head: true }),
        supabase.from("prestataires").select("*", { count: "exact", head: true }).eq("abonnement_actif", false),
        supabase.from("invitations").select("*", { count: "exact", head: true }).eq("virement_statut", "demande"),
      ]);

      const rows = contributions ?? [];
      const totalCagnotteCents = rows.reduce((sum, c) => sum + (c.montant_cents ?? 0), 0);
      const totauxParCagnotte = new Map<string, number>();
      for (const c of rows) {
        const prev = totauxParCagnotte.get(c.invitation_id) ?? 0;
        totauxParCagnotte.set(c.invitation_id, prev + (c.montant_cents ?? 0));
      }
      const commissionCents = Array.from(totauxParCagnotte.values()).reduce(
        (sum, total) => sum + calculerCommission(total),
        0
      );

      const cmds = commandesRows ?? [];
      const caTotalCents = Math.round(
        cmds.reduce((sum, c) => sum + Number(c.montant ?? 0), 0) * 100
      );
      const commandesEnAttente = cmds.filter((c) => c.statut === "recue").length;
      const ventesEmois = cmds.filter((c) => new Date(c.created_at) >= debutMois).length;
      const panierMoyenCents = cmds.length > 0 ? Math.round(caTotalCents / cmds.length) : 0;

      setStats({
        nbPrestataires: nbPrestataires ?? 0,
        nbMaries: nbMaries ?? 0,
        nbFaireParts: nbFaireParts ?? 0,
        totalCagnotteCents,
        commissionCents,
        caTotalCents,
        commandesEnAttente,
        ventesEmois,
        panierMoyenCents,
        albumsCrees: albumsCrees ?? 0,
        photosInvites: photosInvites ?? 0,
        messagesEchanges: messagesEchanges ?? 0,
        documentsGeneres: documentsGeneres ?? 0,
        prestatairesGratuit: prestatairesGratuit ?? 0,
        virementsEnAttente: virementsEnAttente ?? 0,
      });
    }
    load();
  }, []);

  if (!stats) {
    return <div className="text-sm text-gray-400">Chargement…</div>;
  }

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  const mainCards: Card[] = [
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
      value: fmt(stats.totalCagnotteCents),
      color: "#10B981",
      bg: "#ECFDF5",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Revenus commission (5 % / 3,5 %)",
      value: fmt(stats.commissionCents),
      color: "#F59E0B",
      bg: "#FFFBEB",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const boutiqueCards: Card[] = [
    {
      label: "CA total boutique",
      value: fmt(stats.caTotalCents),
      color: "#059669",
      bg: "#D1FAE5",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: "Commandes en attente",
      value: stats.commandesEnAttente.toLocaleString("fr-FR"),
      color: "#DC2626",
      bg: "#FEE2E2",
      badge: stats.commandesEnAttente > 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Ventes ce mois",
      value: stats.ventesEmois.toLocaleString("fr-FR"),
      color: "#2563EB",
      bg: "#DBEAFE",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Panier moyen",
      value: fmt(stats.panierMoyenCents),
      color: "#D97706",
      bg: "#FEF3C7",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  const activiteCards: Card[] = [
    {
      label: "Albums photo créés",
      value: stats.albumsCrees.toLocaleString("fr-FR"),
      color: "#7C3AED",
      bg: "#EDE9FE",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Photos invités uploadées",
      value: stats.photosInvites.toLocaleString("fr-FR"),
      color: "#DB2777",
      bg: "#FCE7F3",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Messages échangés",
      value: stats.messagesEchanges.toLocaleString("fr-FR"),
      color: "#0891B2",
      bg: "#CFFAFE",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: "Documents générés",
      value: stats.documentsGeneres.toLocaleString("fr-FR"),
      color: "#4F46E5",
      bg: "#E0E7FF",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const alertesRaw: (Alerte | null)[] = [
    stats.commandesEnAttente > 0
      ? {
          bg: "#FEF2F2",
          border: "#FECACA",
          dot: "#EF4444",
          text: "#991B1B",
          btnBg: "#EF4444",
          message: `${stats.commandesEnAttente} commande${stats.commandesEnAttente > 1 ? "s" : ""} à expédier`,
          href: "/admin/boutique",
          cta: "Voir les commandes →",
        }
      : null,
    stats.prestatairesGratuit > 0
      ? {
          bg: "#FFF7ED",
          border: "#FED7AA",
          dot: "#F97316",
          text: "#9A3412",
          btnBg: "#F97316",
          message: `${stats.prestatairesGratuit} prestataire${stats.prestatairesGratuit > 1 ? "s" : ""} sur plan gratuit à convertir`,
          href: "/admin/upsell",
          cta: "Voir l'upsell →",
        }
      : null,
    stats.virementsEnAttente > 0
      ? {
          bg: "#FEFCE8",
          border: "#FDE68A",
          dot: "#EAB308",
          text: "#854D0E",
          btnBg: "#EAB308",
          message: `${stats.virementsEnAttente} virement${stats.virementsEnAttente > 1 ? "s" : ""} cagnotte en attente`,
          href: "/admin/cagnottes",
          cta: "Voir les cagnottes →",
        }
      : null,
  ];
  const alertes: Alerte[] = alertesRaw.filter((a): a is Alerte => a !== null);

  return (
    <div className="space-y-10">
      {/* ── Vue d'ensemble ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Vue d&apos;ensemble</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mainCards.map((card) => (
            <StatCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      {/* ── Boutique & Revenus ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-4">💰 Boutique</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {boutiqueCards.map((card) => (
            <StatCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      {/* ── Activité plateforme ────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-4">📊 Activité</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activiteCards.map((card) => (
            <StatCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      {/* ── Alertes & Actions rapides ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-4">🔔 Alertes</h3>
        {alertes.length === 0 ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <p className="text-sm font-medium text-green-800">Tout est à jour — aucune action requise ✓</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertes.map((a) => (
              <div
                key={a.href}
                className="flex items-center justify-between gap-4 rounded-xl border px-5 py-4"
                style={{ background: a.bg, borderColor: a.border }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: a.dot }}
                  />
                  <p className="text-sm font-medium truncate" style={{ color: a.text }}>
                    {a.message}
                  </p>
                </div>
                <Link
                  href={a.href}
                  className="shrink-0 text-xs font-semibold text-white rounded-lg px-3 py-1.5 transition-opacity hover:opacity-90"
                  style={{ background: a.btnBg }}
                >
                  {a.cta}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
