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
};

type RecentDoc = {
  id: string;
  type: "devis" | "facture" | "contrat";
  montant_ttc: number | null;
  created_at: string;
  numero: string;
  nom_entreprise: string;
  prestataire_id: string;
  user_id: string | null;
  plan: string;
};

const PLAN_STYLE: Record<string, { bg: string; text: string }> = {
  gratuit: { bg: "#F3F4F6", text: "#6B7280" },
  starter: { bg: "#EFF6FF", text: "#3B82F6" },
  pro:     { bg: "#F5F3FF", text: "#8B5CF6" },
  premium: { bg: "#FFFBEB", text: "#D97706" },
};

const DOC_TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  devis:   { bg: "#EFF6FF", text: "#3B82F6", label: "Devis" },
  facture: { bg: "#FFF7ED", text: "#EA580C", label: "Facture" },
  contrat: { bg: "#F0FDF4", text: "#16A34A", label: "Contrat" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function fmtMoney(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[] | null>(null);

  useEffect(() => {
    async function load() {
      const session = (await supabase.auth.getSession()).data.session;
      const authHeaders: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      const [
        { count: nbPrestataires },
        { count: nbMaries },
        { count: nbFaireParts },
        { data: contributions },
        docsRes,
      ] = await Promise.all([
        supabase.from("prestataires").select("*", { count: "exact", head: true }),
        supabase.from("maries").select("*", { count: "exact", head: true }),
        supabase.from("invitations").select("*", { count: "exact", head: true }),
        supabase
          .from("cagnotte_contributions")
          .select("montant_cents, invitation_id")
          .eq("statut", "paye"),
        fetch("/api/admin/recent-documents", { headers: authHeaders }),
      ]);

      const rows = contributions ?? [];
      const totalCagnotteCents = rows.reduce((sum, c) => sum + (c.montant_cents ?? 0), 0);

      const totauxParCagnotte = new Map<string, number>();
      for (const c of rows) {
        const prev = totauxParCagnotte.get(c.invitation_id) ?? 0;
        totauxParCagnotte.set(c.invitation_id, prev + (c.montant_cents ?? 0));
      }
      const commissionCents = Array.from(totauxParCagnotte.values()).reduce(
        (sum, total) => sum + calculerCommission(total), 0
      );

      setStats({
        nbPrestataires: nbPrestataires ?? 0,
        nbMaries: nbMaries ?? 0,
        nbFaireParts: nbFaireParts ?? 0,
        totalCagnotteCents,
        commissionCents,
      });

      if (docsRes.ok) {
        const json = await docsRes.json();
        setRecentDocs(json.docs ?? []);
      } else {
        setRecentDocs([]);
      }
    }
    load();
  }, []);

  if (!stats) {
    return <div className="text-sm text-gray-400">Chargement…</div>;
  }

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
      label: "Revenus commission (5 % / 3,5 %)",
      value: (stats.commissionCents / 100).toLocaleString("fr-FR", {
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
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vue d&apos;ensemble</h2>

      {/* ── Cartes stats ──────────────────────────────────────────────────────── */}
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

      {/* ── Activité récente — Documents ──────────────────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Activité récente — Documents
          </h3>
          <span className="text-xs text-gray-400">10 derniers générés</span>
        </div>

        {recentDocs === null ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400 text-center">
            Chargement…
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400 text-center">
            Aucun document généré pour le moment.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* En-tête */}
            <div
              className="hidden md:grid gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{
                gridTemplateColumns: "1fr 90px 110px 90px 90px 100px",
                color: "#F06292",
                background: "#FFF0F5",
              }}
            >
              <span>Prestataire</span>
              <span>Type</span>
              <span className="text-right">Montant TTC</span>
              <span>Plan</span>
              <span>Date</span>
              <span />
            </div>

            <div className="divide-y divide-gray-50">
              {recentDocs.map((doc) => {
                const typeStyle = DOC_TYPE_STYLE[doc.type] ?? DOC_TYPE_STYLE.devis;
                const planStyle = PLAN_STYLE[doc.plan] ?? PLAN_STYLE.gratuit;

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col md:grid gap-3 md:gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
                    style={{ gridTemplateColumns: "1fr 90px 110px 90px 90px 100px" }}
                  >
                    {/* Prestataire */}
                    <div className="flex items-center min-w-0">
                      <Link
                        href="/admin/prestataires"
                        className="text-sm font-semibold text-gray-900 truncate hover:text-rose-500 transition-colors"
                      >
                        {doc.nom_entreprise}
                      </Link>
                    </div>

                    {/* Type */}
                    <div className="flex items-center">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: typeStyle.bg, color: typeStyle.text }}
                      >
                        {typeStyle.label}
                      </span>
                    </div>

                    {/* Montant */}
                    <div className="flex items-center md:justify-end">
                      <span className="text-sm font-semibold text-gray-900">
                        {doc.montant_ttc != null ? fmtMoney(doc.montant_ttc) : "—"}
                      </span>
                    </div>

                    {/* Plan */}
                    <div className="flex items-center">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-lg uppercase"
                        style={{ background: planStyle.bg, color: planStyle.text }}
                      >
                        {doc.plan}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">{timeAgo(doc.created_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-start md:justify-end">
                      {doc.user_id ? (
                        <Link
                          href={`/admin/messages?userId=${doc.user_id}&name=${encodeURIComponent(doc.nom_entreprise)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 text-white"
                          style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Contacter
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
