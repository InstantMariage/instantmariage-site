"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type EliteSite = {
  id: string;
  prestataire_id: string;
  domaine: string;
  statut: string;
  type_activite: string | null;
  nom_professionnel: string | null;
  description_activite: string | null;
  ville_principale: string | null;
  telephone: string | null;
  email_contact: string | null;
  site_actuel: string | null;
  template: string | null;
  couleur_principale: string;
  couleur_secondaire: string;
  logo_url: string | null;
  photos_urls: string[];
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  pinterest: string | null;
  cgv_accepte: boolean;
  created_at: string;
  plan?: string | null;
};

const STATUS_CONFIG: Record<string, {
  label: string; bg: string; text: string; next?: string; nextLabel?: string;
}> = {
  en_attente: { label: "En attente", bg: "#FFF7ED", text: "#EA580C", next: "en_cours",  nextLabel: "Démarrer →" },
  en_cours:   { label: "En cours",   bg: "#EFF6FF", text: "#2563EB", next: "en_ligne",  nextLabel: "Mettre en ligne →" },
  en_ligne:   { label: "En ligne",   bg: "#F0FDF4", text: "#16A34A" },
};

export default function AdminElitePage() {
  const [sites, setSites]           = useState<EliteSite[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<EliteSite | null>(null);

  useEffect(() => { fetchSites(); }, []);

  const fetchSites = async () => {
    setLoading(true);
    const { data: sitesData } = await supabase
      .from("elite_sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (!sitesData) { setLoading(false); return; }

    const ids = sitesData.map(s => s.prestataire_id);
    const { data: abos } = await supabase
      .from("abonnements")
      .select("prestataire_id, plan")
      .in("prestataire_id", ids)
      .eq("statut", "actif");

    const planMap = new Map(abos?.map(a => [a.prestataire_id, a.plan]) ?? []);
    setSites(sitesData.map(s => ({ ...s, plan: planMap.get(s.prestataire_id) ?? null })));
    setLoading(false);
  };

  const handleStatusChange = async (site: EliteSite) => {
    const sc = STATUS_CONFIG[site.statut];
    if (!sc?.next) return;
    setUpdating(site.id);
    const { error } = await supabase
      .from("elite_sites")
      .update({ statut: sc.next, updated_at: new Date().toISOString() })
      .eq("id", site.id);
    if (!error) {
      const next = sc.next;
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, statut: next } : s));
      setSelectedSite(prev => prev?.id === site.id ? { ...prev, statut: next } : prev);
    }
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites Elite 👑</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sites.length} demande{sites.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchSites}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>

      {sites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">👑</div>
          <p className="text-gray-500">Aucune demande Elite pour l&apos;instant</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {[
                    "Nom professionnel", "Domaine", "Plan", "Activité",
                    "Téléphone", "Email", "Template", "Statut", "Date", "Actions",
                  ].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sites.map(site => {
                  const sc = STATUS_CONFIG[site.statut] ?? { label: site.statut, bg: "#F3F4F6", text: "#6B7280" };
                  return (
                    <tr key={site.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {site.nom_professionnel ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap max-w-[150px] truncate" title={site.domaine}>
                        {site.domaine}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {site.plan ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#F3E8FF", color: "#7C3AED" }}>
                            {site.plan}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap capitalize">
                        {site.type_activite ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {site.telephone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap max-w-[160px] truncate" title={site.email_contact ?? ""}>
                        {site.email_contact ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap capitalize">
                        {site.template?.replace(/-/g, " ") ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(site.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {sc.next && (
                            <button
                              onClick={() => handleStatusChange(site)}
                              disabled={updating === site.id}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-700"
                            >
                              {updating === site.id ? "..." : sc.nextLabel}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedSite(site)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            Voir les détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal détails ──────────────────────────────────────────────────────── */}
      {selectedSite && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSite(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedSite.nom_professionnel ?? "Site Elite"}
                </h2>
                <p className="text-sm text-gray-400">{selectedSite.domaine}</p>
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Status + plan + date */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const sc = STATUS_CONFIG[selectedSite.statut] ?? { label: selectedSite.statut, bg: "#F3F4F6", text: "#6B7280" };
                  return (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                  );
                })()}
                {selectedSite.plan && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "#F3E8FF", color: "#7C3AED" }}>
                    {selectedSite.plan}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-1">
                  Soumis le {new Date(selectedSite.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "Type d'activité",  value: selectedSite.type_activite },
                  { label: "Ville principale",  value: selectedSite.ville_principale },
                  { label: "Téléphone",         value: selectedSite.telephone },
                  { label: "Email de contact",  value: selectedSite.email_contact },
                  { label: "Site web actuel",   value: selectedSite.site_actuel },
                  { label: "Template",          value: selectedSite.template?.replace(/-/g, " ") },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                    {value?.startsWith("http") ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline break-all">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-900">{value ?? "—"}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Couleurs */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Couleurs</p>
                <div className="flex items-center gap-4">
                  {[
                    { label: "Principale",  color: selectedSite.couleur_principale },
                    { label: "Secondaire",  color: selectedSite.couleur_secondaire },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: color }} />
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-xs font-mono text-gray-700">{color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {selectedSite.description_activite && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSite.description_activite}</p>
                </div>
              )}

              {/* Réseaux sociaux */}
              {[selectedSite.instagram, selectedSite.facebook, selectedSite.tiktok, selectedSite.pinterest].some(Boolean) && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Réseaux sociaux</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Instagram", value: selectedSite.instagram },
                      { label: "Facebook",  value: selectedSite.facebook },
                      { label: "TikTok",    value: selectedSite.tiktok },
                      { label: "Pinterest", value: selectedSite.pinterest },
                    ].filter(s => s.value).map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-16 shrink-0">{label}</span>
                        <a href={value!} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:underline truncate">
                          {value}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo */}
              {selectedSite.logo_url && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Logo</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedSite.logo_url}
                    alt="Logo"
                    className="h-16 w-auto object-contain rounded-xl border border-gray-100 p-2 bg-gray-50"
                  />
                </div>
              )}

              {/* Photos */}
              {selectedSite.photos_urls?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Photos ({selectedSite.photos_urls.length})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedSite.photos_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="aspect-square w-full object-cover rounded-xl hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action statut */}
              {(() => {
                const sc = STATUS_CONFIG[selectedSite.statut];
                return sc?.next ? (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusChange(selectedSite)}
                      disabled={updating === selectedSite.id}
                      className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #7C3AED, #F06292)" }}
                    >
                      {updating === selectedSite.id ? "Mise à jour..." : sc.nextLabel}
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
