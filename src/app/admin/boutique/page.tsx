"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "commandes" | "stats" | "produits" | "codes_promo";

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

type MonthStat = {
  month: string; // "Jan", "Fév", etc.
  ca: number;
  count: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

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

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function coupleNames(c: Commande) {
  if (!c.maries) return "—";
  return c.maries.prenom_marie2
    ? `${c.maries.prenom_marie1} & ${c.maries.prenom_marie2}`
    : c.maries.prenom_marie1;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "commandes", label: "Commandes" },
    { key: "stats", label: "Stats" },
    { key: "produits", label: "Produits" },
    { key: "codes_promo", label: "Codes promo" },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={
            active === t.key
              ? { background: "#fff", color: "#1a1a1a", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
              : { color: "#6B7280" }
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Onglet Commandes ─────────────────────────────────────────────────────────

function CommandesTab() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);

  const fetchCommandes = useCallback(async () => {
    const { data } = await supabase
      .from("commandes")
      .select(`*, maries (prenom_marie1, prenom_marie2)`)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#F06292", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{commandes.length} commande{commandes.length > 1 ? "s" : ""} au total</p>
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
              <div key={commande.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="grid lg:grid-cols-12 gap-4 items-start">

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

                  <div className="lg:col-span-2">
                    <p className="text-lg font-bold text-gray-900">{commande.montant.toFixed(2)} €</p>
                    <span
                      className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {STATUT_LABELS[statut]}
                    </span>
                  </div>

                  <div className="lg:col-span-4 space-y-3">
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

// ─── Onglet Stats ─────────────────────────────────────────────────────────────

function StatsTab() {
  const [loading, setLoading] = useState(true);
  const [caMois, setCaMois] = useState(0);
  const [nbMois, setNbMois] = useState(0);
  const [months, setMonths] = useState<MonthStat[]>([]);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: moisData } = await supabase
        .from("commandes")
        .select("montant")
        .gte("created_at", debutMois)
        .neq("statut", "annulee");

      const ca = (moisData ?? []).reduce((sum, r) => sum + (r.montant ?? 0), 0);
      setCaMois(ca);
      setNbMois((moisData ?? []).length);

      // 6 derniers mois
      const monthStats: MonthStat[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = d.toISOString();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
        const { data } = await supabase
          .from("commandes")
          .select("montant")
          .gte("created_at", start)
          .lt("created_at", end)
          .neq("statut", "annulee");
        monthStats.push({
          month: MONTH_NAMES[d.getMonth()],
          ca: (data ?? []).reduce((sum, r) => sum + (r.montant ?? 0), 0),
          count: (data ?? []).length,
        });
      }
      setMonths(monthStats);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#F06292", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const panierMoyen = nbMois > 0 ? caMois / nbMois : 0;
  const maxCa = Math.max(...months.map((m) => m.ca), 1);

  return (
    <div className="space-y-8">
      {/* Métriques */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">CA du mois</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{caMois.toFixed(2)} €</p>
          <p className="text-xs text-gray-400 mt-1">Commandes non annulées</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Commandes ce mois</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{nbMois}</p>
          <p className="text-xs text-gray-400 mt-1">Commandes non annulées</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Panier moyen</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{panierMoyen.toFixed(2)} €</p>
          <p className="text-xs text-gray-400 mt-1">CA / nb commandes</p>
        </div>
      </div>

      {/* Graphique 6 mois */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-6">CA — 6 derniers mois</p>
        <div className="flex items-end gap-3 h-40">
          {months.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">{m.ca > 0 ? `${m.ca.toFixed(0)}€` : ""}</span>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${Math.max((m.ca / maxCa) * 120, m.ca > 0 ? 4 : 0)}px`,
                  background: "linear-gradient(180deg, #F06292 0%, #E91E8C 100%)",
                  minHeight: m.ca > 0 ? "4px" : "0",
                }}
              />
              <span className="text-xs text-gray-400">{m.month}</span>
              {m.count > 0 && <span className="text-[10px] text-gray-300">{m.count} cmd</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Produits ──────────────────────────────────────────────────────────

const PRODUITS = [
  { id: "cadre", label: "Cadre QR Code", prix: "39,90€", actif: true },
  { id: "template_digital", label: "Template Digital", prix: "9,90€", actif: true },
  { id: "chevalet", label: "Chevalet QR Code", prix: "19,90€", actif: false },
];

function ProduitsTab() {
  return (
    <div className="space-y-4 max-w-xl">
      {PRODUITS.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{p.prix}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={
                p.actif
                  ? { background: "#D1FAE5", color: "#059669" }
                  : { background: "#F3F4F6", color: "#9CA3AF" }
              }
            >
              {p.actif ? "Actif" : "Bientôt"}
            </span>
            <button
              disabled
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
              title="Bientôt disponible"
            >
              Modifier le prix
            </button>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2 px-1">La modification des prix sera disponible prochainement.</p>
    </div>
  );
}

// ─── Onglet Codes promo ───────────────────────────────────────────────────────

function CodesPromoTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#FFF0F5" }}
      >
        <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
      <p className="text-lg font-semibold text-gray-800">Bientôt disponible</p>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">Gérez vos codes promo Stripe directement depuis le dashboard admin.</p>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminBoutiquePage() {
  const [tab, setTab] = useState<Tab>("commandes");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boutique</h1>
          <p className="text-sm text-gray-400 mt-1">Commandes, statistiques et produits</p>
        </div>
      </div>

      <TabBar active={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === "commandes" && <CommandesTab />}
        {tab === "stats" && <StatsTab />}
        {tab === "produits" && <ProduitsTab />}
        {tab === "codes_promo" && <CodesPromoTab />}
      </div>
    </div>
  );
}
