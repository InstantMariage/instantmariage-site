import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  parseSlug,
  buildSlug,
  buildSlugDepartement,
  buildSlugRegion,
  METIERS_SEO,
  VILLES_SEO,
  FALLBACK_IMAGES,
  DEFAULT_FALLBACK,
  getDepartementByCode,
  getRegionByNom,
} from "@/data/seo-local";
import type { Prestataire } from "@/lib/supabase";

// ─── ISR : revalidation toutes les heures ─────────────────────────────────────
export const revalidate = 3600;

// ─── Génération statique ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const metier of METIERS_SEO) {
    for (const ville of VILLES_SEO) {
      params.push({ slug: buildSlug(metier.slug, ville.slug) });
    }
  }
  return params;
}

// ─── Metadata dynamique ────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { metier, ville } = parseSlug(slug);

  if (!metier || !ville) {
    return { title: "Page introuvable – InstantMariage" };
  }

  const title = `${metier.nom} mariage ${ville.nom} – Les meilleurs ${metier.nomPluriel} | InstantMariage.fr`;
  const description = `Trouvez les meilleurs ${metier.nomPluriel} pour votre mariage à ${ville.nom} (${ville.departement}). Comparez les tarifs, consultez les avis et contactez directement les professionnels près de chez vous.`;

  return {
    title,
    description,
    keywords: `${metier.nom.toLowerCase()} mariage ${ville.nom}, ${metier.nomPluriel} mariage ${ville.nom}, prestataire mariage ${ville.nom}`,
    openGraph: {
      title,
      description,
      url: `https://instantmariage.fr/annuaire/${slug}`,
      siteName: "InstantMariage.fr",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://instantmariage.fr/annuaire/${slug}`,
    },
  };
}

// ─── Fetch prestataires (server-side) ─────────────────────────────────────────

const PER_PAGE = 24;

type PrestataireWithAbo = Prestataire & {
  abonnements?: { plan: string; statut: string }[];
};

function planPriority(p: PrestataireWithAbo): number {
  const activeAbo = p.abonnements?.find((a) => a.statut === "actif") ?? p.abonnements?.[0];
  const plan = activeAbo?.plan;
  if (plan === "premium") return 2;
  if (plan === "pro" || plan === "starter" || plan === "essentiel") return 1;
  return 0;
}

async function fetchPrestataires(
  categorie: string,
  ville: string,
  departement: string,
  page: number
): Promise<{ data: PrestataireWithAbo[]; total: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("prestataires")
    .select("*, abonnements(plan, statut)")
    .eq("categorie", categorie)
    .or(`ville.ilike.%${ville}%,departement.ilike.%${departement}%`);

  if (error || !data) return { data: [], total: 0 };

  const sorted = (data as PrestataireWithAbo[]).sort((a, b) => {
    const planDiff = planPriority(b) - planPriority(a);
    if (planDiff !== 0) return planDiff;
    return (b.note_moyenne ?? 0) - (a.note_moyenne ?? 0);
  });

  const from = (page - 1) * PER_PAGE;
  return { data: sorted.slice(from, from + PER_PAGE), total: sorted.length };
}

// ─── Composant carte prestataire ──────────────────────────────────────────────

function ProviderCard({ p }: { p: PrestataireWithAbo }) {
  const activeAbo = p.abonnements?.find((a) => a.statut === "actif") ?? p.abonnements?.[0];
  const isPro = activeAbo?.plan === "pro" || activeAbo?.plan === "premium";
  const photo = p.photos?.[0] || FALLBACK_IMAGES[p.categorie] || DEFAULT_FALLBACK;
  const prixLabel = p.prix_depart != null
    ? `À partir de ${p.prix_depart.toLocaleString("fr-FR")} €`
    : "Sur devis";

  return (
    <Link
      href={`/prestataires/${p.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={photo}
          alt={`${p.nom_entreprise} – ${p.categorie} à ${p.ville}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.verifie && (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Vérifié
            </span>
          )}
          {isPro && (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              ✨ Pro
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-rose-600 transition-colors">
            {p.nom_entreprise}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{p.ville}</p>
        </div>
        {p.description && (
          <p className="text-sm text-gray-600 line-clamp-2 flex-1">{p.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`w-3.5 h-3.5 ${p.note_moyenne >= s ? "text-amber-400" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">({p.nb_avis})</span>
          </div>
          <span className="text-xs font-medium text-rose-600">{prixLabel}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnnuaireLocalPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { metier, ville } = parseSlug(slug);

  if (!metier || !ville) notFound();

  const { data: prestataires, total } = await fetchPrestataires(metier.categorie, ville.nom, ville.departement, page);
  const totalPages = Math.ceil(total / PER_PAGE);

  // Autres villes pour le même métier (liens internes)
  const autresVilles = VILLES_SEO.filter((v) => v.slug !== ville.slug);
  // Autres métiers pour la même ville (liens internes)
  const autresMetiers = METIERS_SEO.filter((m) => m.slug !== metier.slug);
  // Département et région
  const departement = getDepartementByCode(ville.departement);
  const region = getRegionByNom(ville.region);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${metier.nom} mariage ${ville.nom}`,
    description: `Liste des ${metier.nomPluriel} pour mariage à ${ville.nom}`,
    numberOfItems: prestataires.length,
    itemListElement: prestataires.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: p.nom_entreprise,
        url: `https://instantmariage.fr/prestataires/${p.id}`,
        address: { "@type": "PostalAddress", addressLocality: p.ville, addressCountry: "FR" },
        aggregateRating: p.nb_avis > 0
          ? { "@type": "AggregateRating", ratingValue: p.note_moyenne, reviewCount: p.nb_avis }
          : undefined,
      },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Annuaire", item: "https://instantmariage.fr/annuaire" },
      ...(region ? [{ "@type": "ListItem", position: 3, name: region.nom, item: `https://instantmariage.fr/annuaire/region/${buildSlugRegion(metier.slug, region.slug)}` }] : []),
      { "@type": "ListItem", position: region ? 4 : 3, name: `${metier.nom} à ${ville.nom}`, item: `https://instantmariage.fr/annuaire/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <main className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Header />

        {/* Hero SEO */}
        <section className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-b border-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-rose-600 transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/annuaire" className="hover:text-rose-600 transition-colors">Annuaire</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">{metier.nom} à {ville.nom}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{metier.icon}</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
                  {metier.nom} mariage {ville.nom}
                </h1>
                <p className="text-gray-500 mt-1">
                  {total > 0
                    ? `${total} prestataire${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""} — ${ville.region}`
                    : `${ville.region}`}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-lg max-w-2xl">
              Trouvez les meilleurs {metier.nomPluriel} pour votre mariage à {ville.nom}.
              Comparez les tarifs, consultez les avis et contactez directement les professionnels.
            </p>
          </div>
        </section>

        {/* Grille prestataires */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {prestataires.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {total} {metier.nomPluriel} à {ville.nom}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prestataires.map((p) => (
                  <ProviderCard key={p.id} p={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-5xl mb-4 block">{metier.icon}</span>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Aucun {metier.nom.toLowerCase()} inscrit à {ville.nom} pour l&apos;instant
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Soyez le premier ou consultez notre annuaire national pour trouver un prestataire près de {ville.nom}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/annuaire"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Voir tous les prestataires
                </Link>
                <Link
                  href="/inscription"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium px-6 py-3 rounded-xl border border-gray-200 transition-colors"
                >
                  Inscrire mon entreprise
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
              {page > 1 && (
                <Link
                  href={`/annuaire/${slug}?page=${page - 1}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Précédent
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/annuaire/${slug}?page=${p}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-rose-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/annuaire/${slug}?page=${page + 1}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Suivant →
                </Link>
              )}
            </nav>
          )}
        </section>

        {/* Maillage interne — autres villes pour ce métier */}
        <section className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {metier.icon} {metier.nom} mariage dans d&apos;autres villes
            </h2>
            <div className="flex flex-wrap gap-2">
              {autresVilles.map((v) => (
                <Link
                  key={v.slug}
                  href={`/annuaire/${buildSlug(metier.slug, v.slug)}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-rose-100 text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  {metier.nom} mariage {v.nom}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Maillage interne — autres métiers dans cette ville */}
        <section className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Autres prestataires mariage à {ville.nom}
            </h2>
            <div className="flex flex-wrap gap-2">
              {autresMetiers.map((m) => (
                <Link
                  key={m.slug}
                  href={`/annuaire/${buildSlug(m.slug, ville.slug)}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-white transition-colors"
                >
                  {m.icon} {m.nom} à {ville.nom}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Maillage interne — département & région */}
        {(departement || region) && (
          <section className="bg-white border-t border-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Élargir la recherche
              </h2>
              <div className="flex flex-wrap gap-2">
                {departement && (
                  <Link
                    href={`/annuaire/departement/${buildSlugDepartement(metier.slug, departement.slug)}`}
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {metier.nom} dans le {departement.nom} ({departement.code})
                  </Link>
                )}
                {region && (
                  <Link
                    href={`/annuaire/region/${buildSlugRegion(metier.slug, region.slug)}`}
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-rose-100 text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    {metier.nom} en {ville.region}
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA inscription */}
        <section className="bg-gradient-to-r from-rose-600 to-pink-600 py-14">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h2 className="text-2xl font-bold text-white mb-3">
              Vous êtes {metier.nom.toLowerCase()} à {ville.nom} ?
            </h2>
            <p className="text-rose-100 mb-6">
              Rejoignez InstantMariage et soyez visible par des milliers de mariés chaque mois.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-white text-rose-600 font-semibold px-8 py-3 rounded-xl hover:bg-rose-50 transition-colors"
            >
              Inscrire mon entreprise gratuitement
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
