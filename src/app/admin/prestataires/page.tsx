"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type AbonnementRow = {
  plan: string;
  statut: string;
};

type PrestatairRow = {
  id: string;
  nom_entreprise: string;
  ville: string | null;
  categorie: string;
  verifie: boolean;
  cover_url: string | null;
  photos: string[] | null;
  description: string | null;
  telephone: string | null;
  site_web: string | null;
  instagram: string | null;
  prix_depart: number | null;
  created_at: string;
  users: { email: string } | null;
  abonnements: AbonnementRow[];
};

function activePlan(abonnements: AbonnementRow[]): string {
  return (
    (abonnements ?? []).find((a) => a.statut === "actif")?.plan ?? "gratuit"
  );
}

function profileScore(p: PrestatairRow): number {
  let score = 0;
  if (p.cover_url) score += 15;
  if ((p.photos?.length ?? 0) >= 3) score += 10;
  if (p.description && p.description.length >= 100) score += 10;
  if (p.ville) score += 5;
  if (p.telephone) score += 5;
  if (p.site_web || p.instagram) score += 5;
  if (p.prix_depart != null) score += 5;
  return score;
}

const PLAN_STYLE: Record<string, { bg: string; text: string }> = {
  premium: { bg: "#FFF0F5", text: "#F06292" },
  pro: { bg: "#EFF6FF", text: "#3B82F6" },
  starter: { bg: "#F0FDF4", text: "#10B981" },
  essentiel: { bg: "#F0FDF4", text: "#10B981" },
  gratuit: { bg: "#F9FAFB", text: "#6B7280" },
};

export default function PrestatairesAdminPage() {
  const [prestataires, setPrestataires] = useState<PrestatairRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("prestataires")
      .select(
        `id, nom_entreprise, ville, categorie, verifie,
         cover_url, photos, description, telephone, site_web, instagram, prix_depart, created_at,
         users!user_id(email),
         abonnements!prestataire_id(plan, statut)`
      )
      .order("created_at", { ascending: false });
    setPrestataires((data as unknown as PrestatairRow[]) ?? []);
    setLoading(false);
  }

  async function toggleVerifie(id: string, current: boolean) {
    setToggling(id);
    await supabase
      .from("prestataires")
      .update({ verifie: !current })
      .eq("id", id);
    setPrestataires((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verifie: !current } : p))
    );
    setToggling(null);
  }

  const filtered = prestataires.filter(
    (p) =>
      !search ||
      p.nom_entreprise.toLowerCase().includes(search.toLowerCase()) ||
      (p.ville ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase()) ||
      (p.users?.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 shrink-0">
          Prestataires ({prestataires.length})
        </h2>
        <input
          type="text"
          placeholder="Rechercher par nom, ville, catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Prestataire
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Catégorie
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Plan
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Complétude
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Vérifié
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Inscription
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => {
              const plan = activePlan(p.abonnements);
              const planStyle = PLAN_STYLE[plan] ?? PLAN_STYLE.gratuit;
              const score = profileScore(p);
              return (
                <tr key={p.id} className="hover:bg-gray-50/40">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{p.nom_entreprise}</p>
                    <p className="text-xs text-gray-400">{p.users?.email ?? "—"}</p>
                    {p.ville && (
                      <p className="text-xs text-gray-400">{p.ville}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 capitalize whitespace-nowrap">
                    {p.categorie.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: planStyle.bg, color: planStyle.text }}
                    >
                      {plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(score / 60) * 100}%`,
                            background:
                              score >= 45
                                ? "#10B981"
                                : score >= 25
                                ? "#F59E0B"
                                : "#F06292",
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
                        {score}/60
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {p.verifie ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Vérifié
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleVerifie(p.id, p.verifie)}
                      disabled={toggling === p.id}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        p.verifie
                          ? "bg-red-50 hover:bg-red-100 text-red-600"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {toggling === p.id ? "…" : p.verifie ? "Retirer" : "Vérifier"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-400">
            Aucun résultat.
          </div>
        )}
      </div>
    </div>
  );
}
