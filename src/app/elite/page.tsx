import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EliteContent from "@/components/EliteContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créez votre site web mariage professionnel en 72h | Pack Elite InstantMariage",
  description:
    "Obtenez un site web sur mesure pour votre activité mariage en 72h. Nom de domaine inclus, maintenance incluse, visibilité sur InstantMariage. À partir de 149€/mois.",
  keywords:
    "site web prestataire mariage, site vitrine photographe mariage, site internet traiteur mariage, agence web mariage France",
  alternates: { canonical: "/elite" },
  openGraph: {
    title: "Créez votre site web mariage professionnel en 72h | Pack Elite InstantMariage",
    description:
      "Obtenez un site web sur mesure pour votre activité mariage en 72h. Nom de domaine inclus, maintenance incluse, visibilité sur InstantMariage. À partir de 149€/mois.",
    url: "https://www.instantmariage.fr/elite",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pack Elite InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Créez votre site web mariage professionnel en 72h | Pack Elite InstantMariage",
    description:
      "Obtenez un site web sur mesure pour votre activité mariage en 72h. Nom de domaine inclus, maintenance incluse. À partir de 149€/mois.",
    images: ["/og-image.png"],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Pack Elite - Création de site web mariage",
  provider: {
    "@type": "Organization",
    name: "InstantMariage.fr",
    url: "https://www.instantmariage.fr",
  },
  description: "Création de site web professionnel sur mesure pour prestataires mariage en 72h",
  offers: [
    {
      "@type": "Offer",
      name: "Elite Vitrine",
      price: "149",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "149",
        priceCurrency: "EUR",
        unitText: "MONTH",
      },
    },
    {
      "@type": "Offer",
      name: "Elite Shop",
      price: "199",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "199",
        priceCurrency: "EUR",
        unitText: "MONTH",
      },
    },
  ],
  areaServed: "France",
  serviceType: "Web Design",
};

export default function ElitePage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Header />
      <Suspense fallback={<div className="min-h-screen" />}>
        <EliteContent />
      </Suspense>
      <Footer />
    </main>
  );
}
