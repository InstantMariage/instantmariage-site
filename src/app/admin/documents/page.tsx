"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<RecentDoc[] | null>(null);

  useEffect(() => {
    localStorage.setItem("admin_visited_documents", new Date().toISOString());

    async function load() {
      const session = (await supabase.auth.getSession()).data.session;
      const authHeaders: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      const res = await fetch("/api/admin/recent-documents", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setDocs(json.docs ?? []);
      } else {
        setDocs([]);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents
        </h2>
        <span className="text-xs text-gray-400">10 derniers générés</span>
      </div>

      {docs === null ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400 text-center">
          Chargement…
        </div>
      ) : docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400 text-center">
          Aucun document généré pour le moment.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
            {docs.map((doc) => {
              const typeStyle = DOC_TYPE_STYLE[doc.type] ?? DOC_TYPE_STYLE.devis;
              const planStyle = PLAN_STYLE[doc.plan] ?? PLAN_STYLE.gratuit;

              return (
                <div
                  key={doc.id}
                  className="flex flex-col md:grid gap-3 md:gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
                  style={{ gridTemplateColumns: "1fr 90px 110px 90px 90px 100px" }}
                >
                  <div className="flex items-center min-w-0">
                    <Link
                      href="/admin/prestataires"
                      className="text-sm font-semibold text-gray-900 truncate hover:text-rose-500 transition-colors"
                    >
                      {doc.nom_entreprise}
                    </Link>
                  </div>

                  <div className="flex items-center">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ background: typeStyle.bg, color: typeStyle.text }}
                    >
                      {typeStyle.label}
                    </span>
                  </div>

                  <div className="flex items-center md:justify-end">
                    <span className="text-sm font-semibold text-gray-900">
                      {doc.montant_ttc != null ? fmtMoney(doc.montant_ttc) : "—"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-lg uppercase"
                      style={{ background: planStyle.bg, color: planStyle.text }}
                    >
                      {doc.plan}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xs text-gray-400">{timeAgo(doc.created_at)}</span>
                  </div>

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
  );
}
