import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EliteContent from "@/components/EliteContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pack Elite – Site Pro Mariage en 72h | InstantMariage.fr",
  description:
    "Votre site professionnel mariage créé en 72h, clé en main. Nom de domaine inclus, maintenance incluse, visibilité sur InstantMariage. À partir de 149€/mois.",
  keywords:
    "site web mariage prestataire, site photographe mariage, site traiteur mariage, site wedding planner, pack elite instantmariage",
  alternates: { canonical: "/elite" },
  openGraph: {
    title: "Pack Elite – Site Pro Mariage en 72h | InstantMariage.fr",
    description:
      "Votre site professionnel mariage créé en 72h, clé en main. Nom de domaine inclus, maintenance incluse, visibilité sur InstantMariage.",
    url: "https://instantmariage.fr/elite",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Pack Elite InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pack Elite – Site Pro Mariage en 72h | InstantMariage.fr",
    description:
      "Site pro mariage clé en main en 72h. Domaine inclus, maintenance incluse, visibilité InstantMariage. À partir de 149€/mois.",
    images: ["/logo.png"],
  },
};

export default function ElitePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <EliteContent />
      <Footer />
    </main>
  );
}
