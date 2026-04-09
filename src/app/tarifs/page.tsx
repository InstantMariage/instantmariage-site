import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TarifsContent from "@/components/TarifsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs – InstantMariage.fr",
  description:
    "Découvrez nos formules pour les prestataires mariage : Gratuit, Starter, Pro et Premium. Gérez vos devis, factures et visibilité en ligne.",
  keywords: "tarifs prestataire mariage, abonnement photographe mariage, forfait wedding planner, visibilité mariage",
  openGraph: {
    title: "Tarifs – InstantMariage.fr",
    description:
      "Découvrez nos formules pour les prestataires mariage : Gratuit, Starter, Pro et Premium. Gérez vos devis, factures et visibilité en ligne.",
    url: "https://instantmariage.fr/tarifs",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Tarifs InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarifs – InstantMariage.fr",
    description:
      "Formules Gratuit, Starter, Pro et Premium pour les prestataires mariage. Gérez vos devis, factures et visibilité en ligne.",
    images: ["/logo.png"],
  },
};

export default function TarifsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <TarifsContent />
      <Footer />
    </main>
  );
}
