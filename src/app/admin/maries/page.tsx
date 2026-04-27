"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type InvitationRow = {
  id: string;
  titre: string | null;
  statut: string;
  cagnotte_active: boolean;
};

type MarieRow = {
  id: string;
  prenom_marie1: string;
  prenom_marie2: string | null;
  date_mariage: string | null;
  lieu_mariage: string | null;
  created_at: string;
  users: { email: string } | null;
  invitations: InvitationRow[];
};

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

export default function MariesAdminPage() {
  const [maries, setMaries] = useState<MarieRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    supabase
      .from("maries")
      .select(
        `id, prenom_marie1, prenom_marie2, date_mariage, lieu_mariage, created_at,
         users!user_id(email),
         invitations!marie_id(id, titre, statut, cagnotte_active)`
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMaries((data as unknown as MarieRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  function handleSort(col: string) {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  }

  const filtered = useMemo(() => {
    const base = maries.filter(
      (m) =>
        !search ||
        m.prenom_marie1.toLowerCase().includes(search.toLowerCase()) ||
        (m.prenom_marie2 ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.users?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.lieu_mariage ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (!sortColumn) return base;
    return [...base].sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "couple":
          cmp = a.prenom_marie1.localeCompare(b.prenom_marie1, "fr");
          break;
        case "email":
          cmp = (a.users?.email ?? "").localeCompare(b.users?.email ?? "", "fr");
          break;
        case "date_mariage": {
          if (!a.date_mariage && !b.date_mariage) { cmp = 0; break; }
          if (!a.date_mariage) return 1;
          if (!b.date_mariage) return -1;
          cmp =
            new Date(a.date_mariage).getTime() -
            new Date(b.date_mariage).getTime();
          break;
        }
        case "faire_parts":
          cmp =
            (a.invitations ?? []).length - (b.invitations ?? []).length;
          break;
        case "cagnotte":
          cmp =
            ((a.invitations ?? []).some((i) => i.cagnotte_active) ? 1 : 0) -
            ((b.invitations ?? []).some((i) => i.cagnotte_active) ? 1 : 0);
          break;
        case "inscription":
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [maries, search, sortColumn, sortDirection]);

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  const thClass =
    "text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-700";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 shrink-0">
          Mariés inscrits ({maries.length})
        </h2>
        <input
          type="text"
          placeholder="Rechercher par nom, email, lieu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th onClick={() => handleSort("couple")} className={thClass}>
                Couple{" "}
                <SortIcon col="couple" sortColumn={sortColumn} sortDirection={sortDirection} />
              </th>
              <th onClick={() => handleSort("email")} className={thClass}>
                Email{" "}
                <SortIcon col="email" sortColumn={sortColumn} sortDirection={sortDirection} />
              </th>
              <th onClick={() => handleSort("date_mariage")} className={thClass}>
                Date de mariage{" "}
                <SortIcon col="date_mariage" sortColumn={sortColumn} sortDirection={sortDirection} />
              </th>
              <th onClick={() => handleSort("faire_parts")} className={thClass}>
                Faire-parts{" "}
                <SortIcon col="faire_parts" sortColumn={sortColumn} sortDirection={sortDirection} />
              </th>
              <th onClick={() => handleSort("cagnotte")} className={thClass}>
                Cagnotte{" "}
                <SortIcon col="cagnotte" sortColumn={sortColumn} sortDirection={sortDirection} />
              </th>
              <th onClick={() => handleSort("inscription")} className={thClass}>
                Inscription{" "}
                <SortIcon col="inscription" sortColumn={sortColumn} sortDirection={sortDirection} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((m) => {
              const invitations = m.invitations ?? [];
              const nbTotal = invitations.length;
              const nbPublies = invitations.filter(
                (i) => i.statut === "publie"
              ).length;
              const hasCagnotte = invitations.some((i) => i.cagnotte_active);
              return (
                <tr key={m.id} className="hover:bg-gray-50/40">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {m.prenom_marie1}
                      {m.prenom_marie2 ? ` & ${m.prenom_marie2}` : ""}
                    </p>
                    {m.lieu_mariage && (
                      <p className="text-xs text-gray-400">{m.lieu_mariage}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {m.users?.email ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {m.date_mariage ? (
                      new Date(m.date_mariage).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {nbTotal === 0 ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <div>
                        <p className="text-gray-700">
                          {nbTotal} faire-part{nbTotal > 1 ? "s" : ""}
                        </p>
                        {nbPublies > 0 && (
                          <p className="text-xs text-emerald-600">
                            {nbPublies} publié{nbPublies > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {hasCagnotte ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium"
                        style={{ color: "#F06292" }}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Active
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString("fr-FR")}
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
