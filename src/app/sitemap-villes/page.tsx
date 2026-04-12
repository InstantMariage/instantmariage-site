import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { METIERS_SEO, VILLES_SEO, buildSlug } from "@/data/seo-local";

export const metadata: Metadata = {
  title: "Prestataires mariage par ville – Annuaire local | InstantMariage.fr",
  description:
    "Trouvez votre prestataire mariage par ville : photographes, DJ, traiteurs, fleuristes et plus à Paris, Lyon, Marseille, Bordeaux, Toulouse et dans toutes les grandes villes de France.",
  openGraph: {
    title: "Prestataires mariage par ville – InstantMariage.fr",
    description:
      "Annuaire des prestataires mariage par ville et par métier. Trouvez le professionnel idéal près de chez vous.",
    url: "https://instantmariage.fr/sitemap-villes",
    siteName: "InstantMariage.fr",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://instantmariage.fr/sitemap-villes",
  },
};

export default function SitemapVillesPage() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-b border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-rose-600 transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/annuaire" className="hover:text-rose-600 transition-colors">Annuaire</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Par ville</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mb-3">
            Prestataires mariage par ville
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Retrouvez tous les professionnels du mariage organisés par métier et par ville.{" "}
            {METIERS_SEO.length} métiers &times; {VILLES_SEO.length} villes ={" "}
            {METIERS_SEO.length * VILLES_SEO.length} pages locales.
          </p>
        </div>
      </section>

      {/* Grille par métier */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {METIERS_SEO.map((metier) => (
          <div key={metier.slug}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <span className="text-3xl">{metier.icon}</span>
              {metier.nom} mariage
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Trouvez les meilleurs {metier.nomPluriel} pour votre mariage dans ces villes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {VILLES_SEO.map((ville) => (
                <Link
                  key={ville.slug}
                  href={`/annuaire/${buildSlug(metier.slug, ville.slug)}`}
                  className="group flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm transition-all duration-200"
                >
                  <span className="font-medium text-gray-800 group-hover:text-rose-700 transition-colors text-sm leading-tight">
                    {ville.nom}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">{ville.departement}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Index par ville */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Toutes les combinaisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VILLES_SEO.map((ville) => (
              <div key={ville.slug} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Prestataires mariage à {ville.nom}
                  <span className="text-xs font-normal text-gray-400 ml-2">({ville.region})</span>
                </h3>
                <ul className="space-y-1.5">
                  {METIERS_SEO.map((metier) => (
                    <li key={metier.slug}>
                      <Link
                        href={`/annuaire/${buildSlug(metier.slug, ville.slug)}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-colors"
                      >
                        <span>{metier.icon}</span>
                        {metier.nom} à {ville.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
