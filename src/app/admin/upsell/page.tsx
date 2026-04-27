"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type PlanKey = "gratuit" | "starter" | "pro";
type FilterKey = "all" | "gratuit" | "starter" | "pro";

const PLAN_LABEL: Record<string, string> = {
  gratuit: "Gratuit",
  starter: "Starter",
  pro: "Pro",
};

const PLAN_BADGE: Record<string, { bg: string; color: string }> = {
  gratuit: { bg: "#F3F4F6", color: "#6B7280" },
  starter: { bg: "#EFF6FF", color: "#3B82F6" },
  pro: { bg: "#FFF0F5", color: "#F06292" },
};

const PLAN_ORDER: Record<string, number> = {
  gratuit: 1, starter: 2, pro: 3,
};

const NEXT_PLAN: Record<PlanKey, string> = {
  gratuit: "Starter",
  starter: "Pro",
  pro: "Premium",
};

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "gratuit", label: "Gratuit → Starter" },
  { key: "starter", label: "Starter → Pro" },
  { key: "pro", label: "Pro → Premium" },
];

type PrestataireStat = {
  id: string;
  nom_entreprise: string;
  user_id: string;
  active_plan: PlanKey;
  completeness_score: number;
  nb_avis: number;
  created_at: string;
  doc_count: number;
  msg_count: number;
  score: number;
};

function computeScore(p: Omit<PrestataireStat, "score">): number {
  const docs = Math.min(p.doc_count * 15, 30);
  const msgs = Math.min(p.msg_count * 5, 25);
  const completeness = Math.round((p.completeness_score / 60) * 20);
  const avis = Math.min(p.nb_avis * 5, 15);
  const anciennete =
    new Date().getTime() - new Date(p.created_at).getTime() > 7 * 86400_000
      ? 10
      : 0;
  return docs + msgs + completeness + avis + anciennete;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "#16a34a" : score >= 40 ? "#F06292" : "#9CA3AF";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums w-9 text-right"
        style={{ color }}
      >
        {score}/100
      </span>
    </div>
  );
}

function SortIcon({
  col,
  sortColumn,
  sortDirection,
}: {
  col: string;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
}) {
  if (sortColumn !== col)
    return <span className="ml-1 text-gray-300 select-none">↕</span>;
  return (
    <span className="ml-1 text-gray-500 select-none">
      {sortDirection === "asc" ? "↑" : "↓"}
    </span>
  );
}

export default function AdminUpsellPage() {
  const [prestataires, setPrestataires] = useState<PrestataireStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Non autorisé");
        return;
      }

      const res = await fetch("/api/admin/upsell-stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setError("Erreur lors du chargement");
        return;
      }

      const json = await res.json();
      const withScores: PrestataireStat[] = (json.prestataires ?? []).map(
        (p: Omit<PrestataireStat, "score">) => ({ ...p, score: computeScore(p) })
      );
      withScores.sort((a, b) => b.score - a.score);
      setPrestataires(withScores);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSendBanner(prestataireId: string) {
    if (sending) return;
    setSending(prestataireId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/send-banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prestataireId }),
      });
      if (res.ok) {
        setSent((prev) => new Set(prev).add(prestataireId));
      }
    } finally {
      setSending(null);
    }
  }

  function handleSort(col: string) {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  }

  const filtered = useMemo(() => {
    const base = prestataires.filter((p) =>
      filter === "all" ? true : p.active_plan === filter
    );
    if (!sortColumn) return base;
    return [...base].sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "nom":
          cmp = a.nom_entreprise.localeCompare(b.nom_entreprise, "fr");
          break;
        case "plan":
          cmp =
            (PLAN_ORDER[a.active_plan] ?? 0) -
            (PLAN_ORDER[b.active_plan] ?? 0);
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "documents":
          cmp = a.doc_count - b.doc_count;
          break;
        case "messages":
          cmp = a.msg_count - b.msg_count;
          break;
        case "completude":
          cmp = a.completeness_score - b.completeness_score;
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [prestataires, filter, sortColumn, sortDirection]);

  const thClass =
    "text-xs font-semibold text-gray-500 px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap";
  const thClassCenter =
    "text-center text-xs font-semibold text-gray-500 px-4 py-3.5 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Opportunités de conversion
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Prestataires actifs à convertir vers le plan supérieur
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
            style={
              filter === key
                ? { background: "#F06292", color: "white" }
                : {
                    background: "white",
                    color: "#6B7280",
                    border: "1px solid #E5E7EB",
                  }
            }
          >
            {label}
            {key !== "all" && (
              <span className="ml-2 text-xs opacity-70">
                ({prestataires.filter((p) => p.active_plan === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          Chargement…
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th
                    onClick={() => handleSort("nom")}
                    className={`text-left ${thClass}`}
                  >
                    Prestataire{" "}
                    <SortIcon col="nom" sortColumn={sortColumn} sortDirection={sortDirection} />
                  </th>
                  <th
                    onClick={() => handleSort("plan")}
                    className={`text-left ${thClass}`}
                  >
                    Plan actuel{" "}
                    <SortIcon col="plan" sortColumn={sortColumn} sortDirection={sortDirection} />
                  </th>
                  <th
                    onClick={() => handleSort("score")}
                    className={`text-left text-xs font-semibold text-gray-500 px-4 py-3.5 min-w-[160px] cursor-pointer select-none hover:text-gray-700 whitespace-nowrap`}
                  >
                    Score d&apos;activité{" "}
                    <SortIcon col="score" sortColumn={sortColumn} sortDirection={sortDirection} />
                  </th>
                  <th
                    onClick={() => handleSort("documents")}
                    className={thClassCenter}
                  >
                    Documents{" "}
                    <SortIcon col="documents" sortColumn={sortColumn} sortDirection={sortDirection} />
                  </th>
                  <th
                    onClick={() => handleSort("messages")}
                    className={thClassCenter}
                  >
                    Messages{" "}
                    <SortIcon col="messages" sortColumn={sortColumn} sortDirection={sortDirection} />
                  </th>
                  <th
                    onClick={() => handleSort("completude")}
                    className={thClassCenter}
                  >
                    Complétude{" "}
                    <SortIcon col="completude" sortColumn={sortColumn} sortDirection={sortDirection} />
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center text-gray-400 py-10 text-sm"
                    >
                      Aucun prestataire dans cette catégorie
                    </td>
                  </tr>
                )}
                {filtered.map((p) => {
                  const badge = PLAN_BADGE[p.active_plan] ?? PLAN_BADGE.gratuit;
                  const nextPlan = NEXT_PLAN[p.active_plan] ?? "Premium";
                  const alreadySent = sent.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900">
                          {p.nom_entreprise}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {PLAN_LABEL[p.active_plan] ?? p.active_plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ScoreBar score={p.score} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-gray-700">
                          {p.doc_count}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-gray-700">
                          {p.msg_count}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-gray-700">
                          {Math.round((p.completeness_score / 60) * 100)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleSendBanner(p.id)}
                          disabled={!!sending || alreadySent}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-60"
                          style={
                            alreadySent
                              ? { background: "#F0FDF4", color: "#16a34a" }
                              : { background: "#F06292", color: "white" }
                          }
                        >
                          {sending === p.id ? (
                            "…"
                          ) : alreadySent ? (
                            "✓ Envoyée"
                          ) : (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                              </svg>
                              Envoyer bannière {nextPlan}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} prestataire{filtered.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
