"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type ContributionRow = {
  id: string;
  contributeur_nom: string;
  contributeur_email: string;
  montant_cents: number;
  message: string | null;
  created_at: string;
};

type CagnotteRow = {
  id: string;
  cagnotte_titre: string | null;
  cagnotte_iban: string | null;
  virement_statut: string;
  virement_date: string | null;
  created_at: string;
  maries: {
    prenom_marie1: string;
    prenom_marie2: string | null;
    date_mariage: string | null;
  } | null;
  cagnotte_contributions: {
    montant_cents: number;
    statut: string;
  }[];
};

const VIREMENT_ORDER: Record<string, number> = {
  vire: 2,
  demande: 1,
};

function formatEur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function VirementBadge({ statut }: { statut: string }) {
  if (statut === "vire")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        Viré
      </span>
    );
  if (statut === "demande")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Demandé
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      Non demandé
    </span>
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

function totalPaye(c: CagnotteRow): number {
  return (c.cagnotte_contributions ?? [])
    .filter((x) => x.statut === "paye")
    .reduce((sum, x) => sum + x.montant_cents, 0);
}

export default function CagnottesAdminPage() {
  const [cagnottes, setCagnottes] = useState<CagnotteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [loadingContribs, setLoadingContribs] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadCagnottes();
  }, []);

  async function loadCagnottes() {
    const { data } = await supabase
      .from("invitations")
      .select(
        `id, cagnotte_titre, cagnotte_iban, virement_statut, virement_date, created_at,
         maries!marie_id(prenom_marie1, prenom_marie2, date_mariage),
         cagnotte_contributions!invitation_id(montant_cents, statut)`
      )
      .eq("cagnotte_active", true)
      .order("created_at", { ascending: false });
    setCagnottes((data as unknown as CagnotteRow[]) ?? []);
    setLoading(false);
  }

  async function marquerVire(id: string) {
    setUpdating(id);
    await supabase
      .from("invitations")
      .update({
        virement_statut: "vire",
        virement_date: new Date().toISOString(),
      })
      .eq("id", id);
    setCagnottes((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              virement_statut: "vire",
              virement_date: new Date().toISOString(),
            }
          : c
      )
    );
    setUpdating(null);
  }

  async function openContributions(id: string) {
    setSelectedId(id);
    setLoadingContribs(true);
    const { data } = await supabase
      .from("cagnotte_contributions")
      .select(
        "id, contributeur_nom, contributeur_email, montant_cents, message, created_at"
      )
      .eq("invitation_id", id)
      .eq("statut", "paye")
      .order("created_at", { ascending: false });
    setContributions((data as ContributionRow[]) ?? []);
    setLoadingContribs(false);
  }

  function handleSort(col: string) {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortColumn) return cagnottes;
    return [...cagnottes].sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "mariage":
          cmp = (a.maries?.prenom_marie1 ?? "").localeCompare(
            b.maries?.prenom_marie1 ?? "",
            "fr"
          );
          break;
        case "titre":
          cmp = (a.cagnotte_titre ?? "").localeCompare(
            b.cagnotte_titre ?? "",
            "fr"
          );
          break;
        case "collecte":
          cmp = totalPaye(a) - totalPaye(b);
          break;
        case "iban":
          cmp = (a.cagnotte_iban ? 1 : 0) - (b.cagnotte_iban ? 1 : 0);
          break;
        case "virement":
          cmp =
            (VIREMENT_ORDER[a.virement_statut] ?? 0) -
            (VIREMENT_ORDER[b.virement_statut] ?? 0);
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [cagnottes, sortColumn, sortDirection]);

  const selectedRow = cagnottes.find((c) => c.id === selectedId);
  const totalContribs = contributions.reduce(
    (sum, c) => sum + c.montant_cents,
    0
  );

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  const thClass =
    "text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-700";

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Cagnottes mariage ({cagnottes.length})
      </h2>

      {cagnottes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Aucune cagnotte active pour le moment.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th onClick={() => handleSort("mariage")} className={thClass}>
                  Mariage{" "}
                  <SortIcon col="mariage" sortColumn={sortColumn} sortDirection={sortDirection} />
                </th>
                <th onClick={() => handleSort("titre")} className={thClass}>
                  Titre{" "}
                  <SortIcon col="titre" sortColumn={sortColumn} sortDirection={sortDirection} />
                </th>
                <th onClick={() => handleSort("collecte")} className={thClass}>
                  Collecté{" "}
                  <SortIcon col="collecte" sortColumn={sortColumn} sortDirection={sortDirection} />
                </th>
                <th onClick={() => handleSort("iban")} className={thClass}>
                  IBAN{" "}
                  <SortIcon col="iban" sortColumn={sortColumn} sortDirection={sortDirection} />
                </th>
                <th onClick={() => handleSort("virement")} className={thClass}>
                  Virement{" "}
                  <SortIcon col="virement" sortColumn={sortColumn} sortDirection={sortDirection} />
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((c) => {
                const total = totalPaye(c);
                return (
                  <tr key={c.id} className="hover:bg-gray-50/40">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {c.maries?.prenom_marie1 ?? "—"}
                        {c.maries?.prenom_marie2
                          ? ` & ${c.maries.prenom_marie2}`
                          : ""}
                      </p>
                      {c.maries?.date_mariage && (
                        <p className="text-xs text-gray-400">
                          {new Date(c.maries.date_mariage).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.cagnotte_titre ?? (
                        <span className="text-gray-400 italic">Sans titre</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-600 tabular-nums">
                      {formatEur(total)}
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      {c.cagnotte_iban ? (
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-xs text-gray-500 break-all">
                            {c.cagnotte_iban}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(c.cagnotte_iban!);
                              setCopiedId(c.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copier l'IBAN"
                          >
                            {copiedId === c.id ? (
                              <span className="text-xs text-emerald-500 font-medium whitespace-nowrap">
                                ✓ Copié
                              </span>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <VirementBadge statut={c.virement_statut} />
                      {c.virement_date && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(c.virement_date).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openContributions(c.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors whitespace-nowrap"
                        >
                          Voir contributions
                        </button>
                        {c.virement_statut !== "vire" && total > 0 && (
                          <button
                            onClick={() => marquerVire(c.id)}
                            disabled={updating === c.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {updating === c.id ? "…" : "Marquer viré"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">
                  Contributions détaillées
                </h3>
                {selectedRow && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedRow.maries?.prenom_marie1}
                    {selectedRow.maries?.prenom_marie2
                      ? ` & ${selectedRow.maries.prenom_marie2}`
                      : ""}{" "}
                    — {selectedRow.cagnotte_titre ?? "Cagnotte"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-gray-400 hover:text-gray-600 mt-0.5"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingContribs ? (
                <div className="p-8 text-sm text-gray-400 text-center">
                  Chargement…
                </div>
              ) : contributions.length === 0 ? (
                <div className="p-8 text-sm text-gray-400 text-center">
                  Aucune contribution payée.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Contributeur
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Email
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Montant
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Message
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {contributions.map((contrib) => (
                      <tr key={contrib.id} className="hover:bg-gray-50/40">
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {contrib.contributeur_nom}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {contrib.contributeur_email}
                        </td>
                        <td className="px-5 py-3 font-semibold text-emerald-600 tabular-nums">
                          {formatEur(contrib.montant_cents)}
                        </td>
                        <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">
                          {contrib.message ?? (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(contrib.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {contributions.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Total payé</span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  {formatEur(totalContribs)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
