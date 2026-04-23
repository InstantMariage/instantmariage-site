"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type BlacklistRow = {
  id: string;
  type: "email" | "domaine_email" | "telephone" | "ip";
  valeur: string;
  raison: string;
  actif: boolean;
  created_at: string;
  created_by_email: string | null;
};

type FilterType = "tous" | "email" | "domaine_email" | "telephone" | "ip";

const TYPE_LABELS: Record<BlacklistRow["type"], string> = {
  email: "Email",
  domaine_email: "Domaine",
  telephone: "Téléphone",
  ip: "IP",
};

const TYPE_COLORS: Record<BlacklistRow["type"], string> = {
  email: "bg-blue-50 text-blue-700 border-blue-200",
  domaine_email: "bg-purple-50 text-purple-700 border-purple-200",
  telephone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ip: "bg-orange-50 text-orange-700 border-orange-200",
};

const TYPE_PLACEHOLDERS: Record<BlacklistRow["type"], string> = {
  email: "exemple@gmail.com",
  domaine_email: "@gmail.com",
  telephone: "+33 6 12 34 56 78",
  ip: "192.168.1.1",
};

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "email", label: "Email" },
  { value: "domaine_email", label: "Domaine" },
  { value: "telephone", label: "Téléphone" },
  { value: "ip", label: "IP" },
];

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export default function BlacklistAdminPage() {
  const [rows, setRows] = useState<BlacklistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("tous");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    type: BlacklistRow["type"];
    valeur: string;
    raison: string;
  }>({ type: "email", valeur: "", raison: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const headers = await authHeader();
    const res = await fetch("/api/admin/blacklist", { headers });
    if (!res.ok) return;
    setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => {
    if (filter !== "tous" && r.type !== filter) return false;
    if (search.trim() && !r.valeur.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  async function toggleActif(row: BlacklistRow) {
    setTogglingId(row.id);
    const headers = await authHeader();
    await fetch(`/api/admin/blacklist/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ actif: !row.actif }),
    });
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, actif: !r.actif } : r))
    );
    setTogglingId(null);
  }

  async function deleteRow(id: string) {
    setDeletingId(id);
    const headers = await authHeader();
    await fetch(`/api/admin/blacklist/${id}`, {
      method: "DELETE",
      headers,
    });
    setRows((prev) => prev.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
    setDeletingId(null);
  }

  async function handleAdd() {
    setFormError(null);
    if (!form.valeur.trim()) { setFormError("La valeur est requise."); return; }
    if (!form.raison.trim()) { setFormError("La raison est requise."); return; }
    setSubmitting(true);
    const headers = await authHeader();
    const res = await fetch("/api/admin/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error ?? "Erreur lors de l'ajout.");
      setSubmitting(false);
      return;
    }
    setShowModal(false);
    setForm({ type: "email", valeur: "", raison: "" });
    setSubmitting(false);
    load();
  }

  const totalActifs = rows.filter((r) => r.actif).length;

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Blacklist
            <span className="ml-2 text-base font-normal text-gray-400">
              {rows.length} entrée{rows.length !== 1 ? "s" : ""}
            </span>
            <span className="ml-2 text-base font-normal text-emerald-600">
              · {totalActifs} actif{totalActifs !== 1 ? "s" : ""}
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Emails, domaines, téléphones et IP bloqués à l'inscription
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(null); }}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: "#F06292" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Filtres + recherche */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.value !== "tous" && (
                <span className="ml-1.5 text-gray-400">
                  {rows.filter((r) => r.type === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher par valeur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          {rows.length === 0 ? "Aucune entrée dans la blacklist." : "Aucun résultat pour ces filtres."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valeur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Raison</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ajouté le</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Par</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((row) => (
                <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${!row.actif ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${TYPE_COLORS[row.type]}`}>
                      {TYPE_LABELS[row.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800 max-w-[200px] truncate">
                    {row.valeur}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[240px]">
                    <span className="line-clamp-2">{row.raison}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px] truncate">
                    {row.created_by_email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActif(row)}
                      disabled={togglingId === row.id}
                      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
                      style={{ background: row.actif ? "#F06292" : "#D1D5DB" }}
                      title={row.actif ? "Désactiver" : "Activer"}
                    >
                      <span
                        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                        style={{ transform: row.actif ? "translateX(16px)" : "translateX(0)" }}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === row.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-gray-500">Confirmer ?</span>
                        <button
                          onClick={() => deleteRow(row.id)}
                          disabled={deletingId === row.id}
                          className="text-xs px-2 py-1 rounded-md font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingId === row.id ? "…" : "Oui"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs px-2 py-1 rounded-md font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(row.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ajout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Ajouter à la blacklist</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BlacklistRow["type"], valeur: "" }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
                >
                  <option value="email">Email</option>
                  <option value="domaine_email">Domaine email</option>
                  <option value="telephone">Téléphone</option>
                  <option value="ip">Adresse IP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Valeur</label>
                <input
                  type="text"
                  value={form.valeur}
                  onChange={(e) => setForm((f) => ({ ...f, valeur: e.target.value }))}
                  placeholder={TYPE_PLACEHOLDERS[form.type]}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Raison <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.raison}
                  onChange={(e) => setForm((f) => ({ ...f, raison: e.target.value }))}
                  placeholder="Ex : Spam détecté, inscription frauduleuse…"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: "#F06292" }}
              >
                {submitting ? "Ajout…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
