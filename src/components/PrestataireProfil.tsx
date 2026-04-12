"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROVIDERS } from "@/data/providers";
import { supabase, type Marie, type Prestataire as SupabasePrestataire } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "avis" | "tarifs";

// ─── Couvertures par métier ────────────────────────────────────────────────────

const COUVERTURES: Record<string, string> = {
  "Photographe": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80",
  "Vidéaste": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1400&q=80",
  "Salle de réception": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&q=80",
  "DJ / Animateur": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80",
  "Fleuriste": "https://images.unsplash.com/photo-1487530811015-780780e7f2a2?w=1400&q=80",
  "Wedding Planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&q=80",
  "Traiteur / Restauration": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  "Coiffeur & Maquilleur": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80",
  "Pâtissier / Wedding cake": "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1400&q=80",
  "Orchestre / Groupe": "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1400&q=80",
};

// ─── Données fictives (fallback) ──────────────────────────────────────────────

const PRESTATAIRE_FALLBACK = {
  nom: "Sophie Martin Photographie",
  metier: "Photographe",
  ville: "Paris",
  region: "Île-de-France",
  note: 4.9,
  nbAvis: 127,
  verifie: true,
  prixMin: 1800,
  telephone: "06 12 34 56 78",
  email: "contact@sophiemartin.fr",
  site: "www.sophiemartin.fr",
  instagram: "@sophiemartin_photo",
  photo: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=300&q=80",
  couverture: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80",
  description: `Photographe de mariage basée à Paris depuis 10 ans, je capture chaque instant de votre grand jour avec une approche naturelle et émotionnelle. Mon style se caractérise par des photos lumineuses, intemporelles et authentiques — loin des poses figées, je préfère immortaliser les regards complices, les rires spontanés et les larmes de joie.

Diplômée de l'École des Arts Décoratifs de Paris, j'ai accompagné plus de 200 couples dans toute la France, des châteaux de Loire aux plages normandes.

Chaque mariage est unique et mérite une attention particulière. C'est pourquoi je rencontre chaque couple en amont pour comprendre leur vision, leur histoire et leurs envies. Le résultat : un album qui vous ressemble.`,
  specialites: [
    "Reportage photo complet",
    "Séance engagement",
    "Portrait de couple",
    "Mariage civil & religieux",
    "Mariage laïque",
    "Séance trash the dress",
  ],
  experience: 10,
  zones: ["Paris", "Île-de-France", "Normandie", "Loire", "Toute la France sur devis"],
  langues: ["Français", "Anglais"],
  equipements: [
    "Appareils photo Sony A7 IV (x2)",
    "Objectifs 35mm, 50mm, 85mm, 135mm",
    "Flash off-camera",
    "Drone DJI Mini 3 Pro",
    "Stabilisateur",
  ],
};

// ─── Supabase Storage ─────────────────────────────────────────────────────────

const SUPABASE_PHOTOS_BASE = "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/photos/";

function buildPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return SUPABASE_PHOTOS_BASE + path;
}

// ─── Construction du profil depuis un provider ────────────────────────────────

function buildPrestataire(id: number): PrestatireData {
  const provider = PROVIDERS.find((p) => p.id === id);
  const fb = PRESTATAIRE_FALLBACK;
  if (!provider) {
    return {
      nom: fb.nom, metier: fb.metier, ville: fb.ville, region: fb.region,
      note: fb.note, nbAvis: fb.nbAvis, verifie: fb.verifie, prixMin: fb.prixMin,
      telephone: fb.telephone, email: fb.email, site: fb.site, instagram: fb.instagram,
      photo: fb.photo, couverture: fb.couverture, description: fb.description,
      specialites: fb.specialites, experience: fb.experience, zones: fb.zones,
      langues: fb.langues, equipements: fb.equipements, galerie: GALERIE,
    };
  }

  const emailSlug = provider.nom.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  return {
    nom: provider.nom,
    metier: provider.metier,
    ville: provider.ville,
    region: provider.region,
    note: provider.note,
    nbAvis: provider.avis,
    verifie: provider.verifie,
    prixMin: provider.prixMin,
    telephone: fb.telephone,
    email: `contact@${emailSlug}.fr`,
    site: `www.${emailSlug}.fr`,
    instagram: `@${emailSlug}`,
    photo: provider.photo,
    couverture: COUVERTURES[provider.metier] ?? fb.couverture,
    description: provider.description + `\n\nBasé(e) à ${provider.ville} en ${provider.region}, nous intervenons sur toute la région et dans toute la France sur devis. Contactez-nous pour en savoir plus sur nos disponibilités et nos formules.`,
    specialites: fb.specialites,
    experience: fb.experience,
    zones: fb.zones,
    langues: fb.langues,
    equipements: fb.equipements,
    galerie: GALERIE,
  };
}

function buildPrestataireFromSupabase(p: SupabasePrestataire): PrestatireData {
  const rawPhotos = p.photos ?? [];
  const photos = rawPhotos.map(buildPhotoUrl).filter((u): u is string => !!u);
  const avatar = buildPhotoUrl(p.avatar_url) ?? photos[0] ?? null;
  return {
    nom: p.nom_entreprise,
    metier: p.categorie,
    ville: p.ville ?? "",
    region: p.departement ?? "",
    note: p.note_moyenne,
    nbAvis: p.nb_avis,
    verifie: p.verifie,
    prixMin: p.prix_depart ?? null,
    telephone: p.telephone ?? null,
    email: null,
    site: p.site_web ?? null,
    instagram: null,
    photo: avatar,
    couverture: buildPhotoUrl(p.cover_url) ?? COUVERTURES[p.categorie] ?? null,
    description: p.description ?? null,
    specialites: [],
    experience: null,
    zones: [],
    langues: [],
    equipements: [],
    galerie: photos.map((src, i) => ({ id: i + 1, src, alt: `Photo ${i + 1}`, tall: i % 3 === 0 })),
  };
}

const GALERIE = [
  { id: 1, src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80", alt: "Cérémonie en plein air", tall: true },
  { id: 2, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80", alt: "Premier regard", tall: false },
  { id: 3, src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80", alt: "Couple au coucher de soleil", tall: false },
  { id: 4, src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80", alt: "Détail robe de mariée", tall: true },
  { id: 5, src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80", alt: "Bouquet de fleurs", tall: false },
  { id: 6, src: "https://images.unsplash.com/photo-1470213764058-42543a5d85c7?w=600&q=80", alt: "Danse des mariés", tall: false },
  { id: 7, src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80", alt: "Cérémonie laïque", tall: true },
  { id: 8, src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", alt: "Table de réception", tall: false },
  { id: 9, src: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&q=80", alt: "Confettis", tall: false },
];


const TARIFS = [
  {
    nom: "Formule Essentielle",
    prix: 1900,
    duree: "8h de reportage",
    inclus: [
      "8 heures de présence le jour J",
      "300 photos retouchées HD",
      "Galerie privée en ligne (1 an)",
      "Fichiers numériques HD",
      "Préparatifs → soirée",
    ],
    badge: null,
  },
  {
    nom: "Formule Complète",
    prix: 2700,
    duree: "Journée entière",
    inclus: [
      "Journée complète (jusqu'à 12h)",
      "600 photos retouchées HD",
      "Séance engagement offerte",
      "Galerie privée en ligne (2 ans)",
      "Album 30x30cm (40 pages) offert",
      "Fichiers numériques HD",
    ],
    badge: "Populaire",
  },
  {
    nom: "Formule Premium",
    prix: 3800,
    duree: "2 jours + extras",
    inclus: [
      "2 jours de reportage",
      "Photos illimitées retouchées HD",
      "Séance engagement offerte",
      "Séance trash the dress offerte",
      "2 albums 30x30cm",
      "Drone inclus",
      "Livre photo A3 pour les parents",
    ],
    badge: "Best-seller",
  },
];

const OPTIONS = [
  { label: "Séance engagement", prix: "350 €" },
  { label: "Album photo 30×30cm (40 pages)", prix: "450 €" },
  { label: "Drone (prise de vue aérienne)", prix: "300 €" },
  { label: "Séance trash the dress", prix: "400 €" },
  { label: "Deuxième photographe", prix: "600 €" },
  { label: "Impression fine art (tirage A2)", prix: "120 €" },
];

const DISPONIBILITES = [
  { jour: 5, dispo: true },
  { jour: 6, dispo: false },
  { jour: 12, dispo: true },
  { jour: 13, dispo: false },
  { jour: 19, dispo: true },
  { jour: 20, dispo: true },
  { jour: 26, dispo: false },
  { jour: 27, dispo: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ note, size = "sm" }: { note: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${sizes[size]} ${i <= Math.round(note) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

type PrestatireData = {
  nom: string;
  metier: string;
  ville: string;
  region: string;
  note: number;
  nbAvis: number;
  verifie: boolean;
  prixMin: number | null;
  telephone: string | null;
  email: string | null;
  site: string | null;
  instagram: string | null;
  photo: string | null;
  couverture: string | null;
  description: string | null;
  specialites: string[];
  experience: number | null;
  zones: string[];
  langues: string[];
  equipements: string[];
  galerie: { id: number; src: string; alt: string; tall: boolean }[];
};

function SectionAPropos({ prestataire }: { prestataire: PrestatireData }) {
  const PRESTATAIRE = prestataire;
  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
        {PRESTATAIRE.description ? (
          PRESTATAIRE.description.split("\n\n").map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed mb-3 last:mb-0">
              {para}
            </p>
          ))
        ) : (
          <p className="text-gray-400 italic">Description non renseignée.</p>
        )}
      </div>

      {/* Spécialités */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Spécialités</h3>
        {PRESTATAIRE.specialites.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {PRESTATAIRE.specialites.map((s) => (
              <span
                key={s}
                className="bg-rose-50 text-rose-600 text-sm font-medium px-3 py-1.5 rounded-full border border-rose-100"
              >
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">Spécialités non renseignées.</p>
        )}
      </div>

      {/* Infos grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expérience */}
        {PRESTATAIRE.experience !== null && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Expérience</p>
              <p className="text-gray-900 font-semibold">{PRESTATAIRE.experience} ans</p>
            </div>
          </div>
        )}

        {/* Zone */}
        {PRESTATAIRE.zones.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Zone d&apos;intervention</p>
              <div className="space-y-0.5">
                {PRESTATAIRE.zones.slice(0, 4).map((z) => (
                  <p key={z} className="text-sm text-gray-700">{z}</p>
                ))}
                {PRESTATAIRE.zones[5] && <p className="text-xs text-gray-400 italic">{PRESTATAIRE.zones[5]}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Langues */}
        {PRESTATAIRE.langues.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Langues parlées</p>
              <div className="flex gap-2 flex-wrap mt-1">
                {PRESTATAIRE.langues.map((l) => (
                  <span key={l} className="bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-full">{l}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Équipements */}
        {PRESTATAIRE.equipements.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Équipements</p>
              <ul className="space-y-1">
                {PRESTATAIRE.equipements.map((e) => (
                  <li key={e} className="text-sm text-gray-700 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-rose-400 rounded-full flex-shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Galerie : carousel mobile + grille desktop + lightbox ───────────────────

function GalerieCarousel({ galerie }: { galerie: PrestatireData["galerie"] }) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selected, setSelected] = useState<null | number>(null);
  const touchStartX = useRef<number | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);

  const currentLightboxIndex = selected !== null ? galerie.findIndex((p) => p.id === selected) : -1;

  const lightboxNext = useCallback(() => {
    if (currentLightboxIndex < 0) return;
    setSelected(galerie[(currentLightboxIndex + 1) % galerie.length].id);
  }, [currentLightboxIndex, galerie]);

  const lightboxPrev = useCallback(() => {
    if (currentLightboxIndex < 0) return;
    setSelected(galerie[(currentLightboxIndex - 1 + galerie.length) % galerie.length].id);
  }, [currentLightboxIndex, galerie]);

  useEffect(() => {
    if (selected === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") lightboxNext();
      else if (e.key === "ArrowLeft") lightboxPrev();
      else if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, lightboxNext, lightboxPrev]);

  if (galerie.length === 0) return null;

  return (
    <>
      {/* ── Mobile : carousel swipeable ── */}
      <div className="sm:hidden">
        <div
          className="relative overflow-hidden rounded-xl aspect-[4/3]"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50) setCarouselIndex((i) => Math.min(i + 1, galerie.length - 1));
            else if (diff < -50) setCarouselIndex((i) => Math.max(i - 1, 0));
            touchStartX.current = null;
          }}
          onClick={() => setSelected(galerie[carouselIndex].id)}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {galerie.map((photo) => (
              <div key={photo.id} className="min-w-full h-full relative flex-shrink-0">
                <img src={photo.src} alt={photo.alt} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Compteur */}
          <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
            {carouselIndex + 1} / {galerie.length}
          </div>

          {/* Flèches mobile */}
          {carouselIndex > 0 && (
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setCarouselIndex((i) => Math.max(i - 1, 0)); }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {carouselIndex < galerie.length - 1 && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setCarouselIndex((i) => Math.min(i + 1, galerie.length - 1)); }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Dots */}
          {galerie.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {galerie.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === carouselIndex ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop : grille masonry ── */}
      <div className="hidden sm:block">
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {galerie.map((photo) => (
            <div
              key={photo.id}
              className={`break-inside-avoid relative overflow-hidden rounded-xl cursor-pointer group ${photo.tall ? "aspect-[3/4]" : "aspect-square"}`}
              onClick={() => setSelected(photo.id)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lightbox (mobile + desktop) ── */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          onTouchStart={(e) => { lightboxTouchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (lightboxTouchStartX.current === null) return;
            const diff = lightboxTouchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50) lightboxNext();
            else if (diff < -50) lightboxPrev();
            lightboxTouchStartX.current = null;
          }}
        >
          {/* Fermer */}
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelected(null); }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Précédent */}
          {galerie.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Suivant */}
          {galerie.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const photo = galerie.find((p) => p.id === selected);
              return photo ? (
                <img src={photo.src} alt={photo.alt} className="absolute inset-0 w-full h-full object-contain" />
              ) : null;
            })()}
          </div>

          {/* Compteur */}
          {galerie.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none">
              {currentLightboxIndex + 1} / {galerie.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SectionGalerie({ galerie }: { galerie: PrestatireData["galerie"] }) {
  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Galerie</h2>
          {galerie.length > 0 && <span className="text-sm text-gray-400">{galerie.length} photo{galerie.length > 1 ? "s" : ""}</span>}
        </div>

        {galerie.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm italic">Aucune photo dans la galerie.</p>
          </div>
        ) : (
          <GalerieCarousel galerie={galerie} />
        )}
      </div>
    </div>
  );
}

// ─── Section combinée À propos + Galerie ─────────────────────────────────────

function SectionAProposGalerie({ prestataire }: { prestataire: PrestatireData }) {

  return (
    <div className="space-y-10">
      {/* Description */}
      <div>
        {prestataire.description ? (
          <div className="space-y-3">
            {prestataire.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-[15px]">
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">Description non renseignée.</p>
        )}
      </div>

      {/* Spécialités */}
      {prestataire.specialites.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Spécialités</h3>
          <div className="flex flex-wrap gap-2">
            {prestataire.specialites.map((s) => (
              <span
                key={s}
                className="text-sm font-medium px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: "#FFF0F5", color: "#F06292", borderColor: "#FBBDD9" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Infos rapides */}
      {(prestataire.experience !== null || prestataire.zones.length > 0 || prestataire.langues.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prestataire.experience !== null && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0F5" }}>
                <svg className="w-4.5 h-4.5" style={{ color: "#F06292" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Expérience</p>
                <p className="text-gray-900 font-semibold text-sm">{prestataire.experience} ans</p>
              </div>
            </div>
          )}
          {prestataire.zones.length > 0 && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#FFF0F5" }}>
                <svg className="w-4.5 h-4.5" style={{ color: "#F06292" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Zone d&apos;intervention</p>
                {prestataire.zones.slice(0, 3).map((z) => (
                  <p key={z} className="text-sm text-gray-700">{z}</p>
                ))}
              </div>
            </div>
          )}
          {prestataire.langues.length > 0 && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0F5" }}>
                <svg className="w-4.5 h-4.5" style={{ color: "#F06292" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Langues</p>
                <div className="flex gap-1.5 flex-wrap">
                  {prestataire.langues.map((l) => (
                    <span key={l} className="bg-white text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-200">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Galerie */}
      {prestataire.galerie.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Galerie</h2>
            <span className="text-sm text-gray-400">{prestataire.galerie.length} photo{prestataire.galerie.length > 1 ? "s" : ""}</span>
          </div>
          <GalerieCarousel galerie={prestataire.galerie} />
        </div>
      )}
    </div>
  );
}

// ─── Types avis ──────────────────────────────────────────────────────────────

type AvisWithMarie = {
  id: string
  note: number
  commentaire: string | null
  date_mariage_couple: string | null
  created_at: string
  marie_id: string
  reponse_prestataire: string | null
  reponse_at: string | null
  maries: {
    prenom_marie1: string
    prenom_marie2: string | null
  } | null
}


// ─── Section avis réels ────────────────────────────────────────────────────────

function SectionAvis({ prestataireId }: { prestataireId: string | undefined }) {
  const [prestataire, setPrestataire] = useState<{ id: string; user_id: string; nom_entreprise: string } | null | undefined>(undefined);
  const [avis, setAvis] = useState<AvisWithMarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [marie, setMarie] = useState<Marie | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Réponse prestataire
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Form
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [dateMariage, setDateMariage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchAvis = async (prestId: string) => {
    const { data } = await supabase
      .from("avis")
      .select("*, maries(prenom_marie1, prenom_marie2)")
      .eq("prestataire_id", prestId)
      .order("created_at", { ascending: false });
    return (data ?? []) as AvisWithMarie[];
  };

  useEffect(() => {
    if (!prestataireId) {
      setLoading(false);
      setPrestataire(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);

      const [{ data: { session } }, { data: prest }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("prestataires").select("id, user_id, nom_entreprise").eq("id", prestataireId).maybeSingle(),
      ]);

      if (cancelled) return;

      setLoggedIn(!!session);
      setPrestataire(prest ?? null);

      if (!prest) {
        setLoading(false);
        return;
      }

      if (session && prest.user_id === session.user.id) {
        setIsOwner(true);
      }

      const reviews = await fetchAvis(prest.id);
      if (cancelled) return;
      setAvis(reviews);

      if (session) {
        const role = session.user.user_metadata?.role ?? "marie";
        console.log("[SectionAvis] session user_id:", session.user.id);
        console.log("[SectionAvis] user_metadata:", session.user.user_metadata);
        console.log("[SectionAvis] role détecté:", role);
        setUserRole(role);

        if (role === "marie") {
          const { data: marieData, error: marieError } = await supabase
            .from("maries")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();
          console.log("[SectionAvis] marieData:", marieData, "marieError:", marieError);
          if (cancelled) return;
          setMarie(marieData ?? null);
          if (marieData) {
            setAlreadyReviewed(reviews.some((r) => r.marie_id === marieData.id));
          }
        }
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [prestataireId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[SectionAvis] handleSubmit - prestataire:", prestataire, "marie:", marie);
    if (!prestataire) {
      setFormError("Impossible de trouver le prestataire. Rechargez la page.");
      return;
    }
    if (!marie) {
      setFormError("Votre profil marié est introuvable. Vérifiez votre compte.");
      return;
    }
    setSubmitting(true);
    setFormError("");

    const insertPayload = {
      prestataire_id: prestataire.id,
      marie_id: marie.id,
      note,
      commentaire: commentaire.trim() || null,
      date_mariage_couple: dateMariage || null,
    };
    console.log("[SectionAvis] insert payload:", insertPayload);

    const { error } = await supabase.from("avis").insert(insertPayload);
    console.log("[SectionAvis] insert error:", error);

    if (error) {
      setFormError(`Erreur : ${error.message} (code: ${error.code})`);
      setSubmitting(false);
      return;
    }

    // Notification email au prestataire (fire-and-forget)
    try {
      const { data: prestUser } = await supabase
        .from("users")
        .select("email")
        .eq("id", prestataire.user_id)
        .maybeSingle();

      const reviewerName = marie.prenom_marie2
        ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
        : marie.prenom_marie1;

      if (prestUser?.email) {
        fetch("/api/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new_avis",
            recipientEmail: prestUser.email,
            recipientName: prestataire.nom_entreprise,
            reviewerName,
            note,
            commentaire: commentaire.trim() || null,
            prestaireId: prestataire.id,
          }),
        }).catch(() => {});
      }
    } catch {}

    const reviews = await fetchAvis(prestataire.id);
    setAvis(reviews);
    setAlreadyReviewed(true);
    setFormSuccess(true);
    setSubmitting(false);
  };

  const handleReplySubmit = async (avisId: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    setReplyError("");

    const { error } = await supabase
      .from("avis")
      .update({ reponse_prestataire: replyText.trim(), reponse_at: new Date().toISOString() })
      .eq("id", avisId);

    if (error) {
      setReplyError("Erreur lors de la publication. Réessayez.");
      setReplySubmitting(false);
      return;
    }

    if (prestataire) {
      const reviews = await fetchAvis(prestataire.id);
      setAvis(reviews);
    }
    setReplyingToId(null);
    setReplyText("");
    setReplySubmitting(false);
  };

  const noteMoyenne =
    avis.length > 0
      ? Math.round((avis.reduce((s, a) => s + a.note, 0) / avis.length) * 10) / 10
      : 0;

  const repartition = [5, 4, 3, 2, 1].map((n) => ({
    note: n,
    count: avis.filter((a) => a.note === n).length,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full" style={{ borderTopColor: "#F06292" }} />
      </div>
    );
  }

  // Prestataire not in Supabase yet
  if (prestataire === null) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center">
        <p className="text-gray-400 text-sm">Les avis seront disponibles lorsque ce prestataire aura activé son profil.</p>
      </div>
    );
  }

  const marieName = (a: AvisWithMarie) => {
    if (!a.maries) return "Marié(e)";
    const { prenom_marie1, prenom_marie2 } = a.maries;
    return prenom_marie2 ? `${prenom_marie1} & ${prenom_marie2}` : prenom_marie1;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const formatDateMariage = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5">

      {/* ── En-tête synthèse ── */}
      {avis.length > 0 ? (
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-8 tracking-tight">Avis clients</h2>
          <div className="flex flex-col sm:flex-row gap-10 items-start sm:items-center">
            {/* Score global */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <span className="text-6xl font-bold tracking-tight text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                {noteMoyenne}
              </span>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4"
                    fill={i <= Math.round(noteMoyenne) ? "#F06292" : "none"}
                    stroke={i <= Math.round(noteMoyenne) ? "none" : "#d1d5db"}
                    strokeWidth="1.5"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-400">{avis.length} avis</span>
            </div>

            {/* Barres répartition */}
            <div className="flex-1 w-full space-y-2">
              {repartition.map(({ note: n, count }) => {
                const pct = avis.length > 0 ? (count / avis.length) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-2 text-right leading-none">{n}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: "#F06292" }}
                      />
                    </div>
                    <span className="text-xs text-gray-300 w-3 text-right leading-none">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-5">
            {[1,2,3,4,5].map((i) => (
              <svg key={i} className="w-6 h-6 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="font-medium text-gray-800 mb-1.5">Aucun avis pour le moment</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Soyez le premier à partager votre expérience avec ce prestataire.
          </p>
        </div>
      )}

      {/* ── Formulaire ── */}
      {!loggedIn && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Vous avez travaillé avec ce prestataire ?<br/>Partagez votre expérience.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F06292" }}
          >
            Laisser un avis
          </Link>
        </div>
      )}

      {loggedIn && userRole === "prestataire" && (
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-400">Seuls les mariés peuvent laisser un avis.</p>
        </div>
      )}

      {loggedIn && userRole === "marie" && !alreadyReviewed && !formSuccess && (
        <div className="bg-white rounded-2xl p-8">
          <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Laisser un avis</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Note *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNote(i)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
                  >
                    <svg
                      className="w-9 h-9 transition-all duration-150"
                      fill={i <= note ? "#F06292" : "none"}
                      stroke={i <= note ? "none" : "#e5e7eb"}
                      strokeWidth="1.5"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-400">{note}/5</span>
              </div>
            </div>

            {/* Date du mariage */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Date de votre mariage <span className="normal-case font-normal">(optionnel)</span>
              </label>
              <input
                type="date"
                value={dateMariage}
                onChange={(e) => setDateMariage(e.target.value)}
                className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Commentaire <span className="normal-case font-normal">(optionnel)</span>
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                placeholder="Décrivez votre expérience…"
                className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-400">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-full transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: "#F06292" }}
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publication…
                </>
              ) : "Publier mon avis"}
            </button>
          </form>
        </div>
      )}

      {(formSuccess || alreadyReviewed) && loggedIn && userRole === "marie" && (
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#FFF0F5" }}>
            <svg className="w-5 h-5" style={{ color: "#F06292" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-800">
            {formSuccess ? "Merci, votre avis a été publié." : "Vous avez déjà laissé un avis."}
          </p>
        </div>
      )}

      {/* ── Liste des avis ── */}
      {avis.length > 0 && (
        <div className="space-y-3">
          {avis.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                    style={{ backgroundColor: "#F06292" }}
                  >
                    {marieName(a).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{marieName(a)}</p>
                    {a.date_mariage_couple && (
                      <p className="text-xs text-gray-400 mt-0.5">Mariage · {formatDateMariage(a.date_mariage_couple)}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5"
                        fill={i <= a.note ? "#F06292" : "none"}
                        stroke={i <= a.note ? "none" : "#e5e7eb"}
                        strokeWidth="1.5"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300">{formatDate(a.created_at)}</span>
                </div>
              </div>
              {a.commentaire && (
                <p className="text-gray-500 text-sm leading-relaxed mt-1">{a.commentaire}</p>
              )}

              {/* ── Réponse existante ── */}
              {a.reponse_prestataire && (
                <div className="mt-4 pl-4 border-l-2" style={{ borderColor: "#F06292" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#F06292" }}>Réponse du prestataire</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.reponse_prestataire}</p>
                  {a.reponse_at && (
                    <p className="text-xs text-gray-300 mt-1">{formatDate(a.reponse_at)}</p>
                  )}
                </div>
              )}

              {/* ── Bouton Répondre (propriétaire uniquement) ── */}
              {isOwner && !a.reponse_prestataire && replyingToId !== a.id && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => { setReplyingToId(a.id); setReplyText(""); setReplyError(""); }}
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: "#F06292" }}
                  >
                    Répondre
                  </button>
                </div>
              )}

              {/* ── Formulaire de réponse ── */}
              {isOwner && replyingToId === a.id && (
                <div className="mt-4 pl-4 border-l-2" style={{ borderColor: "#F06292" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#F06292" }}>Votre réponse</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Rédigez votre réponse publique…"
                    className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
                    autoFocus
                  />
                  {replyError && (
                    <p className="text-xs text-red-400 mt-1">{replyError}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      disabled={replySubmitting || !replyText.trim()}
                      onClick={() => handleReplySubmit(a.id)}
                      className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-4 py-2 rounded-full transition-opacity disabled:opacity-40 hover:opacity-90"
                      style={{ backgroundColor: "#F06292" }}
                    >
                      {replySubmitting ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Publication…
                        </>
                      ) : "Publier"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplyingToId(null); setReplyText(""); setReplyError(""); }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* ── Modifier la réponse existante ── */}
              {isOwner && a.reponse_prestataire && replyingToId !== a.id && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => { setReplyingToId(a.id); setReplyText(a.reponse_prestataire ?? ""); setReplyError(""); }}
                    className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
                  >
                    Modifier la réponse
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTarifs({ tarifs, options }: { tarifs: typeof TARIFS; options: typeof OPTIONS }) {
  if (tarifs.length === 0 && options.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <p className="text-gray-400 text-sm italic">Tarifs non renseignés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formules */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Formules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tarifs.map((t) => (
            <div
              key={t.nom}
              className={`relative bg-white rounded-2xl p-5 shadow-sm border-2 flex flex-col ${
                t.badge === "Populaire" ? "border-rose-300 shadow-rose-100/80 shadow-lg" : "border-gray-100"
              }`}
            >
              {t.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${
                    t.badge === "Populaire"
                      ? "bg-rose-400 text-white"
                      : "bg-gray-900 text-white"
                  }`}
                >
                  {t.badge}
                </span>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900">{t.nom}</h3>
                <p className="text-sm text-gray-400">{t.duree}</p>
              </div>
              <div className="mb-5">
                <span className="text-3xl font-bold text-gray-900">{t.prix.toLocaleString("fr-FR")} €</span>
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {t.inclus.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  t.badge === "Populaire"
                    ? "bg-rose-400 hover:bg-rose-500 text-white shadow-sm"
                    : "border-2 border-rose-200 text-rose-500 hover:bg-rose-50"
                }`}
              >
                Choisir cette formule
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      {options.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Options supplémentaires</h3>
          <div className="divide-y divide-gray-100">
            {options.map((o) => (
              <div key={o.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-gray-700 text-sm">{o.label}</span>
                <span className="text-gray-900 font-semibold text-sm">{o.prix}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">
            * Les options peuvent être ajoutées à n&apos;importe quelle formule. Devis personnalisé sur demande.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ prestataire }: { prestataire: PrestatireData }) {
  const PRESTATAIRE = prestataire;

  return (
    <div className="space-y-4">
      {/* Contact card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-rose-100 bg-gray-100 flex items-center justify-center">
            {PRESTATAIRE.photo ? (
              <img src={PRESTATAIRE.photo} alt={PRESTATAIRE.nom} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-lg font-bold leading-none select-none">
                {PRESTATAIRE.nom.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{PRESTATAIRE.nom}</p>
            <p className="text-xs text-gray-400">{PRESTATAIRE.metier}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
          {PRESTATAIRE.telephone ? (
            <a
              href={`tel:${PRESTATAIRE.telephone}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-50 group-hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              {PRESTATAIRE.telephone}
            </a>
          ) : (
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="italic">Téléphone non renseigné</span>
            </div>
          )}
          {PRESTATAIRE.email ? (
            <a
              href={`mailto:${PRESTATAIRE.email}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-50 group-hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {PRESTATAIRE.email}
            </a>
          ) : null}
          {PRESTATAIRE.site ? (
            <a
              href={PRESTATAIRE.site.startsWith("http") ? PRESTATAIRE.site : `https://${PRESTATAIRE.site}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-50 group-hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              {PRESTATAIRE.site}
            </a>
          ) : null}
          {!PRESTATAIRE.telephone && !PRESTATAIRE.email && !PRESTATAIRE.site && (
            <p className="text-xs text-gray-300 italic text-center py-1">Coordonnées non renseignées</p>
          )}
        </div>
      </div>

      {/* Réseaux sociaux — visible uniquement pour les plans payants */}
      {PRESTATAIRE.verifie && <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Réseaux sociaux</h3>
        <div className="flex gap-3">
          <a
            href="#"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </a>
          <a
            href="#"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
        </div>
        <a
          href="#"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Partager ce profil
        </a>
      </div>}

      {/* Badge vérifié */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Prestataire vérifié</p>
            <p className="text-xs text-gray-500">Identité et qualité contrôlées par InstantMariage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PrestataireProfil({ id }: { id?: string }) {
  const router = useRouter();

  const numId = id ? Number(id) : NaN;
  const isNumericId = id !== undefined && !isNaN(numId) && String(numId) === id;

  const [PRESTATAIRE, setPRESTATAIRE] = useState<PrestatireData>(() =>
    isNumericId ? buildPrestataire(numId) : {
      nom: "", metier: "", ville: "", region: "",
      note: 0, nbAvis: 0, verifie: false, prixMin: null,
      telephone: null, email: null, site: null, instagram: null,
      photo: null, couverture: null, description: null,
      specialites: [], experience: null, zones: [], langues: [], equipements: [],
      galerie: [],
    }
  );

  useEffect(() => {
    if (!id || isNumericId) return;
    supabase
      .from("prestataires")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPRESTATAIRE(buildPrestataireFromSupabase(data as SupabasePrestataire));
          // Enregistrer la vue (fire-and-forget)
          supabase.from("profile_views").insert({ prestataire_id: id });
        }
      });
  }, [id, isNumericId]);

  const [activeTab, setActiveTab] = useState<Tab>("avis");
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactModal, setContactModal] = useState<"not-registered" | "not-logged" | "not-marie" | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [signalMotif, setSignalMotif] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalSent, setSignalSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showShareMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        setShowShareMenu(false);
      }, 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
    setShowShareMenu(false);
  };

  // Charger l'état favori depuis Supabase (UUID prestataires uniquement)
  useEffect(() => {
    if (isNumericId || !id) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("favoris")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("prestataire_id", id)
        .maybeSingle();
      setSaved(!!data);
    });
  }, [id, isNumericId]);

  const handleSave = async () => {
    if (isNumericId || !id) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setContactModal("not-logged");
      return;
    }
    setSaveLoading(true);
    if (saved) {
      await supabase
        .from("favoris")
        .delete()
        .eq("user_id", session.user.id)
        .eq("prestataire_id", id);
      setSaved(false);
    } else {
      await supabase.from("favoris").insert({
        user_id: session.user.id,
        prestataire_id: id,
      });
      setSaved(true);
    }
    setSaveLoading(false);
  };

  const handleSignalement = async () => {
    if (!signalMotif || !signalDescription.trim()) return;
    setSignalLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/signalements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prestataire_id: id,
        prestataire_nom: PRESTATAIRE.nom,
        user_id: session?.user.id ?? null,
        motif: signalMotif,
        description: signalDescription,
      }),
    });
    setSignalLoading(false);
    setSignalSent(true);
  };

  const handleContacter = async () => {
    setContactLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setContactLoading(false);
      setContactModal("not-logged");
      return;
    }

    const role = session.user.user_metadata?.role ?? "marie";
    if (role === "prestataire") {
      setContactLoading(false);
      setContactModal("not-marie");
      return;
    }

    const userId = session.user.id;

    // Chercher le prestataire dans Supabase par nom_entreprise
    const { data: prest } = await supabase
      .from("prestataires")
      .select("id, user_id")
      .eq("nom_entreprise", PRESTATAIRE.nom)
      .maybeSingle();

    if (!prest) {
      setContactLoading(false);
      setContactModal("not-registered");
      return;
    }

    const otherUserId = prest.user_id;

    // Chercher ou créer une conversation (participants triés pour éviter les doublons)
    const [p1, p2] = [userId, otherUserId].sort();

    let { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant1_id", p1)
      .eq("participant2_id", p2)
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ participant1_id: p1, participant2_id: p2 })
        .select("id")
        .single();
      conv = newConv;
    }

    setContactLoading(false);
    if (conv) {
      router.push(`/messages/${conv.id}`);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "avis", label: "Avis" },
    { id: "tarifs", label: "Tarifs" },
  ];

  return (
    <div className="pt-16 md:pt-20 bg-white min-h-screen">

      {/* ── Cover ─────────────────────────────────────────────────────────── */}
      <div className="relative h-60 sm:h-80 md:h-[440px] w-full overflow-hidden">
        {PRESTATAIRE.couverture ? (
          <img
            src={PRESTATAIRE.couverture}
            alt="Photo de couverture"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200" />
        )}
        {/* Dégradé élégant : transparent en haut, noir profond en bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 text-sm font-medium px-3.5 py-2 rounded-full shadow-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      {/* ── Barre de profil ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20 pb-6">

            {/* Avatar */}
            <div
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center"
              style={{ boxShadow: "0 0 0 4px #fff, 0 4px 24px rgba(0,0,0,0.15)" }}
            >
              {PRESTATAIRE.photo ? (
                <img
                  src={PRESTATAIRE.photo}
                  alt={PRESTATAIRE.nom}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-4xl sm:text-5xl font-bold leading-none select-none">
                  {PRESTATAIRE.nom.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0 pt-1 sm:pt-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                  {PRESTATAIRE.nom}
                </h1>
                {PRESTATAIRE.verifie && (
                  <span title="Prestataire vérifié par InstantMariage" className="flex-shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#1D9BF0"/>
                      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: "#F06292" }}
                >
                  {PRESTATAIRE.metier}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {PRESTATAIRE.ville}{PRESTATAIRE.region ? `, ${PRESTATAIRE.region}` : ""}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {PRESTATAIRE.note > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Stars note={PRESTATAIRE.note} size="sm" />
                    <span className="font-bold text-gray-900">{PRESTATAIRE.note}</span>
                    <span className="text-gray-400">({PRESTATAIRE.nbAvis} avis)</span>
                  </span>
                )}
                {PRESTATAIRE.prixMin !== null && (
                  <span className="text-gray-500">
                    À partir de <span className="font-semibold text-gray-800">{PRESTATAIRE.prixMin.toLocaleString("fr-FR")} €</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 sm:pb-1 flex-shrink-0">
              <button
                onClick={handleContacter}
                disabled={contactLoading}
                className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all duration-200 disabled:opacity-60 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#F06292", boxShadow: "0 4px 14px rgba(240,98,146,0.35)" }}
              >
                {contactLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
                Contacter
              </button>
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu((v) => !v)}
                  className="flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-full text-sm border-2 transition-all duration-200 hover:bg-pink-50 active:scale-95"
                  style={{ borderColor: "#F06292", color: "#F06292" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Partager
                </button>
                {showShareMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 transition-colors"
                    >
                      {linkCopied ? (
                        <>
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600 font-medium">Lien copié !</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0" style={{ color: "#F06292" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copier le lien
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 transition-colors border-t border-gray-100"
                    >
                      <svg className="w-4 h-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Partager sur WhatsApp
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saveLoading || isNumericId}
                aria-label={saved ? "Retirer des favoris" : "Sauvegarder"}
                className="flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-full text-sm border-2 transition-all duration-200 hover:bg-pink-50 active:scale-95 disabled:opacity-50"
                style={{ borderColor: "#F06292", color: "#F06292" }}
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill={saved ? "#F06292" : "none"} viewBox="0 0 24 24" stroke="#F06292" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                {saved ? "Sauvegardé" : "Sauvegarder"}
              </button>
              <button
                onClick={() => { setShowSignalModal(true); setSignalSent(false); setSignalMotif(""); setSignalDescription(""); }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs font-medium transition-colors py-2 px-1"
                title="Signaler ce prestataire"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H13l-1-1H5a2 2 0 00-2 2zm0 0h16" />
                </svg>
                Signaler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Colonne principale */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Section Description + Galerie — toujours visible */}
              <div className="bg-white rounded-3xl p-7 shadow-sm">
                <SectionAProposGalerie prestataire={PRESTATAIRE} />
              </div>

              {/* Onglets Avis / Tarifs */}
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-gray-100">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? "text-[#F06292] border-b-2 border-[#F06292] bg-white"
                          : "text-gray-400 hover:text-gray-700 bg-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-7">
                  {activeTab === "avis" && <SectionAvis prestataireId={isNumericId ? undefined : id} />}
                  {activeTab === "tarifs" && <SectionTarifs tarifs={isNumericId ? TARIFS : []} options={isNumericId ? OPTIONS : []} />}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-8">
                <Sidebar prestataire={PRESTATAIRE} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modals contact */}
      {contactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setContactModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {contactModal === "not-logged" && (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#FFF0F5" }}
                >
                  <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Connexion requise</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Connectez-vous à votre compte marié pour envoyer un message.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full text-center text-white text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
                    style={{ background: "#F06292" }}
                  >
                    Se connecter
                  </Link>
                  <button
                    onClick={() => setContactModal(null)}
                    className="text-sm text-gray-400 hover:text-gray-600 py-2"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}

            {contactModal === "not-marie" && (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#FFF0F5" }}
                >
                  <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Compte marié requis</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Seuls les futurs mariés peuvent contacter les prestataires via la messagerie.
                </p>
                <button
                  onClick={() => setContactModal(null)}
                  className="w-full text-white text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
                  style={{ background: "#F06292" }}
                >
                  Compris
                </button>
              </>
            )}

            {contactModal === "not-registered" && (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#FFF0F5" }}
                >
                  <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Prestataire non inscrit</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Ce prestataire n&apos;a pas encore créé son compte InstantMariage. Découvrez d&apos;autres prestataires dans notre annuaire.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/annuaire"
                    className="w-full text-center text-white text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
                    style={{ background: "#F06292" }}
                    onClick={() => setContactModal(null)}
                  >
                    Voir l&apos;annuaire
                  </Link>
                  <button
                    onClick={() => setContactModal(null)}
                    className="text-sm text-gray-400 hover:text-gray-600 py-2"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal signalement */}
      {showSignalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowSignalModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {signalSent ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-green-50">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Signalement envoyé</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Merci pour votre signalement. Notre équipe l&apos;examinera dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setShowSignalModal(false)}
                  className="w-full text-white text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
                  style={{ background: "#F06292" }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF0F5" }}>
                    <svg className="w-5 h-5" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H13l-1-1H5a2 2 0 00-2 2zm0 0h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">Signaler ce prestataire</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Votre signalement sera examiné par notre équipe.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Motif du signalement</label>
                    <select
                      value={signalMotif}
                      onChange={(e) => setSignalMotif(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 bg-white"
                    >
                      <option value="">Sélectionner un motif…</option>
                      <option value="Arnaque / Fraude">Arnaque / Fraude</option>
                      <option value="Fausses photos">Fausses photos</option>
                      <option value="Comportement inapproprié">Comportement inapproprié</option>
                      <option value="Faux avis">Faux avis</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                    <textarea
                      value={signalDescription}
                      onChange={(e) => setSignalDescription(e.target.value)}
                      placeholder="Décrivez le problème en quelques mots…"
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    onClick={handleSignalement}
                    disabled={signalLoading || !signalMotif || !signalDescription.trim()}
                    className="w-full text-white text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "#F06292" }}
                  >
                    {signalLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Envoyer le signalement
                  </button>
                  <button
                    onClick={() => setShowSignalModal(false)}
                    className="text-sm text-gray-400 hover:text-gray-600 py-2"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
