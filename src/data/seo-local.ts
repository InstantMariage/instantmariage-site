export interface VilleSEO {
  slug: string;
  nom: string;
  departement: string;
  region: string;
}

export interface MetierSEO {
  slug: string;
  nom: string;
  categorie: string; // valeur exacte dans Supabase
  icon: string;
  nomPluriel: string;
}

export const VILLES_SEO: VilleSEO[] = [
  { slug: "paris", nom: "Paris", departement: "75", region: "Île-de-France" },
  { slug: "lyon", nom: "Lyon", departement: "69", region: "Auvergne-Rhône-Alpes" },
  { slug: "marseille", nom: "Marseille", departement: "13", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "bordeaux", nom: "Bordeaux", departement: "33", region: "Nouvelle-Aquitaine" },
  { slug: "toulouse", nom: "Toulouse", departement: "31", region: "Occitanie" },
  { slug: "nantes", nom: "Nantes", departement: "44", region: "Pays de la Loire" },
  { slug: "lille", nom: "Lille", departement: "59", region: "Hauts-de-France" },
  { slug: "strasbourg", nom: "Strasbourg", departement: "67", region: "Grand Est" },
  { slug: "nice", nom: "Nice", departement: "06", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "montpellier", nom: "Montpellier", departement: "34", region: "Occitanie" },
  { slug: "aix-en-provence", nom: "Aix-en-Provence", departement: "13", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "rennes", nom: "Rennes", departement: "35", region: "Bretagne" },
];

export const METIERS_SEO: MetierSEO[] = [
  { slug: "photographe", nom: "Photographe", categorie: "Photographe", icon: "📷", nomPluriel: "photographes" },
  { slug: "dj", nom: "DJ", categorie: "DJ", icon: "🎧", nomPluriel: "DJs" },
  { slug: "traiteur", nom: "Traiteur", categorie: "Traiteur", icon: "🍽️", nomPluriel: "traiteurs" },
  { slug: "fleuriste", nom: "Fleuriste", categorie: "Fleuriste", icon: "💐", nomPluriel: "fleuristes" },
  { slug: "wedding-planner", nom: "Wedding Planner", categorie: "Wedding Planner", icon: "📋", nomPluriel: "wedding planners" },
  { slug: "videaste", nom: "Vidéaste", categorie: "Vidéaste", icon: "🎬", nomPluriel: "vidéastes" },
  { slug: "lieu-de-reception", nom: "Lieu de réception", categorie: "Lieu de réception", icon: "🏛️", nomPluriel: "lieux de réception" },
  { slug: "coiffeur", nom: "Coiffeur", categorie: "Coiffeur", icon: "✂️", nomPluriel: "coiffeurs" },
  { slug: "maquilleur", nom: "Maquilleur", categorie: "Maquilleur", icon: "💄", nomPluriel: "maquilleurs" },
];

export function parseSlug(slug: string): { metier: MetierSEO | null; ville: VilleSEO | null } {
  const marker = "-mariage-";
  const markerIndex = slug.indexOf(marker);
  if (markerIndex === -1) return { metier: null, ville: null };

  const metierSlug = slug.substring(0, markerIndex);
  const villeSlug = slug.substring(markerIndex + marker.length);

  const metier = METIERS_SEO.find((m) => m.slug === metierSlug) ?? null;
  const ville = VILLES_SEO.find((v) => v.slug === villeSlug) ?? null;

  return { metier, ville };
}

export function buildSlug(metierSlug: string, villeSlug: string): string {
  return `${metierSlug}-mariage-${villeSlug}`;
}

// Fallback images par métier (mêmes que AnnuaireContent)
export const FALLBACK_IMAGES: Record<string, string> = {
  Photographe: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&q=80",
  Vidéaste: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&q=80",
  "Lieu de réception": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=80",
  DJ: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
  Fleuriste: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80",
  "Wedding Planner": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&q=80",
  Traiteur: "https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80",
  Coiffeur: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80",
  Maquilleur: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=80",
};

export const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80";
