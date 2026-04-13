import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnuaireContent from "@/components/AnnuaireContent";

export const metadata: Metadata = {
  title: "Annuaire des prestataires mariage – InstantMariage.fr",
  description:
    "Trouvez les meilleurs photographes, traiteurs, DJ, fleuristes et tous vos prestataires mariage en France. Filtrez par région, budget et métier.",
  keywords: "annuaire prestataires mariage, photographe mariage, traiteur mariage, DJ mariage, fleuriste mariage",
  alternates: { canonical: "/annuaire" },
  openGraph: {
    title: "Annuaire des prestataires mariage – InstantMariage.fr",
    description:
      "Trouvez les meilleurs photographes, traiteurs, DJ, fleuristes et tous vos prestataires mariage en France. Filtrez par région, budget et métier.",
    url: "https://instantmariage.fr/annuaire",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Annuaire prestataires mariage" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire des prestataires mariage – InstantMariage.fr",
    description:
      "Trouvez les meilleurs photographes, traiteurs, DJ, fleuristes et tous vos prestataires mariage en France.",
    images: ["/logo.png"],
  },
};

export default function AnnuairePage() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Suspense fallback={null}>
        <AnnuaireContent />
      </Suspense>
      <Footer />
    </main>
  );
}
