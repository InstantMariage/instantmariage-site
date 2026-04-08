"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

/* ─────────────────── Types ─────────────────── */
type Statut = "À payer" | "Acompte versé" | "Soldé";

interface BudgetCategory {
  id: string;
  label: string;
  emoji: string;
  prevu: number;
  paye: number;
  statut: Statut;
}

interface BudgetData {
  budgetTotal: number;
  categories: BudgetCategory[];
}

/* ─────────────────── Catégories par défaut ─────────────────── */
const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: "lieu", label: "Lieu de réception", emoji: "🏛️", prevu: 0, paye: 0, statut: "À payer" },
  { id: "traiteur", label: "Traiteur", emoji: "🍽️", prevu: 0, paye: 0, statut: "À payer" },
  { id: "photographe", label: "Photographe", emoji: "📷", prevu: 0, paye: 0, statut: "À payer" },
  { id: "videaste", label: "Vidéaste", emoji: "🎬", prevu: 0, paye: 0, statut: "À payer" },
  { id: "dj", label: "DJ / Musique", emoji: "🎧", prevu: 0, paye: 0, statut: "À payer" },
  { id: "fleurs", label: "Fleurs & Décoration florale", emoji: "💐", prevu: 0, paye: 0, statut: "À payer" },
  { id: "tenue_mariee", label: "Tenue mariée", emoji: "👗", prevu: 0, paye: 0, statut: "À payer" },
  { id: "tenue_marie", label: "Tenue marié", emoji: "🤵", prevu: 0, paye: 0, statut: "À payer" },
  { id: "coiffure", label: "Coiffure & Maquillage", emoji: "💄", prevu: 0, paye: 0, statut: "À payer" },
  { id: "faire_part", label: "Faire-part", emoji: "💌", prevu: 0, paye: 0, statut: "À payer" },
  { id: "decoration", label: "Décoration", emoji: "✨", prevu: 0, paye: 0, statut: "À payer" },
  { id: "transport", label: "Transport", emoji: "🚗", prevu: 0, paye: 0, statut: "À payer" },
  { id: "voyage", label: "Voyage de noces", emoji: "✈️", prevu: 0, paye: 0, statut: "À payer" },
  { id: "divers", label: "Divers", emoji: "📦", prevu: 0, paye: 0, statut: "À payer" },
];

const STATUT_COLORS: Record<Statut, string> = {
  "À payer": "#6B7280",
  "Acompte versé": "#F59E0B",
  "Soldé": "#10B981",
};

const STATUT_BG: Record<Statut, string> = {
  "À payer": "#F3F4F6",
  "Acompte versé": "#FEF3C7",
  "Soldé": "#D1FAE5",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

/* ─────────────────── Page ─────────────────── */
export default function BudgetPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [prenomMarie1, setPrenomMarie1] = useState("");

  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [categories, setCategories] = useState<BudgetCategory[]>(DEFAULT_CATEGORIES);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { prevu: string; paye: string; statut: Statut }>>({});

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setUserId(session.user.id);
      const { data: marie } = await supabase
        .from("maries")
        .select("prenom_marie1")
        .eq("user_id", session.user.id)
        .single();
      setPrenomMarie1(marie?.prenom_marie1 || session.user.user_metadata?.prenom || "");
      setAuthChecked(true);
    });
  }, [router]);

  /* ── Load from localStorage ── */
  useEffect(() => {
    if (!userId || !authChecked) return;
    const saved = localStorage.getItem(`budget_${userId}`);
    if (saved) {
      try {
        const parsed: BudgetData = JSON.parse(saved);
        if (typeof parsed.budgetTotal === "number") {
          setBudgetTotal(parsed.budgetTotal);
          setBudgetInput(String(parsed.budgetTotal));
        }
        if (Array.isArray(parsed.categories)) {
          // Merge: keep default order, apply saved values
          setCategories(DEFAULT_CATEGORIES.map((def) => {
            const saved_cat = parsed.categories.find((c) => c.id === def.id);
            return saved_cat ? { ...def, prevu: saved_cat.prevu, paye: saved_cat.paye, statut: saved_cat.statut } : def;
          }));
        }
      } catch {
        // ignore
      }
    }
  }, [userId, authChecked]);

  /* ── Persist ── */
  const persist = useCallback(
    (total: number, cats: BudgetCategory[]) => {
      if (!userId) return;
      localStorage.setItem(`budget_${userId}`, JSON.stringify({ budgetTotal: total, categories: cats }));
    },
    [userId]
  );

  /* ── Stats ── */
  const totalPrevu = categories.reduce((s, c) => s + c.prevu, 0);
  const totalPaye = categories.reduce((s, c) => s + c.paye, 0);
  const resteAPrevoir = Math.max(0, budgetTotal - totalPrevu);
  const resteAPayer = Math.max(0, totalPrevu - totalPaye);
  const depassement = budgetTotal > 0 && totalPrevu > budgetTotal;
  const pctUtilise = budgetTotal > 0 ? Math.min(100, Math.round((totalPrevu / budgetTotal) * 100)) : 0;

  /* ── Handlers ── */
  function saveBudgetTotal() {
    const val = parseFloat(budgetInput.replace(",", ".")) || 0;
    setBudgetTotal(val);
    setEditingBudget(false);
    persist(val, categories);
  }

  function toggleCat(id: string) {
    if (openCat === id) {
      setOpenCat(null);
    } else {
      const cat = categories.find((c) => c.id === id)!;
      setEditValues((prev) => ({
        ...prev,
        [id]: {
          prevu: cat.prevu > 0 ? String(cat.prevu) : "",
          paye: cat.paye > 0 ? String(cat.paye) : "",
          statut: cat.statut,
        },
      }));
      setOpenCat(id);
    }
  }

  function saveCategory(id: string) {
    const ev = editValues[id];
    if (!ev) return;
    const prevu = parseFloat(ev.prevu.replace(",", ".")) || 0;
    const paye = parseFloat(ev.paye.replace(",", ".")) || 0;
    const updated = categories.map((c) =>
      c.id === id ? { ...c, prevu, paye, statut: ev.statut } : c
    );
    setCategories(updated);
    setOpenCat(null);
    persist(budgetTotal, updated);
  }

  function updateEdit(id: string, field: "prevu" | "paye" | "statut", value: string) {
    setEditValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  if (!authChecked) return null;

  const catsSorted = [...categories].sort((a, b) => b.prevu - a.prevu);
  const maxPrevu = Math.max(...categories.map((c) => c.prevu), 1);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-24">
        {/* ── Hero ── */}
        <div
          className="px-4 py-12"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)" }}
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-white/80 text-sm font-medium mb-1 tracking-wide uppercase">
              Outils mariés
            </p>
            <h1 className="text-3xl font-bold text-white font-playfair mb-1">
              Budget mariage
            </h1>
            <p className="text-white/80 text-base mb-8">
              {prenomMarie1 ? `Bonjour ${prenomMarie1} — suivez` : "Suivez"} vos dépenses en toute sérénité
            </p>

            {/* Budget global card */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              {editingBudget ? (
                <div>
                  <p className="text-white/80 text-sm mb-2">Budget global (€)</p>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      min="0"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveBudgetTotal()}
                      className="flex-1 rounded-xl px-4 py-3 text-gray-800 text-lg font-semibold focus:outline-none"
                      placeholder="Ex: 20000"
                      autoFocus
                    />
                    <button
                      onClick={saveBudgetTotal}
                      className="bg-white text-pink-600 font-semibold px-5 py-3 rounded-xl hover:bg-pink-50 transition-colors"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => setEditingBudget(false)}
                      className="text-white/70 hover:text-white px-3 py-3"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer group"
                  onClick={() => { setBudgetInput(String(budgetTotal)); setEditingBudget(true); }}
                >
                  <p className="text-white/70 text-sm mb-1">Budget global</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-white">
                      {budgetTotal > 0 ? fmt(budgetTotal) : "— €"}
                    </span>
                    <span className="text-white/60 text-sm group-hover:text-white/90 transition-colors bg-white/10 rounded-lg px-2 py-1">
                      ✏️ Modifier
                    </span>
                  </div>
                  {budgetTotal === 0 && (
                    <p className="text-white/60 text-sm mt-2">
                      Cliquez pour définir votre budget total
                    </p>
                  )}
                </div>
              )}

              {budgetTotal > 0 && !editingBudget && (
                <div className="mt-4">
                  <div className="flex justify-between text-white/70 text-xs mb-1">
                    <span>Budget utilisé</span>
                    <span>{pctUtilise}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${pctUtilise}%`,
                        background: depassement ? "#FCA5A5" : "white",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
          {/* ── Alerte dépassement ── */}
          {depassement && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-700">Budget dépassé</p>
                <p className="text-red-600 text-sm mt-0.5">
                  Vos dépenses prévues ({fmt(totalPrevu)}) dépassent votre budget de{" "}
                  <strong>{fmt(totalPrevu - budgetTotal)}</strong>. Pensez à ajuster vos postes.
                </p>
              </div>
            </div>
          )}

          {/* ── Cartes résumé ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="Budget total"
              value={budgetTotal > 0 ? fmt(budgetTotal) : "—"}
              icon="💰"
              highlight
            />
            <SummaryCard label="Total prévu" value={fmt(totalPrevu)} icon="📋" />
            <SummaryCard label="Total payé" value={fmt(totalPaye)} icon="✅" />
            <SummaryCard
              label={depassement ? "Dépassement" : "Reste à prévoir"}
              value={depassement ? fmt(totalPrevu - budgetTotal) : fmt(resteAPrevoir)}
              icon={depassement ? "🔴" : "💸"}
              alert={depassement}
            />
          </div>

          {/* ── Graphique par catégorie ── */}
          {totalPrevu > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Répartition par catégorie</h2>
              <div className="space-y-3">
                {catsSorted
                  .filter((c) => c.prevu > 0)
                  .map((cat) => {
                    const pct = Math.round((cat.prevu / maxPrevu) * 100);
                    const payePct = cat.prevu > 0 ? Math.min(100, Math.round((cat.paye / cat.prevu) * 100)) : 0;
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 flex items-center gap-1.5">
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                color: STATUT_COLORS[cat.statut],
                                background: STATUT_BG[cat.statut],
                              }}
                            >
                              {cat.statut}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">{fmt(cat.prevu)}</span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          {/* Barre budget prévu */}
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: "#FECDD3" }}
                          />
                          {/* Barre montant payé */}
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                            style={{ width: `${(pct * payePct) / 100}%`, background: "#F06292" }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 rounded-full bg-pink-200" />
                  <span className="text-xs text-gray-500">Prévu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 rounded-full" style={{ background: "#F06292" }} />
                  <span className="text-xs text-gray-500">Payé</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Liste des catégories ── */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-gray-800 px-1">Détail par poste</h2>
            {categories.map((cat) => {
              const isOpen = openCat === cat.id;
              const ev = editValues[cat.id];
              const hasData = cat.prevu > 0 || cat.paye > 0;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Header row */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50/80 transition-colors"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800 text-sm">{cat.label}</span>
                        {hasData && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              color: STATUT_COLORS[cat.statut],
                              background: STATUT_BG[cat.statut],
                            }}
                          >
                            {cat.statut}
                          </span>
                        )}
                      </div>
                      {hasData && (
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400">
                            Prévu : <span className="text-gray-600 font-medium">{fmt(cat.prevu)}</span>
                          </span>
                          {cat.paye > 0 && (
                            <span className="text-xs text-gray-400">
                              Payé : <span className="font-medium" style={{ color: "#F06292" }}>{fmt(cat.paye)}</span>
                            </span>
                          )}
                        </div>
                      )}
                      {!hasData && (
                        <p className="text-xs text-gray-400 mt-0.5">Non renseigné — cliquer pour compléter</p>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded form */}
                  {isOpen && ev && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Montant prévu (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ev.prevu}
                            onChange={(e) => updateEdit(cat.id, "prevu", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Montant payé (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ev.paye}
                            onChange={(e) => updateEdit(cat.id, "paye", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Statut</label>
                        <div className="flex gap-2 flex-wrap">
                          {(["À payer", "Acompte versé", "Soldé"] as Statut[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateEdit(cat.id, "statut", s)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                              style={
                                ev.statut === s
                                  ? { background: STATUT_COLORS[s], color: "white", borderColor: STATUT_COLORS[s] }
                                  : { background: "white", color: STATUT_COLORS[s], borderColor: STATUT_COLORS[s] + "80" }
                              }
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Alerte dépassement poste */}
                      {parseFloat(ev.paye || "0") > parseFloat(ev.prevu || "0") && parseFloat(ev.prevu || "0") > 0 && (
                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                          ⚠️ Le montant payé dépasse le montant prévu pour ce poste.
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setOpenCat(null)}
                          className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => saveCategory(cat.id)}
                          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                          style={{ background: "#F06292" }}
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Récap reste à payer ── */}
          {resteAPayer > 0 && (
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "#FFF1F5", borderColor: "#FBCFE8" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-semibold text-gray-800">Reste à régler</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#F06292" }}>
                    {fmt(resteAPayer)}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Dépenses prévues non encore soldées
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

/* ─────────────────── Composant carte résumé ─────────────────── */
function SummaryCard({
  label,
  value,
  icon,
  highlight,
  alert,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={
        highlight
          ? { background: "#FFF1F5", borderColor: "#FBCFE8" }
          : alert
          ? { background: "#FEF2F2", borderColor: "#FECACA" }
          : { background: "white", borderColor: "#F3F4F6" }
      }
    >
      <div className="text-lg mb-1">{icon}</div>
      <p className="text-xs text-gray-500 leading-tight mb-1">{label}</p>
      <p
        className="text-lg font-bold leading-tight"
        style={{ color: highlight ? "#F06292" : alert ? "#EF4444" : "#1F2937" }}
      >
        {value}
      </p>
    </div>
  );
}
