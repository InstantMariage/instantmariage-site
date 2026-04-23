"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AvisRow = {
  id: string;
  note: number;
  commentaire: string | null;
  approuve: boolean;
  created_at: string;
  prestataires: { id: string; nom_entreprise: string } | null;
};

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

function Stars({ note }: { note: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className="w-3.5 h-3.5"
          fill={n <= note ? "#F59E0B" : "none"}
          stroke={n <= note ? "#F59E0B" : "#D1D5DB"}
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </span>
  );
}

export default function AvisAdminPage() {
  const [avis, setAvis] = useState<AvisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const headers = await authHeader();
    const res = await fetch("/api/admin/avis", { headers });
    if (!res.ok) return;
    setAvis(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleApprouve(id: string, current: boolean) {
    setActionId(id);
    const headers = await authHeader();
    await fetch("/api/admin/avis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ id, approuve: !current }),
    });
    setAvis((prev) =>
      prev.map((a) => (a.id === id ? { ...a, approuve: !current } : a))
    );
    setActionId(null);
  }

  async function deleteAvis(id: string) {
    setActionId(id);
    const headers = await authHeader();
    await fetch("/api/admin/avis", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ id }),
    });
    setAvis((prev) => prev.filter((a) => a.id !== id));
    setActionId(null);
  }

  const filtered = avis.filter(
    (a) =>
      !search ||
      (a.prestataires?.nom_entreprise ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.commentaire ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Avis ({avis.length})</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Modération des avis laissés sur les profils prestataires
          </p>
        </div>
        <input
          type="text"
          placeholder="Rechercher par prestataire ou commentaire…"
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
                Note
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Commentaire
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Statut
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Date
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((a) => {
              const busy = actionId === a.id;
              return (
                <tr key={a.id} className="hover:bg-gray-50/40">
                  <td className="px-5 py-4 whitespace-nowrap">
                    {a.prestataires ? (
                      <Link
                        href={`/prestataires/${a.prestataires.id}`}
                        target="_blank"
                        className="font-medium text-gray-900 hover:text-pink-500 transition-colors"
                      >
                        {a.prestataires.nom_entreprise}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Stars note={a.note} />
                      <span className="text-xs text-gray-500 tabular-nums">{a.note}/5</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-gray-600 line-clamp-2 text-sm">
                      {a.commentaire ?? <span className="text-gray-300 italic">Sans commentaire</span>}
                    </p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {a.approuve ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        Approuvé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleApprouve(a.id, a.approuve)}
                        disabled={busy}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          a.approuve
                            ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {busy ? "…" : a.approuve ? "Retirer" : "Approuver"}
                      </button>
                      <button
                        onClick={() => deleteAvis(a.id)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                      >
                        {busy ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-400">Aucun résultat.</div>
        )}
      </div>
    </div>
  );
}
