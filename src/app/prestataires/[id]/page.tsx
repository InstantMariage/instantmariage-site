import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrestataireProfil from "@/components/PrestataireProfil";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchPrestataire(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("prestataires")
    .select("nom_entreprise, categorie, ville, description, note_moyenne, nb_avis, avatar_url")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchPrestataire(id);
  if (p) {
    return {
      title: `${p.nom_entreprise} – ${p.categorie} à ${p.ville} | InstantMariage.fr`,
      description: p.description || `${p.nom_entreprise}, ${p.categorie} pour mariage à ${p.ville}. Consultez les avis et contactez ce prestataire.`,
    };
  }
  return { title: "Prestataire – InstantMariage" };
}

export default async function PrestatairePage({ params }: Props) {
  const { id } = await params;
  const p = await fetchPrestataire(id);

  const localBusinessLd = p ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: p.nom_entreprise,
    description: p.description,
    url: `https://instantmariage.fr/prestataires/${id}`,
    address: { "@type": "PostalAddress", addressLocality: p.ville, addressCountry: "FR" },
    ...(p.nb_avis > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: p.note_moyenne,
        reviewCount: p.nb_avis,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  } : null;

  const breadcrumbLd = p ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Annuaire", item: "https://instantmariage.fr/annuaire" },
      { "@type": "ListItem", position: 3, name: p.nom_entreprise, item: `https://instantmariage.fr/prestataires/${id}` },
    ],
  } : null;

  return (
    <>
      {localBusinessLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      )}
      {breadcrumbLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      )}
      <main className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
        <Header />
        <PrestataireProfil id={id} />
        <Footer />
      </main>
    </>
  );
}
