import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemple site web photographe mariage | InstantMariage Elite",
  description:
    "Découvrez un exemple de site vitrine professionnel pour photographe de mariage créé par InstantMariage. Style élégant noir et or.",
  openGraph: {
    title: "Exemple site web photographe mariage | InstantMariage Elite",
    description:
      "Découvrez un exemple de site vitrine professionnel pour photographe de mariage créé par InstantMariage. Style élégant noir et or.",
    url: "https://www.instantmariage.fr/demo/photographe",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Demo photographe mariage InstantMariage" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function PhotographeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
