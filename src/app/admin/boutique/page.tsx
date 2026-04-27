"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
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

type PromoCode = {
  id: string;
  code: string;
  coupon: {
    percent_off: number | null;
    amount_off: number | null;
    currency: string | null;
    name: string | null;
  };
  expires_at: number | null;
  times_redeemed: number;
};

type PromoForm = {
  code: string;
  reduction: string;
  type: "percent" | "fixed";
  expiresAt: string;
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
  { id: "cadre", label: "Cadre QR Code", actif: true },
  { id: "template_digital", label: "Template Digital", actif: true },
  { id: "chevalet", label: "Chevalet QR Code", actif: false },
];

function ProduitsTab() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingProduit, setSavingProduit] = useState<string | null>(null);
  const [savedProduit, setSavedProduit] = useState<string | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/boutique/prix", {
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      });
      const json = await res.json();
      if (json.data) {
        const map: Record<string, number> = {};
        for (const row of json.data) map[row.produit] = row.prix;
        setPrices(map);
      }
      setLoadingPrices(false);
    })();
  }, []);

  function startEdit(produitId: string) {
    setEditing(produitId);
    setEditValue(String(prices[produitId] ?? ""));
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  async function handleSavePrix() {
    if (!editing) return;
    const prix = parseFloat(editValue.replace(",", "."));
    if (isNaN(prix) || prix <= 0) return;
    setSavingProduit(editing);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/boutique/prix", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ produit: editing, nouveauPrix: prix }),
    });
    if (res.ok) {
      const produit = editing;
      setPrices((prev) => ({ ...prev, [produit]: prix }));
      setEditing(null);
      setSavedProduit(produit);
      setTimeout(() => setSavedProduit(null), 2500);
    }
    setSavingProduit(null);
  }

  if (loadingPrices) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "#F06292", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      {PRODUITS.map((p) => {
        const currentPrix = prices[p.id];
        const isEditing = editing === p.id;
        const isSaving = savingProduit === p.id;
        const wasSaved = savedProduit === p.id;

        return (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentPrix !== undefined
                    ? `${currentPrix.toFixed(2).replace(".", ",")} €`
                    : "—"}
                </p>
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
                  onClick={() => (isEditing ? cancelEdit() : startEdit(p.id))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  style={
                    wasSaved
                      ? { color: "#059669", borderColor: "#D1FAE5", background: "#F0FDF4" }
                      : isEditing
                      ? { color: "#6B7280", background: "#F9FAFB" }
                      : { color: "#374151" }
                  }
                >
                  {wasSaved ? "Enregistré ✓" : isEditing ? "Annuler" : "Modifier le prix"}
                </button>
              </div>
            </div>

            {isEditing && (
              <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Nouveau prix (€)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSavePrix()}
                    className="flex-1 px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                    placeholder="Ex: 39.90"
                    autoFocus
                  />
                  <button
                    onClick={handleSavePrix}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: "#1a1a1a" }}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        …
                      </span>
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Onglet Codes promo ───────────────────────────────────────────────────────

function CodesPromoTab() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PromoForm>({ code: "", reduction: "", type: "percent", expiresAt: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [disabling, setDisabling] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/boutique/codes-promo", {
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
    });
    const json = await res.json();
    if (json.data) setCodes(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.reduction) return;
    setCreating(true);
    setCreateError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/boutique/codes-promo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        reduction: parseFloat(form.reduction),
        type: form.type,
        expiresAt: form.expiresAt || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setCreateError(json.error ?? "Erreur lors de la création");
    } else {
      setForm({ code: "", reduction: "", type: "percent", expiresAt: "" });
      await fetchCodes();
    }
    setCreating(false);
  }

  async function handleDisable(id: string) {
    setDisabling(id);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/admin/boutique/codes-promo", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ id }),
    });
    setCodes((prev) => prev.filter((c) => c.id !== id));
    setDisabling(null);
  }

  function formatDiscount(c: PromoCode) {
    if (c.coupon.percent_off) return `-${c.coupon.percent_off}%`;
    if (c.coupon.amount_off) return `-${(c.coupon.amount_off / 100).toFixed(2).replace(".", ",")} €`;
    return "—";
  }

  return (
    <div className="max-w-xl space-y-8">

      {/* Formulaire création */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-5">Créer un code promo</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="Ex: SENAS10"
                className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Réduction {form.type === "percent" ? "(%)" : "(€)"}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.reduction}
                onChange={(e) => setForm((f) => ({ ...f, reduction: e.target.value }))}
                placeholder={form.type === "percent" ? "Ex: 10" : "Ex: 5"}
                className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs">
                {(["percent", "fixed"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: v }))}
                    className="flex-1 py-2 px-2 transition-all"
                    style={
                      form.type === v
                        ? { background: "#1a1a1a", color: "#fff" }
                        : { color: "#6B7280" }
                    }
                  >
                    {v === "percent" ? "Pourcentage" : "Montant fixe"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Expiration <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {createError && <p className="text-xs text-red-500">{createError}</p>}

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "#1a1a1a" }}
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création en cours…
              </span>
            ) : (
              "Créer le code"
            )}
          </button>
        </form>
      </div>

      {/* Liste des codes actifs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800">Codes actifs</p>
          <button
            onClick={fetchCodes}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "#F06292", borderTopColor: "transparent" }} />
          </div>
        ) : codes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-400">Aucun code promo actif</p>
          </div>
        ) : (
          <div className="space-y-2">
            {codes.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                    {c.code}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#FFF0F5", color: "#E91E8C" }}
                  >
                    {formatDiscount(c)}
                  </span>
                  {c.expires_at && (
                    <span className="text-xs text-gray-400">
                      exp. {new Date(c.expires_at * 1000).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {c.times_redeemed > 0 && (
                    <span className="text-xs text-gray-400">{c.times_redeemed}× utilisé</span>
                  )}
                </div>
                <button
                  onClick={() => handleDisable(c.id)}
                  disabled={disabling === c.id}
                  className="ml-3 shrink-0 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {disabling === c.id ? "…" : "Désactiver"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
