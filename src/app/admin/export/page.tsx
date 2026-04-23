"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

function download(csv: string, filename: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type ExportKey = "prestataires" | "maries" | "contributions";

export default function ExportAdminPage() {
  const [loading, setLoading] = useState<ExportKey | null>(null);

  async function exportPrestataires() {
    setLoading("prestataires");
    const { data } = await supabase
      .from("prestataires")
      .select(
        `nom_entreprise, categorie, ville, telephone, site_web, instagram, prix_depart,
         verifie, abonnement_actif, created_at,
         users!user_id(email),
         abonnements!prestataire_id(plan, statut)`
      )
      .order("created_at", { ascending: false });

    const rows = (data ?? []).map((p: Record<string, unknown>) => {
      const u = p.users as Record<string, unknown> | null;
      const abos = p.abonnements as Record<string, unknown>[];
      const plan = abos?.find((a) => a.statut === "actif")?.plan ?? "gratuit";
      return {
        nom_entreprise: p.nom_entreprise,
        email: u?.email ?? "",
        categorie: p.categorie,
        ville: p.ville ?? "",
        telephone: p.telephone ?? "",
        site_web: p.site_web ?? "",
        instagram: p.instagram ?? "",
        prix_depart: p.prix_depart ?? "",
        verifie: p.verifie ? "Oui" : "Non",
        abonnement_actif: p.abonnement_actif ? "Oui" : "Non",
        plan,
        inscription: p.created_at ? new Date(p.created_at as string).toLocaleDateString("fr-FR") : "",
      };
    });

    const headers = [
      "nom_entreprise", "email", "categorie", "ville", "telephone",
      "site_web", "instagram", "prix_depart", "verifie", "abonnement_actif", "plan", "inscription",
    ];
    download(toCSV(rows, headers), `prestataires_${new Date().toISOString().slice(0, 10)}.csv`);
    setLoading(null);
  }

  async function exportMaries() {
    setLoading("maries");
    const { data } = await supabase
      .from("maries")
      .select(
        `prenom_marie1, prenom_marie2, date_mariage, lieu_mariage, created_at,
         users!user_id(email)`
      )
      .order("created_at", { ascending: false });

    const rows = (data ?? []).map((m: Record<string, unknown>) => {
      const u = m.users as Record<string, unknown> | null;
      return {
        prenom_marie1: m.prenom_marie1,
        prenom_marie2: m.prenom_marie2 ?? "",
        email: u?.email ?? "",
        date_mariage: m.date_mariage ? new Date(m.date_mariage as string).toLocaleDateString("fr-FR") : "",
        lieu_mariage: m.lieu_mariage ?? "",
        inscription: m.created_at ? new Date(m.created_at as string).toLocaleDateString("fr-FR") : "",
      };
    });

    const headers = ["prenom_marie1", "prenom_marie2", "email", "date_mariage", "lieu_mariage", "inscription"];
    download(toCSV(rows, headers), `maries_${new Date().toISOString().slice(0, 10)}.csv`);
    setLoading(null);
  }

  async function exportContributions() {
    setLoading("contributions");
    const { data } = await supabase
      .from("cagnotte_contributions")
      .select(
        `contributeur_nom, contributeur_email, montant_cents, message, statut, created_at,
         invitations!invitation_id(cagnotte_titre, maries!marie_id(prenom_marie1, prenom_marie2))`
      )
      .eq("statut", "paye")
      .order("created_at", { ascending: false });

    const rows = (data ?? []).map((c: Record<string, unknown>) => {
      const inv = c.invitations as Record<string, unknown> | null;
      const marie = inv?.maries as Record<string, unknown> | null;
      return {
        contributeur_nom: c.contributeur_nom,
        contributeur_email: c.contributeur_email,
        montant_eur: ((c.montant_cents as number) / 100).toFixed(2),
        message: c.message ?? "",
        cagnotte: inv?.cagnotte_titre ?? "",
        marie1: marie?.prenom_marie1 ?? "",
        marie2: marie?.prenom_marie2 ?? "",
        date: c.created_at ? new Date(c.created_at as string).toLocaleDateString("fr-FR") : "",
      };
    });

    const headers = [
      "contributeur_nom", "contributeur_email", "montant_eur",
      "message", "cagnotte", "marie1", "marie2", "date",
    ];
    download(toCSV(rows, headers), `contributions_cagnotte_${new Date().toISOString().slice(0, 10)}.csv`);
    setLoading(null);
  }

  const EXPORTS: {
    key: ExportKey;
    label: string;
    desc: string;
    action: () => Promise<void>;
    color: string;
  }[] = [
    {
      key: "prestataires",
      label: "Exporter prestataires",
      desc: "Nom, email, catégorie, ville, plan, statut inscription…",
      action: exportPrestataires,
      color: "#F06292",
    },
    {
      key: "maries",
      label: "Exporter mariés",
      desc: "Prénoms, email, date et lieu de mariage, date inscription…",
      action: exportMaries,
      color: "#60A5FA",
    },
    {
      key: "contributions",
      label: "Exporter contributions cagnotte",
      desc: "Contributeur, montant, message, cagnotte liée, date…",
      action: exportContributions,
      color: "#10B981",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Export CSV</h2>
      <p className="text-sm text-gray-400 mb-8">
        Les fichiers sont générés et téléchargés directement dans votre navigateur.
      </p>

      <div className="grid gap-4 max-w-2xl">
        {EXPORTS.map(({ key, label, desc, action, color }) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={action}
              disabled={loading === key}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 shrink-0"
              style={{ background: color + "18", color }}
            >
              {loading === key ? (
                "Génération…"
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
