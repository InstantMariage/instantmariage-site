"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  { id: "transport", label: "Voiture de mariage", emoji: "🚗", prevu: 0, paye: 0, statut: "À payer" },
  { id: "voyage", label: "Voyage de noces", emoji: "✈️", prevu: 0, paye: 0, statut: "À payer" },
  { id: "divers", label: "Divers", emoji: "📦", prevu: 0, paye: 0, statut: "À payer" },
];

const STATUT_COLORS: Record<Statut, string> = {
  "À payer": "#9CA3AF",
  "Acompte versé": "#F06292",
  "Soldé": "#374151",
};

const STATUT_BG: Record<Statut, string> = {
  "À payer": "#F3F4F6",
  "Acompte versé": "#FFF0F5",
  "Soldé": "#F3F4F6",
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
    <main className="min-h-screen" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-24">
        {/* ── Header ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-8 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href="/dashboard/marie"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity mb-6"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tableau de bord
          </Link>
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
            Outils mariés
          </p>
          <h1 className="text-3xl font-semibold text-white leading-tight mb-1">Budget mariage</h1>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            {prenomMarie1 ? `Bonjour ${prenomMarie1} · suivez` : "Suivez"} vos dépenses en toute sérénité
          </p>

          {/* Budget global */}
          <div
            className="rounded-3xl p-6"
            style={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "none" }}
          >
            {editingBudget ? (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Budget global (€)</p>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="0"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveBudgetTotal()}
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 text-lg font-semibold focus:outline-none focus:border-rose-300 bg-gray-50"
                    placeholder="Ex : 20000"
                    autoFocus
                  />
                  <button
                    onClick={saveBudgetTotal}
                    className="px-5 py-3 rounded-full text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                    style={{ background: "#F06292" }}
                  >
                    Valider
                  </button>
                  <button onClick={() => setEditingBudget(false)} className="text-gray-400 hover:text-gray-600 px-2 py-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer group"
                onClick={() => { setBudgetInput(String(budgetTotal)); setEditingBudget(true); }}
              >
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Budget global</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">
                    {budgetTotal > 0 ? fmt(budgetTotal) : "—"}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full text-gray-400 bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    Modifier
                  </span>
                </div>
                {budgetTotal === 0 && (
                  <p className="text-sm text-gray-400 mt-2">Cliquez pour définir votre budget total</p>
                )}
              </div>
            )}

            {budgetTotal > 0 && !editingBudget && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Budget utilisé</span>
                  <span className="tabular-nums">{pctUtilise}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pctUtilise}%`, background: depassement ? "#F06292" : "#F06292" }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-4">
          {/* ── Alerte dépassement ── */}
          {depassement && (
            <div
              className="rounded-3xl p-4 flex items-start gap-3"
              style={{ background: "#FFF0F5" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F06292" }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Budget dépassé</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Vos dépenses prévues ({fmt(totalPrevu)}) dépassent votre budget de{" "}
                  <strong style={{ color: "#F06292" }}>{fmt(totalPrevu - budgetTotal)}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ── Cartes résumé ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Budget total", value: budgetTotal > 0 ? fmt(budgetTotal) : "—", highlight: true },
              { label: "Total prévu", value: fmt(totalPrevu), highlight: false },
              { label: "Total payé", value: fmt(totalPaye), highlight: false },
              {
                label: depassement ? "Dépassement" : "Reste à prévoir",
                value: depassement ? fmt(totalPrevu - budgetTotal) : fmt(resteAPrevoir),
                alert: depassement,
                highlight: false,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-4"
                style={{ background: card.highlight ? "#FFF0F5" : "white", boxShadow: "0 2px 12px rgba(240,98,146,0.07)", border: "1px solid #FECDD3" }}
              >
                <p className="text-xs text-gray-400 mb-1 leading-tight">{card.label}</p>
                <p
                  className="text-base font-bold leading-tight tabular-nums"
                  style={{ color: card.highlight ? "#F06292" : card.alert ? "#F06292" : "#1F2937" }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Graphique par catégorie ── */}
          {totalPrevu > 0 && (
            <div
              className="rounded-3xl p-5"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Répartition</h2>
              <div className="space-y-4">
                {catsSorted.filter((c) => c.prevu > 0).map((cat) => {
                  const pct = Math.round((cat.prevu / maxPrevu) * 100);
                  const payePct = cat.prevu > 0 ? Math.min(100, Math.round((cat.paye / cat.prevu) * 100)) : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-700">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: STATUT_COLORS[cat.statut], background: STATUT_BG[cat.statut] }}>
                            {cat.statut}
                          </span>
                          <span className="text-sm font-semibold text-gray-800 tabular-nums">{fmt(cat.prevu)}</span>
                        </div>
                      </div>
                      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "#FECDD3" }} />
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${(pct * payePct) / 100}%`, background: "#F06292" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-pink-200" />
                  <span className="text-xs text-gray-400">Prévu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full" style={{ background: "#F06292" }} />
                  <span className="text-xs text-gray-400">Payé</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Liste des catégories ── */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 px-1">Détail par poste</h2>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {categories.map((cat, i) => {
                const isOpen = openCat === cat.id;
                const ev = editValues[cat.id];
                const hasData = cat.prevu > 0 || cat.paye > 0;
                const isLast = i === categories.length - 1;

                return (
                  <div key={cat.id} style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}>
                    <button
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-rose-50/30 transition-colors"
                      onClick={() => toggleCat(cat.id)}
                    >
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: "#FFF0F5" }}
                      >
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800 text-sm">{cat.label}</span>
                          {hasData && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: STATUT_COLORS[cat.statut], background: STATUT_BG[cat.statut] }}>
                              {cat.statut}
                            </span>
                          )}
                        </div>
                        {hasData ? (
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-400">
                              Prévu : <span className="text-gray-600 font-medium tabular-nums">{fmt(cat.prevu)}</span>
                            </span>
                            {cat.paye > 0 && (
                              <span className="text-xs text-gray-400">
                                Payé : <span className="font-medium tabular-nums" style={{ color: "#F06292" }}>{fmt(cat.paye)}</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-0.5">Non renseigné</p>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && ev && (
                      <div className="px-5 pb-5 border-t border-rose-50 bg-rose-50/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Montant prévu (€)</label>
                            <input
                              type="number"
                              min="0"
                              value={ev.prevu}
                              onChange={(e) => updateEdit(cat.id, "prevu", e.target.value)}
                              className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-rose-300 bg-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Montant payé (€)</label>
                            <input
                              type="number"
                              min="0"
                              value={ev.paye}
                              onChange={(e) => updateEdit(cat.id, "paye", e.target.value)}
                              className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-rose-300 bg-white"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Statut</label>
                          <div className="flex gap-2 flex-wrap">
                            {(["À payer", "Acompte versé", "Soldé"] as Statut[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateEdit(cat.id, "statut", s)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                style={
                                  ev.statut === s
                                    ? { background: "#F06292", color: "white" }
                                    : { background: "#F3F4F6", color: "#6B7280" }
                                }
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {parseFloat(ev.paye || "0") > parseFloat(ev.prevu || "0") && parseFloat(ev.prevu || "0") > 0 && (
                          <div className="mt-3 rounded-2xl px-3 py-2 text-xs" style={{ background: "#FFF0F5", color: "#F06292" }}>
                            Le montant payé dépasse le montant prévu pour ce poste.
                          </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => setOpenCat(null)} className="px-4 py-2 rounded-full text-sm text-gray-400 hover:bg-gray-100 transition-colors">
                            Annuler
                          </button>
                          <button
                            onClick={() => saveCategory(cat.id)}
                            className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80 transition-opacity"
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
          </div>

          {/* ── Récap reste à payer ── */}
          {resteAPayer > 0 && (
            <div
              className="rounded-3xl p-5"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFF0F5", color: "#F06292" }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path strokeLinecap="round" d="M2 10h20" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Reste à régler</p>
                  <p className="text-2xl font-bold mt-0.5 tabular-nums" style={{ color: "#F06292" }}>{fmt(resteAPayer)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Dépenses prévues non encore soldées</p>
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
