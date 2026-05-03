import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
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

function truncate(text: string, max: number): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchPrestataire(id);
  if (p) {
    const shortDesc = p.description
      ? truncate(p.description, 110)
      : null;
    const description = shortDesc
      ? `Découvrez ${p.nom_entreprise}, ${p.categorie} mariage à ${p.ville}. ${shortDesc}. Contactez-les sur InstantMariage.fr`
      : `Découvrez ${p.nom_entreprise}, ${p.categorie} mariage à ${p.ville}. Consultez les avis et contactez ce prestataire sur InstantMariage.fr`;
    return {
      title: `${p.nom_entreprise} — ${p.categorie} mariage à ${p.ville} | InstantMariage`,
      description: truncate(description, 155),
    };
  }
  return { title: "Prestataire – InstantMariage" };
}

export default async function PrestatairePage({ params }: Props) {
  const { id } = await params;
  const p = await fetchPrestataire(id);

  const cookieStore = cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { session } } = await supabaseAuth.auth.getSession();
  const isLoggedIn = !!session;

  const localBusinessLd = p ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: p.nom_entreprise,
    description: p.description || undefined,
    ...(p.avatar_url ? { image: p.avatar_url } : {}),
    url: `https://www.instantmariage.fr/prestataires/${id}`,
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
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Annuaire", item: "https://www.instantmariage.fr/annuaire" },
      { "@type": "ListItem", position: 3, name: p.nom_entreprise, item: `https://www.instantmariage.fr/prestataires/${id}` },
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
        <PrestataireProfil id={id} isLoggedIn={isLoggedIn} />
        <Footer />
      </main>
    </>
  );
}
