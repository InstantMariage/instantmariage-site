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

const DEFAULT_SUJET =
  "Votre site pro mariage en 72h — Pack Elite InstantMariage";

const DEFAULT_CORPS = `Bonjour [nom_entreprise],

Nous avons une nouveauté exclusive pour vous sur InstantMariage.fr !

🚀 Lancez votre site professionnel en 72h avec le Pack Elite :
✅ Site web sur mesure créé par notre équipe
✅ Nom de domaine personnalisé inclus
✅ Maintenance & mises à jour incluses
✅ Visibilité renforcée sur InstantMariage
✅ À partir de 149€/mois seulement

👉 Découvrez nos réalisations et réservez votre domaine :
https://www.instantmariage.fr/elite

L'équipe InstantMariage.fr`;

type PrestataireStat = {
  id: string;
  nom_entreprise: string;
  user_id: string;
  email: string;
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

  // Sélection pour envoi email Elite
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal email Elite
  const [showModal, setShowModal] = useState(false);
  const [modalSujet, setModalSujet] = useState(DEFAULT_SUJET);
  const [modalCorps, setModalCorps] = useState(DEFAULT_CORPS);
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{
    sent: number;
    errors: number;
  } | null>(null);

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

  // Vider la sélection au changement de filtre
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));

  function handleToggleAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  function handleToggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedPrestataires = useMemo(
    () => prestataires.filter((p) => selectedIds.has(p.id)),
    [prestataires, selectedIds]
  );

  async function handleSendEliteEmail() {
    if (emailSending || selectedPrestataires.length === 0) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/send-elite-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prestataires: selectedPrestataires.map((p) => ({
            id: p.id,
            email: p.email,
            nom_entreprise: p.nom_entreprise,
          })),
          sujet: modalSujet,
          corps: modalCorps,
        }),
      });
      const json = await res.json();
      setEmailResult({ sent: json.sent ?? 0, errors: json.errors ?? 0 });
    } finally {
      setEmailSending(false);
    }
  }

  function openModal() {
    setEmailResult(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEmailResult(null);
  }

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

      {/* Barre de sélection */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 mb-4 px-4 py-3 rounded-xl border"
          style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
        >
          <span className="text-sm font-medium" style={{ color: "#6D28D9" }}>
            {selectedIds.size} prestataire{selectedIds.size > 1 ? "s" : ""}{" "}
            sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150"
            style={{ background: "#7C3AED" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Envoyer l&apos;offre Elite par email
          </button>
        </div>
      )}

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
                  <th className="pl-5 pr-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={handleToggleAll}
                      title="Tout sélectionner"
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-violet-600"
                    />
                  </th>
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
                    className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5 min-w-[160px] cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
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
                      colSpan={8}
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
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={isSelected ? { background: "#F5F3FF" } : undefined}
                    >
                      <td className="pl-5 pr-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleOne(p.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-violet-600"
                        />
                      </td>
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

      {/* Modal envoi email Elite */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Envoyer l&apos;offre Elite par email
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedIds.size} prestataire{selectedIds.size > 1 ? "s" : ""}{" "}
                sélectionné{selectedIds.size > 1 ? "s" : ""}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Sujet
                </label>
                <input
                  type="text"
                  value={modalSujet}
                  onChange={(e) => setModalSujet(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-violet-400"
                  style={{ "--tw-ring-color": "#DDD6FE" } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Corps de l&apos;email{" "}
                  <span className="font-normal text-gray-400">
                    — utilisez [nom_entreprise] pour personnaliser
                  </span>
                </label>
                <textarea
                  value={modalCorps}
                  onChange={(e) => setModalCorps(e.target.value)}
                  rows={14}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:border-violet-400 resize-y"
                  style={{ "--tw-ring-color": "#DDD6FE" } as React.CSSProperties}
                />
              </div>

              {emailResult && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={
                    emailResult.errors === 0
                      ? { background: "#F0FDF4", color: "#16a34a" }
                      : { background: "#FFF7ED", color: "#C2410C" }
                  }
                >
                  {emailResult.sent > 0 && (
                    <span>
                      ✓ {emailResult.sent} email
                      {emailResult.sent > 1 ? "s" : ""} envoyé
                      {emailResult.sent > 1 ? "s" : ""}
                    </span>
                  )}
                  {emailResult.errors > 0 && (
                    <span className="ml-2">
                      — {emailResult.errors} erreur
                      {emailResult.errors > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleSendEliteEmail}
                disabled={
                  emailSending ||
                  !modalSujet.trim() ||
                  !modalCorps.trim() ||
                  !!emailResult
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60"
                style={{ background: "#7C3AED" }}
              >
                {emailSending ? (
                  "Envoi en cours…"
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Envoyer à {selectedIds.size} prestataire
                    {selectedIds.size > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
