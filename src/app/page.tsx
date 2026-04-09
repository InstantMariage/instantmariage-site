import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import VendorBanner from "@/components/VendorBanner";
import FeaturedProviders from "@/components/FeaturedProviders";
import FreeTools from "@/components/FreeTools";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "InstantMariage.fr – Trouvez les meilleurs prestataires mariage en France",
  description:
    "Comparez et contactez facilement photographes, traiteurs, DJ, wedding planners et tous vos prestataires mariage en France. Devis gratuit, avis vérifiés.",
  keywords:
    "prestataires mariage, photographe mariage, traiteur mariage, DJ mariage, wedding planner, organisation mariage France",
  openGraph: {
    title: "InstantMariage.fr – Trouvez les meilleurs prestataires mariage en France",
    description:
      "Comparez et contactez facilement photographes, traiteurs, DJ, wedding planners et tous vos prestataires mariage en France. Devis gratuit, avis vérifiés.",
    url: "https://instantmariage.fr",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstantMariage.fr – Trouvez les meilleurs prestataires mariage en France",
    description:
      "Comparez et contactez photographes, traiteurs, DJ, wedding planners et tous vos prestataires mariage. Devis gratuit.",
    images: ["/logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "InstantMariage.fr",
  url: "https://instantmariage.fr",
  logo: "https://instantmariage.fr/logo.png",
  description:
    "La plateforme de référence pour trouver et comparer les meilleurs prestataires mariage en France. Photographes, traiteurs, DJ, wedding planners et bien plus.",
  foundingDate: "2025",
  areaServed: "FR",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://instantmariage.fr/contact",
    availableLanguage: "French",
  },
  sameAs: [],
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Hero />
      <HowItWorks />
      <VendorBanner />
      <FeaturedProviders />
      <FreeTools />
      <Testimonials />
      <Footer />
    </main>
  );
}
