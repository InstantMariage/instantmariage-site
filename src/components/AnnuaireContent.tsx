"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PROVIDERS } from "@/data/providers";
import { supabase } from "@/lib/supabase";
import type { Prestataire } from "@/lib/supabase";

// ─── Data ────────────────────────────────────────────────────────────────────

const METIERS = [
  "Tous les métiers",
  "Photographe",
  "Vidéaste",
  "DJ",
  "Musicien / Groupe",
  "Traiteur",
  "Fleuriste",
  "Décorateur",
  "Coiffeur",
  "Maquilleur",
  "Henna",
  "Lieu de réception",
  "Officiant",
  "Wedding Planner",
  "Transport",
  "Animation",
  "Créateur de contenu",
  "Papeterie & Personnalisation",
  "Pâtissier / Wedding cake",
];

const REGIONS = [
  "Toute la France",
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhône-Alpes",
  "Occitanie",
  "Nouvelle-Aquitaine",
  "Bretagne",
  "Normandie",
  "Grand Est",
  "Hauts-de-France",
  "Pays de la Loire",
  "Bourgogne-Franche-Comté",
  "Centre-Val de Loire",
  "Corse",
];

const DEPARTEMENTS: Record<string, string[]> = {
  "Île-de-France": ["Paris (75)", "Seine-et-Marne (77)", "Yvelines (78)", "Essonne (91)", "Hauts-de-Seine (92)", "Seine-Saint-Denis (93)", "Val-de-Marne (94)", "Val-d'Oise (95)"],
  "Provence-Alpes-Côte d'Azur": ["Bouches-du-Rhône (13)", "Var (83)", "Alpes-Maritimes (06)", "Vaucluse (84)", "Hautes-Alpes (05)", "Alpes-de-Haute-Provence (04)"],
  "Auvergne-Rhône-Alpes": ["Rhône (69)", "Isère (38)", "Haute-Savoie (74)", "Savoie (73)", "Ain (01)", "Loire (42)", "Puy-de-Dôme (63)"],
  "Occitanie": ["Haute-Garonne (31)", "Hérault (34)", "Gard (30)", "Pyrénées-Orientales (66)", "Aude (11)"],
  "Nouvelle-Aquitaine": ["Gironde (33)", "Pyrénées-Atlantiques (64)", "Charente-Maritime (17)", "Lot-et-Garonne (47)"],
  "Bretagne": ["Ille-et-Vilaine (35)", "Finistère (29)", "Morbihan (56)", "Côtes-d'Armor (22)"],
  "Normandie": ["Seine-Maritime (76)", "Calvados (14)", "Manche (50)", "Orne (61)", "Eure (27)"],
  "Grand Est": ["Bas-Rhin (67)", "Haut-Rhin (68)", "Moselle (57)", "Meurthe-et-Moselle (54)", "Marne (51)"],
  "Hauts-de-France": ["Nord (59)", "Pas-de-Calais (62)", "Somme (80)", "Oise (60)", "Aisne (02)"],
  "Pays de la Loire": ["Loire-Atlantique (44)", "Maine-et-Loire (49)", "Sarthe (72)", "Vendée (85)", "Mayenne (53)"],
  "Bourgogne-Franche-Comté": ["Côte-d'Or (21)", "Saône-et-Loire (71)", "Yonne (89)", "Doubs (25)"],
  "Centre-Val de Loire": ["Loiret (45)", "Indre-et-Loire (37)", "Loir-et-Cher (41)", "Eure-et-Loir (28)"],
  "Corse": ["Corse-du-Sud (2A)", "Haute-Corse (2B)"],
};


// ─── Fallback images par métier ───────────────────────────────────────────────

const FALLBACK_IMAGES: Record<string, string> = {
  "Photographe": "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&q=80",
  "Vidéaste": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&q=80",
  "Lieu de réception": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=80",
  "DJ": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
  "Musicien / Groupe": "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=500&q=80",
  "Fleuriste": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80",
  "Décorateur": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
  "Wedding Planner": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&q=80",
  "Traiteur": "https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80",
  "Coiffeur": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80",
  "Maquilleur": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=80",
  "Henna": "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
  "Officiant": "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=500&q=80",
  "Transport": "https://images.unsplash.com/photo-1549317661-bd32c8ce0729?w=500&q=80",
  "Animation": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80",
  "Créateur de contenu": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&q=80",
  "Papeterie & Personnalisation": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=500&q=80",
  "Pâtissier / Wedding cake": "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500&q=80",
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80";

// ─── Type unifié pour l'affichage ─────────────────────────────────────────────

interface DisplayProvider {
  id: string;
  nom: string;
  metier: string;
  ville: string;
  region: string;
  note: number;
  avis: number;
  verifie: boolean;
  prixMin: number;
  prixLabel: string;
  photo: string;
  disponible: boolean;
  nouveau: boolean;
  description: string;
  departement: string;
}

// Construire la map inverse département → région une seule fois
const DEPT_TO_REGION: Record<string, string> = {};
const DEPT_NUM_TO_REGION: Record<string, string> = {};
for (const [region, depts] of Object.entries(DEPARTEMENTS)) {
  for (const dept of depts) {
    DEPT_TO_REGION[dept.toLowerCase()] = region;
    const numMatch = dept.match(/\((\w+)\)/);
    if (numMatch) DEPT_NUM_TO_REGION[numMatch[1]] = region;
  }
}

// Map ville (normalisée) → numéro de département
const VILLE_TO_DEPT_NUM: Record<string, string> = {
  // Provence-Alpes-Côte d'Azur
  "aix en provence": "13", "aix-en-provence": "13", "marseille": "13",
  "nice": "06", "toulon": "83", "avignon": "84", "gap": "05",
  "digne": "04", "digne-les-bains": "04",
  // Île-de-France
  "paris": "75", "versailles": "78", "boulogne-billancourt": "92",
  "boulogne billancourt": "92", "saint-denis": "93", "saint denis": "93",
  "vincennes": "94", "cergy": "95",
  // Auvergne-Rhône-Alpes
  "lyon": "69", "grenoble": "38", "annecy": "74", "chambéry": "73",
  "chambery": "73", "clermont-ferrand": "63", "clermont ferrand": "63",
  "saint-étienne": "42", "saint etienne": "42", "bourg-en-bresse": "01",
  // Occitanie
  "toulouse": "31", "montpellier": "34", "nîmes": "30", "nimes": "30",
  "perpignan": "66", "carcassonne": "11",
  // Nouvelle-Aquitaine
  "bordeaux": "33", "bayonne": "64", "la rochelle": "17", "agen": "47",
  // Bretagne
  "rennes": "35", "brest": "29", "lorient": "56", "saint-brieuc": "22",
  "saint brieuc": "22", "quimper": "29",
  // Normandie
  "rouen": "76", "caen": "14", "cherbourg": "50", "évreux": "27", "evreux": "27",
  // Grand Est
  "strasbourg": "67", "mulhouse": "68", "metz": "57", "nancy": "54", "reims": "51",
  // Hauts-de-France
  "lille": "59", "lens": "62", "arras": "62", "amiens": "80", "valenciennes": "59",
  // Pays de la Loire
  "nantes": "44", "angers": "49", "le mans": "72", "saint-nazaire": "44",
  "saint nazaire": "44",
  // Bourgogne-Franche-Comté
  "dijon": "21", "besançon": "25", "besancon": "25",
  // Centre-Val de Loire
  "orléans": "45", "orleans": "45", "tours": "37",
  // Corse
  "ajaccio": "2A", "bastia": "2B",
};

function getDeptNumFromVille(ville: string): string {
  if (!ville) return "";
  return VILLE_TO_DEPT_NUM[ville.toLowerCase().trim()] || "";
}

function getRegionFromVille(ville: string): string {
  const deptNum = getDeptNumFromVille(ville);
  return deptNum ? (DEPT_NUM_TO_REGION[deptNum] || "") : "";
}

function getRegionFromDepartement(dept: string | null): string {
  if (!dept) return "";
  const lower = dept.toLowerCase().trim();
  // Si c'est directement un nom de région
  for (const region of Object.keys(DEPARTEMENTS)) {
    if (region.toLowerCase() === lower) return region;
  }
  // Correspondance exacte dans la map département→région
  if (DEPT_TO_REGION[lower]) return DEPT_TO_REGION[lower];
  // Extraire le numéro depuis le format "13 - Bouche du Rhône" ou "13"
  const numAtStart = lower.match(/^(\d{2,3}[ab]?)\b/);
  if (numAtStart && DEPT_NUM_TO_REGION[numAtStart[1]]) return DEPT_NUM_TO_REGION[numAtStart[1]];
  // Correspondance partielle (ex : "Rhône" dans "Rhône (69)" ou "69" dans "Rhône (69)")
  for (const [key, region] of Object.entries(DEPT_TO_REGION)) {
    if (key.includes(lower) || lower.includes(key.split(" (")[0])) return region;
  }
  return "";
}

function isRecentDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
}

function prestataireToDisplay(p: Prestataire): DisplayProvider {
  return {
    id: p.id,
    nom: p.nom_entreprise,
    metier: p.categorie,
    ville: p.ville || "",
    region: getRegionFromDepartement(p.departement) || getRegionFromVille(p.ville || ""),
    note: p.note_moyenne,
    avis: p.nb_avis,
    verifie: p.abonnement_actif,
    prixMin: p.prix_depart ?? 0,
    prixLabel: p.prix_depart != null ? `À partir de ${p.prix_depart.toLocaleString("fr-FR")} €` : "Sur devis",
    photo: p.photos?.[0] || FALLBACK_IMAGES[p.categorie] || DEFAULT_FALLBACK,
    disponible: true,
    nouveau: isRecentDate(p.created_at),
    description: p.description || "",
    departement: p.departement || "",
  };
}

function mockToDisplay(p: typeof PROVIDERS[number]): DisplayProvider {
  return {
    id: String(p.id),
    nom: p.nom,
    metier: p.metier,
    ville: p.ville,
    region: p.region,
    note: p.note,
    avis: p.avis,
    verifie: p.verifie,
    prixMin: p.prixMin,
    prixLabel: p.prixLabel,
    photo: p.photo,
    disponible: p.disponible,
    nouveau: p.nouveau,
    description: p.description,
    departement: (p as any).departement || "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = note >= star;
        const half = !filled && note >= star - 0.5;
        return (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${filled || half ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

function ProviderCard({ provider }: { provider: DisplayProvider }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={provider.photo}
          alt={provider.nom}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGES[provider.metier] ?? DEFAULT_FALLBACK; e.currentTarget.onerror = null; }}
        />
        {/* Badges top */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {provider.verifie && (
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-rose-500 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Vérifié
            </span>
          )}
          {provider.nouveau && (
            <span className="inline-flex items-center bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Nouveau
            </span>
          )}
        </div>
        {/* Disponibilité */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm ${
            provider.disponible
              ? "bg-white/95 text-emerald-600"
              : "bg-white/95 text-gray-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${provider.disponible ? "bg-emerald-500" : "bg-gray-300"}`} />
            {provider.disponible ? "Disponible" : "Complet"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Métier */}
        <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
          {provider.metier}
        </span>
        {/* Nom */}
        <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug group-hover:text-rose-500 transition-colors">
          {provider.nom}
        </h3>
        {/* Ville */}
        <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{provider.ville}</span>
        </div>
        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
          {provider.description}
        </p>

        {/* Note */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating note={provider.note} />
          <span className="text-sm font-bold text-gray-800">{provider.note.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({provider.avis} avis)</span>
        </div>

        {/* Prix + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Prix</span>
            <p className="text-sm font-bold text-gray-900">{provider.prixLabel}</p>
          </div>
          <Link href={`/prestataires/${provider.id}`} className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
            Voir le profil
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-rose-300 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
            p === currentPage
              ? "bg-rose-400 text-white shadow-sm"
              : "border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-rose-300 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

export default function AnnuaireContent() {
  const urlParams = useSearchParams();

  // Search bar state
  const [searchMetier, setSearchMetier] = useState(urlParams.get("metier") ?? "");
  const [searchRegion, setSearchRegion] = useState(urlParams.get("region") ?? "");
  const [searchBudgetMax, setSearchBudgetMax] = useState("");

  // Active filters state (applied after clicking "Rechercher")
  const [activeMetier, setActiveMetier] = useState(urlParams.get("metier") ?? "");
  const [activeRegion, setActiveRegion] = useState(urlParams.get("region") ?? "");
  const [activeBudgetMax, setActiveBudgetMax] = useState(10000);

  // Sidebar filters
  const [sideMetier, setSideMetier] = useState(urlParams.get("metier") ?? "");
  const [sideDept, setSideDept] = useState("");
  const [sideBudget, setSideBudget] = useState(10000);
  const [sideNoteMin, setSideNoteMin] = useState(0);
  const [sideVerifie, setSideVerifie] = useState(false);
  const [sideDisponible, setSideDisponible] = useState(false);

  // Données Supabase
  const [supabaseProviders, setSupabaseProviders] = useState<DisplayProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    supabase
      .from("prestataires")
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSupabaseProviders((data as Prestataire[]).map(prestataireToDisplay));
          setIsDemo(false);
        } else {
          setSupabaseProviders(PROVIDERS.map(mockToDisplay));
          setIsDemo(true);
        }
        setLoading(false);
      });
  }, []);

  // UI state
  const [tri, setTri] = useState("pertinence");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derived: departements for selected sidebar region
  const sidebarRegion = activeRegion || searchRegion;
  const deptList = sidebarRegion && sidebarRegion !== "Toute la France"
    ? (DEPARTEMENTS[sidebarRegion] || [])
    : [];

  // Apply search bar
  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setActiveMetier(searchMetier);
    setActiveRegion(searchRegion);
    setActiveBudgetMax(searchBudgetMax ? parseInt(searchBudgetMax) : 10000);
    setSideMetier(searchMetier);
    setSideDept("");
    setCurrentPage(1);
  }

  // Filtered + sorted results
  const filtered = useMemo(() => {
    let list = supabaseProviders.filter((p) => {
      // Métier (sidebar takes priority) — comparaison insensible à la casse
      const metier = sideMetier || activeMetier;
      if (metier && metier !== "Tous les métiers" &&
          p.metier.toLowerCase().trim() !== metier.toLowerCase().trim()) return false;
      // Département (sidebar) ou Région (barre de recherche)
      if (sideDept) {
        // Filtrer par département spécifique : comparer avec p.departement ou p.ville
        const deptName = sideDept.split(" (")[0].toLowerCase();
        const deptNumMatch = sideDept.match(/\((\w+)\)/);
        const deptNum = deptNumMatch ? deptNumMatch[1].toLowerCase() : "";
        const pDeptRaw = (p.departement ?? "").trim();
        // Extraire le numéro depuis "13 - Bouche du Rhône" ou "13"
        const pDeptNum = pDeptRaw.split(/\s*[-–]\s*/)[0].trim().toLowerCase();
        const pDept = pDeptRaw.toLowerCase();
        const villeDeptNum = getDeptNumFromVille(p.ville ?? "").toLowerCase();
        if (!(deptNum && pDeptNum === deptNum) &&
            !pDept.includes(deptName) && !(deptNum && pDept.includes(deptNum)) &&
            !(deptNum && villeDeptNum === deptNum)) return false;
      } else {
        const region = activeRegion;
        if (region && region !== "Toute la France" && p.region !== region) return false;
      }
      // Budget (prixMin=0 pour les vrais prestataires → toujours inclus)
      if (p.prixMin > activeBudgetMax) return false;
      // Note min
      if (p.note < sideNoteMin) return false;
      // Vérifié
      if (sideVerifie && !p.verifie) return false;
      // Disponible
      if (sideDisponible && !p.disponible) return false;
      return true;
    });

    // Sort
    if (tri === "note") {
      list = [...list].sort((a, b) => b.note - a.note);
    } else if (tri === "prix_asc") {
      list = [...list].sort((a, b) => a.prixMin - b.prixMin);
    } else if (tri === "prix_desc") {
      list = [...list].sort((a, b) => b.prixMin - a.prixMin);
    } else if (tri === "nouveaux") {
      list = [...list].sort((a, b) => (b.nouveau ? 1 : 0) - (a.nouveau ? 1 : 0));
    }

    return list;
  }, [supabaseProviders, activeMetier, activeRegion, activeBudgetMax, sideMetier, sideDept, sideNoteMin, sideVerifie, sideDisponible, tri]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function handlePageChange(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFilters() {
    setSideMetier("");
    setSideDept("");
    setSideBudget(10000);
    setSideNoteMin(0);
    setSideVerifie(false);
    setSideDisponible(false);
    setActiveMetier("");
    setActiveRegion("");
    setActiveBudgetMax(10000);
    setSearchMetier("");
    setSearchRegion("");
    setSearchBudgetMax("");
    setCurrentPage(1);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Hero / Search Bar ─────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-br from-rose-500 via-rose-400 to-pink-400 pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Annuaire des prestataires mariage
          </h1>
          <p className="text-white/85 text-base md:text-lg mb-10 max-w-2xl mx-auto">
            Plus de <strong className="text-white">100 professionnels vérifiés</strong> partout en France
          </p>

          {/* Search card */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-3 md:p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Métier */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  value={searchMetier}
                  onChange={(e) => setSearchMetier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 text-gray-700 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none cursor-pointer font-medium"
                >
                  {METIERS.map((m) => (
                    <option key={m} value={m === "Tous les métiers" ? "" : m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:block w-px bg-gray-200 my-1" />

              {/* Région */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <select
                  value={searchRegion}
                  onChange={(e) => setSearchRegion(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 text-gray-700 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none cursor-pointer font-medium"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r === "Toute la France" ? "" : r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:block w-px bg-gray-200 my-1" />

              {/* Budget */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  placeholder="Budget max (€)"
                  value={searchBudgetMax}
                  onChange={(e) => setSearchBudgetMax(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 text-gray-700 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium placeholder-gray-400"
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="bg-rose-400 hover:bg-rose-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </button>
            </div>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Photographe Paris", "DJ Lyon", "Traiteur PACA", "Wedding Planner Bordeaux", "Fleuriste Nantes"].map((tag) => (
              <button
                key={tag}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs px-3.5 py-1.5 rounded-full border border-white/30 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Sidebar Filters ──────────────────────────────────────── */}
          {/* Mobile toggle */}
          <div className="lg:hidden w-full">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtrer les résultats
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <aside className={`
            w-full lg:w-72 lg:flex-shrink-0 lg:block
            ${mobileFiltersOpen ? "block" : "hidden"}
          `}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-24">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">Filtres</h2>
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="px-5 py-5 space-y-6">

                {/* Métier */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Métier
                  </label>
                  <select
                    value={sideMetier}
                    onChange={(e) => { setSideMetier(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none"
                  >
                    {METIERS.map((m) => (
                      <option key={m} value={m === "Tous les métiers" ? "" : m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Région */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Région
                  </label>
                  <select
                    value={activeRegion}
                    onChange={(e) => { setActiveRegion(e.target.value); setSideDept(""); setCurrentPage(1); }}
                    className="w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r === "Toute la France" ? "" : r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Département */}
                {deptList.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Département
                    </label>
                    <select
                      value={sideDept}
                      onChange={(e) => { setSideDept(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none"
                    >
                      <option value="">Tous les départements</option>
                      {deptList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Budget slider */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Budget maximum
                    <span className="float-right text-rose-400 font-bold normal-case tracking-normal">
                      {sideBudget >= 10000 ? "Illimité" : `${sideBudget.toLocaleString("fr-FR")} €`}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={200}
                    max={10000}
                    step={100}
                    value={sideBudget}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSideBudget(val);
                      setActiveBudgetMax(val);
                      setCurrentPage(1);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-rose-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                    <span>200 €</span>
                    <span>10 000 €+</span>
                  </div>
                </div>

                {/* Note minimum */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Note minimale
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 3, 4, 4.5].map((n) => (
                      <button
                        key={n}
                        onClick={() => { setSideNoteMin(n); setCurrentPage(1); }}
                        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                          sideNoteMin === n
                            ? "bg-rose-400 text-white border-rose-400"
                            : "border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500"
                        }`}
                      >
                        {n === 0 ? (
                          "Tous"
                        ) : (
                          <>
                            <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {n}+
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-1 border-t border-gray-100">
                  {/* Vérifié */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 font-medium flex items-center gap-2 cursor-pointer">
                      <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Badge vérifié uniquement
                    </label>
                    <button
                      onClick={() => { setSideVerifie(!sideVerifie); setCurrentPage(1); }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${sideVerifie ? "bg-rose-400" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${sideVerifie ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {/* Disponible */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 font-medium flex items-center gap-2 cursor-pointer">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Disponible uniquement
                    </label>
                    <button
                      onClick={() => { setSideDisponible(!sideDisponible); setCurrentPage(1); }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${sideDisponible ? "bg-rose-400" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${sideDisponible ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Sort + count bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 min-w-0">
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Chargement…</span>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 text-sm">
                      <span className="font-bold text-gray-900">{filtered.length}</span> prestataire{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                    </p>
                    {isDemo && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Profils de démonstration
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Trier par</span>
                <select
                  value={tri}
                  onChange={(e) => { setTri(e.target.value); setCurrentPage(1); }}
                  className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none cursor-pointer pr-8"
                >
                  <option value="pertinence">Pertinence</option>
                  <option value="note">Meilleure note</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix décroissant</option>
                  <option value="nouveaux">Nouveaux en premier</option>
                </select>
              </div>
            </div>

            {/* Bannière "Soyez le premier" si aucun vrai prestataire */}
            {isDemo && !loading && (
              <div className="mb-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-rose-500 font-bold text-base mb-0.5">
                    Soyez le premier prestataire à rejoindre InstantMariage&nbsp;!
                  </p>
                  <p className="text-gray-500 text-sm">
                    Ces profils sont des exemples. Inscrivez votre entreprise et apparaissez ici dès aujourd&apos;hui.
                  </p>
                </div>
                <Link
                  href="/inscription"
                  className="flex-shrink-0 bg-rose-400 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Inscrire mon entreprise
                </Link>
              </div>
            )}

            {/* Grid */}
            {!loading && paginated.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Aucun résultat</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Essayez d&apos;élargir vos critères de recherche.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-rose-400 hover:bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : !loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              /* Squelette de chargement */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

            {/* Info text */}
            {filtered.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-6">
                Affichage de {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} résultats
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Vous êtes prestataire mariage ?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
            Rejoignez plus de 100 professionnels référencés sur InstantMariage.fr et recevez des demandes de devis qualifiées chaque semaine.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-rose-400 hover:bg-rose-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm">
              Inscrire mon entreprise gratuitement
            </button>
            <button className="border-2 border-rose-300 text-rose-500 hover:bg-rose-50 font-semibold px-8 py-3.5 rounded-xl transition-all text-sm">
              En savoir plus sur nos offres
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
