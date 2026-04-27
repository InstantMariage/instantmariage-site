"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Statut = "recue" | "en_preparation" | "expediee" | "livree" | "annulee";

type Commande = {
  id: string;
  produit: string;
  template_id: string | null;
  montant: number;
  statut: Statut;
  nom_destinataire: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  telephone: string | null;
  date_mariage: string | null;
  numero_suivi: string | null;
  stripe_session_id: string | null;
  notes: string | null;
  created_at: string;
  maries: {
    prenom_marie1: string;
    prenom_marie2: string | null;
  } | null;
};

type RowState = {
  statut: Statut;
  numeroSuivi: string;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

const STATUT_LABELS: Record<Statut, string> = {
  recue: "Reçue",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

const STATUT_COLORS: Record<Statut, { bg: string; text: string }> = {
  recue: { bg: "#F3F4F6", text: "#6B7280" },
  en_preparation: { bg: "#DBEAFE", text: "#1D4ED8" },
  expediee: { bg: "#FEF3C7", text: "#D97706" },
  livree: { bg: "#D1FAE5", text: "#059669" },
  annulee: { bg: "#FEE2E2", text: "#DC2626" },
};

const PRODUIT_LABELS: Record<string, string> = {
  cadre: "Cadre 39,90€",
  chevalet: "Chevalet 19,90€",
  template_digital: "Template digital",
};

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);

  const fetchCommandes = useCallback(async () => {
    const { data } = await supabase
      .from("commandes")
      .select(`
        *,
        maries (
          prenom_marie1,
          prenom_marie2
        )
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setCommandes(data as Commande[]);
      const states: Record<string, RowState> = {};
      for (const c of data as Commande[]) {
        states[c.id] = {
          statut: c.statut as Statut,
          numeroSuivi: c.numero_suivi ?? "",
          saving: false,
          saved: false,
          error: null,
        };
      }
      setRowStates(states);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCommandes();
    localStorage.setItem("admin_visited_commandes", new Date().toISOString());
  }, [fetchCommandes]);

  function updateRowState(id: string, patch: Partial<RowState>) {
    setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function handleSave(commande: Commande) {
    const state = rowStates[commande.id];
    if (!state || state.saving) return;

    if (state.statut === "expediee" && !state.numeroSuivi.trim()) {
      updateRowState(commande.id, { error: "Numéro de suivi requis pour le statut « Expédiée »" });
      return;
    }

    updateRowState(commande.id, { saving: true, error: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/commandes/${commande.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          statut: state.statut,
          numero_suivi: state.numeroSuivi,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur inconnue");

      updateRowState(commande.id, { saving: false, saved: true, error: null });
      setTimeout(() => updateRowState(commande.id, { saved: false }), 2500);

      // Met à jour la liste locale
      setCommandes((prev) =>
        prev.map((c) =>
          c.id === commande.id
            ? { ...c, statut: state.statut, numero_suivi: state.numeroSuivi }
            : c
        )
      );
    } catch (err) {
      updateRowState(commande.id, {
        saving: false,
        error: err instanceof Error ? err.message : "Erreur",
      });
    }
  }

  function coupleNames(c: Commande) {
    if (!c.maries) return "—";
    return c.maries.prenom_marie2
      ? `${c.maries.prenom_marie1} & ${c.maries.prenom_marie2}`
      : c.maries.prenom_marie1;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#F06292", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-400 mt-1">{commandes.length} commande{commandes.length > 1 ? "s" : ""} au total</p>
        </div>
        <button
          onClick={fetchCommandes}
          className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-xl transition-colors"
        >
          Actualiser
        </button>
      </div>

      {commandes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucune commande pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-4">
          {commandes.map((commande) => {
            const state = rowStates[commande.id];
            if (!state) return null;
            const statut = state.statut;
            const colors = STATUT_COLORS[statut];

            return (
              <div
                key={commande.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="grid lg:grid-cols-12 gap-4 items-start">

                  {/* Couple + produit + date */}
                  <div className="lg:col-span-3">
                    <p className="font-semibold text-gray-900 text-sm">{coupleNames(commande)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {PRODUIT_LABELS[commande.produit] ?? commande.produit}
                    </p>
                    {commande.template_id && (
                      <p className="text-xs text-gray-400 mt-0.5">Template : {commande.template_id}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">{formatDate(commande.created_at)}</p>
                  </div>

                  {/* Adresse */}
                  <div className="lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Livraison</p>
                    <p className="text-sm text-gray-700">{commande.nom_destinataire ?? "—"}</p>
                    {commande.adresse && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {commande.adresse}<br />
                        {commande.code_postal} {commande.ville}
                      </p>
                    )}
                    {commande.telephone && (
                      <p className="text-xs text-gray-400 mt-0.5">{commande.telephone}</p>
                    )}
                    {commande.date_mariage && (
                      <p className="text-xs text-gray-400">Mariage : {commande.date_mariage}</p>
                    )}
                  </div>

                  {/* Montant + badge statut */}
                  <div className="lg:col-span-2">
                    <p className="text-lg font-bold text-gray-900">{commande.montant.toFixed(2)} €</p>
                    <span
                      className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {STATUT_LABELS[statut]}
                    </span>
                  </div>

                  {/* Contrôles */}
                  <div className="lg:col-span-4 space-y-3">
                    {/* Statut dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Changer le statut</label>
                      <select
                        value={state.statut}
                        onChange={(e) => updateRowState(commande.id, { statut: e.target.value as Statut })}
                        className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 bg-white"
                      >
                        {(Object.keys(STATUT_LABELS) as Statut[]).map((s) => (
                          <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Numéro de suivi */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Numéro de suivi</label>
                      <input
                        type="text"
                        value={state.numeroSuivi}
                        onChange={(e) => updateRowState(commande.id, { numeroSuivi: e.target.value })}
                        placeholder="Ex: 2A00123456789"
                        className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 font-mono"
                      />
                    </div>

                    {state.error && (
                      <p className="text-xs text-red-500">{state.error}</p>
                    )}

                    <button
                      onClick={() => handleSave(commande)}
                      disabled={state.saving}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: state.saved ? "#10B981" : "#1a1a1a",
                        color: "#fff",
                      }}
                    >
                      {state.saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enregistrement…
                        </span>
                      ) : state.saved ? (
                        "Enregistré ✓"
                      ) : (
                        "Enregistrer"
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
