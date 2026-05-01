import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemple site web chauffeur mariage luxe | InstantMariage Elite",
  description:
    "Exemple de site vitrine pour service de chauffeur privé mariage. Style prestige noir et or créé par InstantMariage.",
  openGraph: {
    title: "Exemple site web chauffeur mariage luxe | InstantMariage Elite",
    description:
      "Exemple de site vitrine pour service de chauffeur privé mariage. Style prestige noir et or créé par InstantMariage.",
    url: "https://www.instantmariage.fr/demo/chauffeur",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Demo chauffeur mariage InstantMariage" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function ChauffeurLayout({ children }: { children: React.ReactNode }) {
  return children;
}
