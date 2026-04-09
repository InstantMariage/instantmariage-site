import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Démonstration – Découvrez InstantMariage.fr en action",
  description:
    "Visualisez en direct toutes les fonctionnalités d'InstantMariage.fr : gestion des devis, messagerie, portfolio prestataire et tableau de bord pour les professionnels du mariage.",
  keywords: "demo plateforme mariage, fonctionnalités prestataire mariage, gestion devis mariage",
  openGraph: {
    title: "Démonstration – Découvrez InstantMariage.fr en action",
    description:
      "Visualisez en direct toutes les fonctionnalités d'InstantMariage.fr : gestion des devis, messagerie, portfolio prestataire et tableau de bord.",
    url: "https://instantmariage.fr/demo",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Démo InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Démonstration – Découvrez InstantMariage.fr en action",
    description:
      "Visualisez toutes les fonctionnalités d'InstantMariage.fr : gestion des devis, messagerie, portfolio et tableau de bord.",
    images: ["/logo.png"],
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
