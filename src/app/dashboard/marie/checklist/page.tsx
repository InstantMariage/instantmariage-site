"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

/* ─────────────────── Types ─────────────────── */
interface CheckItem {
  id: string;
  label: string;
  custom?: boolean;
}

interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  items: CheckItem[];
}

/* ─────────────────── Données par défaut ─────────────────── */
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "admin",
    label: "Administratif",
    emoji: "📋",
    color: "#6366F1",
    items: [
      { id: "admin-1", label: "Réserver la mairie et déposer le dossier" },
      { id: "admin-2", label: "Choisir et contacter les témoins" },
      { id: "admin-3", label: "Signer le contrat de mariage chez le notaire" },
      { id: "admin-4", label: "Souscrire une assurance mariage" },
      { id: "admin-5", label: "Commander et envoyer les faire-part" },
      { id: "admin-6", label: "Gérer les RSVP et confirmer les présences" },
      { id: "admin-7", label: "Réserver le lieu de réception" },
      { id: "admin-8", label: "Préparer la liste complète des invités" },
      { id: "admin-9", label: "Organiser le transport (navettes, voitures)" },
      { id: "admin-10", label: "Réserver l'hébergement pour les invités" },
      { id: "admin-11", label: "Informer les prestataires des horaires définitifs" },
      { id: "admin-12", label: "Préparer les enveloppes de paiement prestataires" },
    ],
  },
  {
    id: "beaute",
    label: "Tenue & Beauté",
    emoji: "💄",
    color: "#EC4899",
    items: [
      { id: "beaute-1", label: "Choisir et commander la robe de mariée" },
      { id: "beaute-2", label: "Premier essayage de la robe" },
      { id: "beaute-3", label: "Essayage final avec retouches" },
      { id: "beaute-4", label: "Choisir les chaussures de mariage" },
      { id: "beaute-5", label: "Choisir les bijoux et accessoires" },
      { id: "beaute-6", label: "Choisir le voile ou couvre-chef" },
      { id: "beaute-7", label: "Choisir la tenue du / de la marié(e)" },
      { id: "beaute-8", label: "Réserver la coiffeuse et faire un essai" },
      { id: "beaute-9", label: "Réserver la maquilleuse et faire un test" },
      { id: "beaute-10", label: "Manucure / pédicure" },
      { id: "beaute-11", label: "Préparer la pochette de survie (jour J)" },
      { id: "beaute-12", label: "Choisir les tenues pour le voyage de noces" },
    ],
  },
  {
    id: "ceremonie",
    label: "Cérémonie",
    emoji: "💍",
    color: "#F06292",
    items: [
      { id: "cere-1", label: "Choisir le type de cérémonie (civile / religieuse / laïque)" },
      { id: "cere-2", label: "Réserver l'officiant laïque si besoin" },
      { id: "cere-3", label: "Rédiger les vœux personnalisés" },
      { id: "cere-4", label: "Choisir les lectures et poèmes" },
      { id: "cere-5", label: "Sélectionner la musique de cérémonie" },
      { id: "cere-6", label: "Préparer le déroulé complet de cérémonie" },
      { id: "cere-7", label: "Commander ou récupérer les alliances" },
      { id: "cere-8", label: "Répétition de la cérémonie" },
      { id: "cere-9", label: "Prévoir la décoration de l'espace cérémonie" },
      { id: "cere-10", label: "Organiser l'ordre de passage des témoins et discours" },
    ],
  },
  {
    id: "reception",
    label: "Réception",
    emoji: "🥂",
    color: "#F59E0B",
    items: [
      { id: "recep-1", label: "Choisir le traiteur et valider le menu" },
      { id: "recep-2", label: "Dégustation du menu" },
      { id: "recep-3", label: "Confirmer les allergies et régimes alimentaires" },
      { id: "recep-4", label: "Commander le gâteau de mariage" },
      { id: "recep-5", label: "Préparer le plan de table" },
      { id: "recep-6", label: "Réserver le DJ / groupe de musique" },
      { id: "recep-7", label: "Préparer la playlist et les morceaux clés" },
      { id: "recep-8", label: "Commander les fleurs et la décoration" },
      { id: "recep-9", label: "Prévoir les animations (photobooth, jeux…)" },
      { id: "recep-10", label: "Commander les cadeaux pour les invités" },
      { id: "recep-11", label: "Préparer le livre d'or" },
      { id: "recep-12", label: "Prévoir le budget boissons et cocktail" },
    ],
  },
  {
    id: "voyage",
    label: "Voyage de noces",
    emoji: "✈️",
    color: "#10B981",
    items: [
      { id: "voyage-1", label: "Choisir la destination du voyage de noces" },
      { id: "voyage-2", label: "Réserver les billets d'avion / transport" },
      { id: "voyage-3", label: "Réserver l'hébergement (hôtel, villa…)" },
      { id: "voyage-4", label: "Vérifier la validité des passeports" },
      { id: "voyage-5", label: "Obtenir les visas nécessaires" },
      { id: "voyage-6", label: "Souscrire une assurance voyage" },
      { id: "voyage-7", label: "Vérifier les vaccinations requises" },
      { id: "voyage-8", label: "Informer sa banque du voyage à l'étranger" },
      { id: "voyage-9", label: "Prévoir les devises ou carte de change" },
      { id: "voyage-10", label: "Préparer les valises et liste de bagages" },
    ],
  },
  {
    id: "jourj",
    label: "Jour J",
    emoji: "🌸",
    color: "#BE185D",
    items: [
      { id: "jourj-1", label: "Préparer le planning horaire détaillé de la journée" },
      { id: "jourj-2", label: "Confirmer les horaires avec tous les prestataires" },
      { id: "jourj-3", label: "Charger téléphones, batteries et appareils photo" },
      { id: "jourj-4", label: "Petit-déjeuner en famille ou avec les proches" },
      { id: "jourj-5", label: "Séance habillage et maquillage" },
      { id: "jourj-6", label: "Remise des bouquets et boutonnières" },
      { id: "jourj-7", label: "Vérifier que les témoins sont informés et prêts" },
      { id: "jourj-8", label: "Préparer le kit urgence (épingles, sparadraps…)" },
      { id: "jourj-9", label: "Désigner un responsable pour coordonner les prestataires" },
      { id: "jourj-10", label: "Profiter pleinement de chaque instant 💫" },
    ],
  },
];

/* ─────────────────── Helpers ─────────────────── */
function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ─────────────────── Page ─────────────────── */
export default function ChecklistPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [prenomMarie1, setPrenomMarie1] = useState("");

  // Checklist state
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(DEFAULT_CATEGORIES.map((c) => c.id))
  );
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);

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

      if (marie) {
        setPrenomMarie1(marie.prenom_marie1 || "");
      } else {
        setPrenomMarie1(session.user.user_metadata?.prenom || "");
      }

      setAuthChecked(true);
    });
  }, [router]);

  /* ── Persist to localStorage ── */
  useEffect(() => {
    if (!userId || !authChecked) return;
    const saved = localStorage.getItem(`checklist_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.doneIds) setDoneIds(new Set(parsed.doneIds));
        if (parsed.customItems) {
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              items: [
                ...cat.items.filter((i) => !i.custom),
                ...(parsed.customItems[cat.id] || []),
              ],
            }))
          );
        }
      } catch {
        // ignore
      }
    }
  }, [userId, authChecked]);

  const persist = useCallback(
    (newDoneIds: Set<string>, newCategories: Category[]) => {
      if (!userId) return;
      const customItems: Record<string, CheckItem[]> = {};
      newCategories.forEach((cat) => {
        const customs = cat.items.filter((i) => i.custom);
        if (customs.length > 0) customItems[cat.id] = customs;
      });
      localStorage.setItem(
        `checklist_${userId}`,
        JSON.stringify({ doneIds: Array.from(newDoneIds), customItems })
      );
    },
    [userId]
  );

  /* ── Stats ── */
  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const doneCount = categories.reduce(
    (acc, cat) => acc + cat.items.filter((i) => doneIds.has(i.id)).length,
    0
  );
  const progressPct = totalItems === 0 ? 0 : Math.round((doneCount / totalItems) * 100);

  /* ── Handlers ── */
  function toggleItem(id: string) {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next, categories);
      return next;
    });
  }

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addCustomItem(catId: string) {
    const text = (newItemText[catId] || "").trim();
    if (!text) return;
    const newItem: CheckItem = { id: generateId(), label: text, custom: true };
    const newCategories = categories.map((cat) =>
      cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
    );
    setCategories(newCategories);
    setNewItemText((prev) => ({ ...prev, [catId]: "" }));
    setAddingTo(null);
    persist(doneIds, newCategories);
  }

  function removeCustomItem(catId: string, itemId: string) {
    const newCategories = categories.map((cat) =>
      cat.id === catId
        ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
        : cat
    );
    const newDoneIds = new Set(doneIds);
    newDoneIds.delete(itemId);
    setCategories(newCategories);
    setDoneIds(newDoneIds);
    persist(newDoneIds, newCategories);
  }

  if (!authChecked) return null;

  const progressLabel =
    progressPct === 0
      ? "Commencez votre checklist"
      : progressPct < 25
      ? "C'est parti, continuez !"
      : progressPct < 50
      ? "Bon début, on avance !"
      : progressPct < 75
      ? "Plus que la moitié, bravo !"
      : progressPct < 100
      ? "Presque prêt(e)s !"
      : "Tout est prêt, félicitations !";

  return (
    <main className="min-h-screen" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">
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
          <h1 className="text-3xl font-semibold text-white leading-tight mb-1">Checklist mariage</h1>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            {prenomMarie1 ? `Bonjour ${prenomMarie1} · ne` : "Ne"} rien oublier pour votre grand jour
          </p>

          {/* Progress */}
          <div
            className="rounded-3xl p-5"
            style={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "none" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-3xl font-bold text-gray-900 tabular-nums">{progressPct}%</span>
                <span className="text-sm text-gray-400 ml-2">complété</span>
              </div>
              <span className="text-sm font-semibold tabular-nums" style={{ color: "#F06292" }}>
                {doneCount} / {totalItems}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: "#F06292" }}
              />
            </div>
            <p className="text-sm text-gray-400">{progressLabel}</p>
          </div>
        </section>

        {/* ── Content ── */}
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          {categories.map((cat) => {
            const catDone = cat.items.filter((i) => doneIds.has(i.id)).length;
            const catTotal = cat.items.length;
            const catPct = catTotal === 0 ? 0 : Math.round((catDone / catTotal) * 100);
            const isOpen = openCategories.has(cat.id);
            const isAddingHere = addingTo === cat.id;
            const allDone = catDone === catTotal;

            return (
              <div
                key={cat.id}
                className="rounded-3xl overflow-hidden"
                style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/60 transition-colors text-left"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{
                      background: allDone ? cat.color : `${cat.color}22`,
                    }}
                  >
                    {allDone ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{cat.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-gray-900 text-sm">{cat.label}</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 tabular-nums"
                        style={{
                          background: allDone ? "#FFF0F5" : "#F3F4F6",
                          color: allDone ? "#F06292" : "#6B7280",
                        }}
                      >
                        {catDone}/{catTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{ width: `${catPct}%`, background: "#F06292" }}
                      />
                    </div>
                  </div>

                  <svg
                    className={`flex-shrink-0 w-4 h-4 text-gray-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Items list */}
                {isOpen && (
                  <div className="border-t border-gray-50">
                    {cat.items.map((item, idx) => {
                      const isDone = doneIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-5 py-3.5 transition-colors group ${
                            idx < cat.items.length - 1 ? "border-b border-gray-50" : ""
                          } hover:bg-gray-50/40`}
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150"
                            style={{
                              border: isDone ? "none" : "1.5px solid #D1D5DB",
                              background: isDone ? "#F06292" : "transparent",
                            }}
                            aria-label={isDone ? "Décocher" : "Cocher"}
                          >
                            {isDone && (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="2 6 5 9 10 3" />
                              </svg>
                            )}
                          </button>

                          <span
                            className="flex-1 text-sm leading-relaxed cursor-pointer select-none"
                            style={{ color: isDone ? "#9CA3AF" : "#374151", textDecoration: isDone ? "line-through" : "none" }}
                            onClick={() => toggleItem(item.id)}
                          >
                            {item.label}
                          </span>

                          {item.custom && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FFF0F5", color: "#F06292" }}>
                                perso
                              </span>
                              <button
                                onClick={() => removeCustomItem(cat.id, item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-100"
                                aria-label="Supprimer"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add custom item */}
                    <div className="px-5 py-3 border-t border-gray-50">
                      {isAddingHere ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Ajouter une tâche…"
                            value={newItemText[cat.id] || ""}
                            onChange={(e) => setNewItemText((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addCustomItem(cat.id);
                              if (e.key === "Escape") setAddingTo(null);
                            }}
                            className="flex-1 text-sm px-3 py-2 rounded-2xl border border-gray-200 focus:outline-none focus:border-rose-300 bg-gray-50"
                          />
                          <button
                            onClick={() => addCustomItem(cat.id)}
                            className="px-4 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                            style={{ background: "#F06292" }}
                          >
                            Ajouter
                          </button>
                          <button
                            onClick={() => setAddingTo(null)}
                            className="px-3 py-2 rounded-full text-sm font-medium text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTo(cat.id)}
                          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
                          style={{ color: "#F06292" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Ajouter un item personnalisé
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom tip */}
          <div
            className="rounded-3xl p-5"
            style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">
                  Sauvegarde automatique
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Votre progression est conservée d&apos;une visite à l&apos;autre. Ajoutez vos propres items dans chaque catégorie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
