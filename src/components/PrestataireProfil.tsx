"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PROVIDERS } from "@/data/providers";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "apropos" | "galerie" | "avis" | "tarifs";

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

// ─── Construction du profil depuis un provider ────────────────────────────────

function buildPrestataire(id: number) {
  const provider = PROVIDERS.find((p) => p.id === id);
  if (!provider) return PRESTATAIRE_FALLBACK;

  const firstNameMatch = provider.nom.match(/^(\S+)/);
  const prenom = firstNameMatch ? firstNameMatch[1] : provider.nom.split(" ")[0];
  const emailSlug = provider.nom.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);

  return {
    ...PRESTATAIRE_FALLBACK,
    nom: provider.nom,
    metier: provider.metier,
    ville: provider.ville,
    region: provider.region,
    note: provider.note,
    nbAvis: provider.avis,
    verifie: provider.verifie,
    prixMin: provider.prixMin,
    photo: provider.photo,
    couverture: COUVERTURES[provider.metier] ?? PRESTATAIRE_FALLBACK.couverture,
    email: `contact@${emailSlug}.fr`,
    site: `www.${emailSlug}.fr`,
    instagram: `@${emailSlug}`,
    description: provider.description + `\n\nBasé(e) à ${provider.ville} en ${provider.region}, nous intervenons sur toute la région et dans toute la France sur devis. Contactez-nous pour en savoir plus sur nos disponibilités et nos formules.`,
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

const AVIS = [
  {
    id: 1,
    prenom: "Camille & Thomas",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&q=80",
    dateMariage: "Juin 2025",
    lieu: "Château de la Pioline, Aix-en-Provence",
    note: 5,
    commentaire: "Lucie est une photographe exceptionnelle ! Elle a su capturer chaque moment avec une sensibilité rare. Les photos sont sublimes, lumineuses et naturelles. Elle est discrète pendant le jour J mais toujours au bon endroit au bon moment. Nos albums sont magnifiques, on les regarde encore et encore. Merci infiniment Lucie !",
  },
  {
    id: 2,
    prenom: "Amandine & Rémi",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    dateMariage: "Septembre 2024",
    lieu: "Bastide des Magnans, Marseille",
    note: 5,
    commentaire: "On a eu le coup de cœur pour le style de Lucie dès qu'on a vu son portfolio. Elle correspond exactement à ce qu'on cherchait : des photos naturelles, des couleurs chaudes, beaucoup d'émotion. La séance engagement avant le mariage nous a vraiment mis à l'aise. Parfaite du début à la fin.",
  },
  {
    id: 3,
    prenom: "Sophie & Marc",
    photo: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&q=80",
    dateMariage: "Mai 2024",
    lieu: "Les Calanques, Marseille",
    note: 5,
    commentaire: "Lucie a immortalisé notre mariage dans les calanques de façon magistrale. Les lumières dorées, la mer turquoise... elle a tout saisi. Très professionnelle, ponctuelle, et tellement agréable à travailler avec. Livraison des photos en 4 semaines comme promis. Je recommande à 100% !",
  },
  {
    id: 4,
    prenom: "Laura & Axel",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    dateMariage: "Juillet 2024",
    lieu: "Domaine de la Croix, Var",
    note: 4,
    commentaire: "Très belles photos, Lucie est professionnelle et sympathique. Quelques photos un peu sombres en intérieur mais dans l'ensemble on est ravis du résultat. La séance de couple au coucher de soleil est magique.",
  },
  {
    id: 5,
    prenom: "Inès & Guillaume",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    dateMariage: "Octobre 2024",
    lieu: "Abbaye de Silvacane, Var",
    note: 5,
    commentaire: "Un grand merci à Lucie pour ces souvenirs inoubliables. Elle a su créer une belle ambiance, mettre nos invités à l'aise. Les photos racontent vraiment l'histoire de notre journée. On reviendra pour un renouvellement de vœux !",
  },
];

const REPARTITION_NOTES = [
  { etoiles: 5, count: 128, pct: 90 },
  { etoiles: 4, count: 11, pct: 8 },
  { etoiles: 3, count: 3, pct: 2 },
  { etoiles: 2, count: 1, pct: 0.5 },
  { etoiles: 1, count: 0, pct: 0 },
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

type PrestatireData = ReturnType<typeof buildPrestataire>;

function SectionAPropos({ prestataire }: { prestataire: PrestatireData }) {
  const PRESTATAIRE = prestataire;
  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
        {PRESTATAIRE.description.split("\n\n").map((para, i) => (
          <p key={i} className="text-gray-600 leading-relaxed mb-3 last:mb-0">
            {para}
          </p>
        ))}
      </div>

      {/* Spécialités */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Spécialités</h3>
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
      </div>

      {/* Infos grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expérience */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Expérience</p>
            <p className="text-gray-900 font-semibold">{PRESTATAIRE.experience} ans</p>
            <p className="text-sm text-gray-500">+200 mariages photographiés</p>
          </div>
        </div>

        {/* Zone */}
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
              <p className="text-xs text-gray-400 italic">{PRESTATAIRE.zones[5]}</p>
            </div>
          </div>
        </div>

        {/* Langues */}
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

        {/* Équipements */}
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
      </div>
    </div>
  );
}

function SectionGalerie() {
  const [selected, setSelected] = useState<null | number>(null);

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Galerie</h2>
          <span className="text-sm text-gray-400">{GALERIE.length} photos</span>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {GALERIE.map((photo) => (
            <div
              key={photo.id}
              className={`break-inside-avoid relative overflow-hidden rounded-xl cursor-pointer group ${photo.tall ? "aspect-[3/4]" : "aspect-square"}`}
              onClick={() => setSelected(photo.id)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
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

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setSelected(null)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const photo = GALERIE.find((p) => p.id === selected);
              return photo ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionAvis({ prestataire }: { prestataire: PrestatireData }) {
  const PRESTATAIRE = prestataire;
  return (
    <div className="space-y-6">
      {/* Note globale */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Avis clients</h2>
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          {/* Score global */}
          <div className="text-center flex-shrink-0">
            <div className="text-6xl font-bold text-gray-900 leading-none">{PRESTATAIRE.note}</div>
            <Stars note={PRESTATAIRE.note} size="lg" />
            <p className="text-sm text-gray-500 mt-2">{PRESTATAIRE.nbAvis} avis vérifiés</p>
          </div>
          {/* Barres */}
          <div className="flex-1 w-full space-y-2">
            {REPARTITION_NOTES.map((r) => (
              <div key={r.etoiles} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-3 text-right">{r.etoiles}</span>
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {AVIS.map((avis) => (
          <div key={avis.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image src={avis.photo} alt={avis.prenom} fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{avis.prenom}</h4>
                  <div className="flex items-center gap-2">
                    <Stars note={avis.note} size="sm" />
                    <span className="text-xs text-gray-400">{avis.dateMariage}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {avis.lieu}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">{avis.commentaire}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTarifs() {
  return (
    <div className="space-y-6">
      {/* Formules */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Formules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TARIFS.map((t) => (
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Options supplémentaires</h3>
        <div className="divide-y divide-gray-100">
          {OPTIONS.map((o) => (
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
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ prestataire }: { prestataire: PrestatireData }) {
  const PRESTATAIRE = prestataire;
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      {/* Contact card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-rose-100">
            <Image src={PRESTATAIRE.photo} alt={PRESTATAIRE.nom} fill className="object-cover" sizes="48px" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{PRESTATAIRE.nom}</p>
            <p className="text-xs text-gray-400">{PRESTATAIRE.metier}</p>
          </div>
        </div>
        <button className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-full text-sm transition-all duration-200 shadow-sm hover:shadow-md mb-3">
          Demander un devis
        </button>
        <button
          className="w-full border-2 border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold py-2.5 rounded-full text-sm transition-all duration-200"
          onClick={() => setSaved(!saved)}
        >
          {saved ? "✓ Sauvegardé" : "Sauvegarder"}
        </button>

        <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
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
          <a
            href="#"
            className="flex items-center gap-3 text-sm text-gray-600 hover:text-rose-500 transition-colors group"
          >
            <div className="w-8 h-8 bg-gray-50 group-hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            {PRESTATAIRE.site}
          </a>
        </div>
      </div>

      {/* Disponibilités */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Disponibilités — Avril 2026</h3>
        <div className="grid grid-cols-4 gap-2">
          {DISPONIBILITES.map((d) => (
            <div
              key={d.jour}
              className={`rounded-lg text-center py-2 text-xs font-semibold ${
                d.dispo
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-gray-100 text-gray-400 line-through"
              }`}
            >
              {d.jour} avr.
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">Contactez pour d&apos;autres dates</p>
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
      </div>

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

export default function PrestataireProfil({ id }: { id?: number }) {
  const PRESTATAIRE = buildPrestataire(id ?? 1);
  const [activeTab, setActiveTab] = useState<Tab>("apropos");
  const [saved, setSaved] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: "apropos", label: "À propos" },
    { id: "galerie", label: "Galerie" },
    { id: "avis", label: `Avis (${PRESTATAIRE.nbAvis})` },
    { id: "tarifs", label: "Tarifs" },
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* ── Cover + profil ────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Photo de couverture */}
        <div className="relative h-56 sm:h-72 md:h-96 w-full overflow-hidden">
          <Image
            src={PRESTATAIRE.couverture}
            alt="Photo de couverture"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        {/* Bouton retour */}
        <Link
          href="/annuaire"
          className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 text-sm font-medium px-3 py-2 rounded-full shadow-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Annuaire
        </Link>

        {/* Infos profil superposées */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Photo de profil */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
                <Image
                  src={PRESTATAIRE.photo}
                  alt={PRESTATAIRE.nom}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>

              {/* Infos principales */}
              <div className="flex-1 pb-4 sm:pb-0 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg truncate">
                    {PRESTATAIRE.nom}
                  </h1>
                  {PRESTATAIRE.verifie && (
                    <span className="flex items-center gap-1 bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Vérifié
                    </span>
                  )}
                </div>
                <span className="inline-block bg-white text-[#F06292] text-sm font-semibold px-3 py-1 rounded-full mb-2 shadow">{PRESTATAIRE.metier}</span>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-white/80 drop-shadow">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {PRESTATAIRE.ville}, {PRESTATAIRE.region}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Stars note={PRESTATAIRE.note} size="sm" />
                    <span className="font-bold text-gray-900">{PRESTATAIRE.note}</span>
                    <span className="text-gray-500">({PRESTATAIRE.nbAvis})</span>
                  </span>
                  <span className="text-white/80 drop-shadow font-medium">
                    À partir de {PRESTATAIRE.prixMin.toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pb-4 sm:pb-0 flex-shrink-0">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    saved
                      ? "bg-rose-400 border-rose-400 text-white"
                      : "bg-white/90 border-white/50 text-gray-600 hover:bg-white"
                  }`}
                >
                  <svg className="w-4.5 h-4.5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="bg-rose-400 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap">
                  Contacter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Onglets ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-rose-400 text-rose-500"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Contenu ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonne principale */}
          <div className="flex-1 min-w-0">
            {activeTab === "apropos" && <SectionAPropos prestataire={PRESTATAIRE} />}
            {activeTab === "galerie" && <SectionGalerie />}
            {activeTab === "avis" && <SectionAvis prestataire={PRESTATAIRE} />}
            {activeTab === "tarifs" && <SectionTarifs />}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-36">
              <Sidebar prestataire={PRESTATAIRE} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
