"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Reportage = {
  id: string;
  statut: string;
  date_reportage: string | null;
  lien_video: string | null;
  lien_article: string | null;
  notes: string | null;
  updated_at: string;
};

type Prestataire = {
  id: string;
  nom_entreprise: string;
  metier: string;
  ville: string;
  plan: string;
  diamond_expire_at: string | null;
  created_at: string;
  users: { email: string } | null;
  diamond_reportages: Reportage[];
};

type SearchResult = {
  id: string;
  nom_entreprise: string;
  metier: string;
  ville: string;
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  planifie: "Planifié",
  filme: "Filmé",
  monte: "Monté",
  livre: "Livré",
};

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  en_attente: { bg: "#FEF3C7", text: "#D97706" },
  planifie: { bg: "#DBEAFE", text: "#2563EB" },
  filme: { bg: "#EDE9FE", text: "#7C3AED" },
  monte: { bg: "#FEE2E2", text: "#DC2626" },
  livre: { bg: "#D1FAE5", text: "#059669" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpirationBadge({ expireAt }: { expireAt: string | null }) {
  const days = daysUntil(expireAt);
  if (days === null) return <span className="text-gray-400 text-xs">—</span>;
  if (days < 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
      Expiré
    </span>
  );
  const bg = days > 60 ? "#D1FAE5" : days > 30 ? "#FEF3C7" : "#FEE2E2";
  const text = days > 60 ? "#059669" : days > 30 ? "#D97706" : "#DC2626";
  return (
    <div>
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: bg, color: text }}
      >
        {formatDate(expireAt)}
      </span>
      <p className="text-[11px] mt-0.5" style={{ color: text }}>
        J{days >= 0 ? "-" : "+"}{Math.abs(days)}
      </p>
    </div>
  );
}

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export default function DiamondAdminPage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const [relanceSending, setRelanceSending] = useState(false);
  const [relanceFeedback, setRelanceFeedback] = useState<string | null>(null);

  // Modal reportage
  const [modalPresta, setModalPresta] = useState<Prestataire | null>(null);
  const [reportageForm, setReportageForm] = useState({
    statut: "en_attente",
    date_reportage: "",
    lien_video: "",
    lien_article: "",
    notes: "",
  });
  const [savingReportage, setSavingReportage] = useState(false);

  // Activation manuelle
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPresta, setSelectedPresta] = useState<SearchResult | null>(null);
  const [activating, setActivating] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    const res = await fetch("/api/admin/diamond/prestataires", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setPrestataires(json.prestataires ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showFeedback = (id: string, msg: string, ok: boolean) => {
    setFeedback({ id, msg, ok });
    setTimeout(() => setFeedback(null), 3500);
  };

  async function activer(id: string) {
    if (!confirm("Activer le Pack Diamond pour 12 mois ?")) return;
    setActing(id + "-activer");
    const token = await getToken();
    const res = await fetch(`/api/admin/diamond/${id}/activer`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setActing(null);
    if (json.ok) {
      await load();
      showFeedback(id, "Diamond activé !", true);
    } else {
      showFeedback(id, json.error ?? "Erreur", false);
    }
  }

  async function revoquer(id: string) {
    if (!confirm("Révoquer le Pack Diamond ? Le prestataire passera en plan gratuit.")) return;
    setActing(id + "-revoquer");
    const token = await getToken();
    const res = await fetch(`/api/admin/diamond/${id}/revoquer`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setActing(null);
    if (json.ok) {
      await load();
      showFeedback(id, "Révoqué.", true);
    } else {
      showFeedback(id, json.error ?? "Erreur", false);
    }
  }

  function openModal(p: Prestataire) {
    const r = p.diamond_reportages[0];
    setReportageForm({
      statut: r?.statut ?? "en_attente",
      date_reportage: r?.date_reportage ?? "",
      lien_video: r?.lien_video ?? "",
      lien_article: r?.lien_article ?? "",
      notes: r?.notes ?? "",
    });
    setModalPresta(p);
  }

  async function saveReportage() {
    if (!modalPresta) return;
    setSavingReportage(true);
    const token = await getToken();
    const res = await fetch(`/api/admin/diamond/${modalPresta.id}/reportage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportageForm),
    });
    const json = await res.json();
    setSavingReportage(false);
    if (json.ok) {
      await load();
      setModalPresta(null);
    }
  }

  async function sendRelance() {
    if (!confirm("Envoyer un email de relance à tous les Diamond qui expirent dans 30 jours ?")) return;
    setRelanceSending(true);
    const token = await getToken();
    const res = await fetch("/api/admin/diamond/relance", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setRelanceSending(false);
    setRelanceFeedback(json.ok ? `${json.sent} email(s) envoyé(s)` : json.error ?? "Erreur");
    setTimeout(() => setRelanceFeedback(null), 5000);
  }

  async function searchPrestataires(q: string) {
    setSearchQuery(q);
    setSelectedPresta(null);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("prestataires")
      .select("id, nom_entreprise, metier, ville")
      .ilike("nom_entreprise", `%${q}%`)
      .neq("plan", "diamond")
      .limit(8);
    setSearchResults(data ?? []);
  }

  async function activerManuellement() {
    if (!selectedPresta) return;
    setActivating(true);
    const token = await getToken();
    const res = await fetch(`/api/admin/diamond/${selectedPresta.id}/activer`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setActivating(false);
    if (json.ok) {
      await load();
      setSearchQuery("");
      setSearchResults([]);
      setSelectedPresta(null);
    }
  }

  const expirantBientot = prestataires.filter((p) => {
    const d = daysUntil(p.diamond_expire_at);
    return d !== null && d >= 0 && d <= 30;
  });

  const reportagesEnAttente = prestataires.filter((p) => {
    const r = p.diamond_reportages[0];
    if (!r || r.statut !== "en_attente") return false;
    const age = Date.now() - new Date(r.updated_at).getTime();
    return age > 7 * 24 * 60 * 60 * 1000;
  });

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  const thClass = "text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pack Diamond 💎</h2>
        <p className="text-sm text-gray-500 mt-0.5">Gestion des prestataires et reportages</p>
      </div>

      {/* Alertes */}
      {expirantBientot.length > 0 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm font-medium text-red-700">
              {expirantBientot.length} prestataire{expirantBientot.length > 1 ? "s expirent" : " expire"} dans moins de 30 jours
            </p>
          </div>
          <div className="flex items-center gap-3">
            {relanceFeedback && (
              <span className="text-xs font-medium text-red-600">{relanceFeedback}</span>
            )}
            <button
              onClick={sendRelance}
              disabled={relanceSending}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {relanceSending ? "Envoi…" : "Envoyer email de relance"}
            </button>
          </div>
        </div>
      )}

      {reportagesEnAttente.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
          <span className="text-amber-500">📹</span>
          <p className="text-sm font-medium text-amber-700">
            {reportagesEnAttente.length} reportage{reportagesEnAttente.length > 1 ? "s" : ""} en attente depuis plus de 7 jours
          </p>
        </div>
      )}

      {/* Liste prestataires Diamond */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Prestataires Diamond ({prestataires.length})
        </h3>
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={thClass}>Prestataire</th>
                <th className={thClass}>Activation</th>
                <th className={thClass}>Expiration</th>
                <th className={thClass}>Reportage</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prestataires.map((p) => {
                const reportage = p.diamond_reportages[0];
                const isFeedback = feedback?.id === p.id;
                const statutStyle = STATUT_COLORS[reportage?.statut ?? "en_attente"];
                return (
                  <tr key={p.id} className="hover:bg-gray-50/40">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{p.nom_entreprise}</p>
                      <p className="text-xs text-gray-400">
                        {p.metier} · {p.ville}
                      </p>
                      <p className="text-xs text-gray-300">{p.users?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <ExpirationBadge expireAt={p.diamond_expire_at} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: statutStyle.bg, color: statutStyle.text }}
                      >
                        {STATUT_LABELS[reportage?.statut ?? "en_attente"]}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isFeedback ? (
                        <span
                          className="text-xs font-medium"
                          style={{ color: feedback.ok ? "#10B981" : "#EF4444" }}
                        >
                          {feedback.msg}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 justify-end flex-wrap">
                          <button
                            onClick={() => openModal(p)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 font-medium transition-colors whitespace-nowrap"
                          >
                            Gérer reportage
                          </button>
                          <button
                            onClick={() => activer(p.id)}
                            disabled={acting === p.id + "-activer"}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            style={{ background: "#FFF8E1", color: "#B8860B" }}
                          >
                            {acting === p.id + "-activer" ? "…" : "Renouveler 12 mois"}
                          </button>
                          <button
                            onClick={() => revoquer(p.id)}
                            disabled={acting === p.id + "-revoquer"}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {acting === p.id + "-revoquer" ? "…" : "Révoquer"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {prestataires.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-400">
              Aucun prestataire Diamond pour l'instant.
            </div>
          )}
        </div>
      </div>

      {/* Activation manuelle */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Activer Diamond manuellement 💎
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Pour un paiement par virement ou hors Stripe.
        </p>
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => searchPrestataires(e.target.value)}
              placeholder="Rechercher un prestataire par nom…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            {searchResults.length > 0 && !selectedPresta && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedPresta(r);
                      setSearchQuery(r.nom_entreprise);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-gray-900">{r.nom_entreprise}</span>
                    <span className="text-xs text-gray-400 ml-2">{r.metier} · {r.ville}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={activerManuellement}
            disabled={!selectedPresta || activating}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
            style={
              selectedPresta
                ? { background: "#B8860B", color: "#fff" }
                : { background: "#F3F4F6", color: "#9CA3AF" }
            }
          >
            {activating ? "Activation…" : "Activer Diamond 12 mois"}
          </button>
        </div>
        {selectedPresta && (
          <p className="mt-2 text-xs text-gray-500">
            Sélectionné : <strong>{selectedPresta.nom_entreprise}</strong> — {selectedPresta.metier}, {selectedPresta.ville}
          </p>
        )}
      </div>

      {/* Modal reportage */}
      {modalPresta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Reportage — {modalPresta.nom_entreprise}</h3>
                <p className="text-xs text-gray-400">{modalPresta.metier} · {modalPresta.ville}</p>
              </div>
              <button
                onClick={() => setModalPresta(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Statut</label>
                <select
                  value={reportageForm.statut}
                  onChange={(e) => setReportageForm((f) => ({ ...f, statut: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  {Object.entries(STATUT_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date du reportage</label>
                <input
                  type="date"
                  value={reportageForm.date_reportage}
                  onChange={(e) => setReportageForm((f) => ({ ...f, date_reportage: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Lien vidéo</label>
                <input
                  type="url"
                  value={reportageForm.lien_video}
                  onChange={(e) => setReportageForm((f) => ({ ...f, lien_video: e.target.value }))}
                  placeholder="https://…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Lien article de blog</label>
                <input
                  type="url"
                  value={reportageForm.lien_article}
                  onChange={(e) => setReportageForm((f) => ({ ...f, lien_article: e.target.value }))}
                  placeholder="https://…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes internes</label>
                <textarea
                  value={reportageForm.notes}
                  onChange={(e) => setReportageForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Notes, remarques…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setModalPresta(null)}
                className="text-sm px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveReportage}
                disabled={savingReportage}
                className="text-sm px-5 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "#B8860B" }}
              >
                {savingReportage ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
