import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemple site web boutique robes de mariée | InstantMariage Elite",
  description:
    "Exemple de site e-commerce pour boutique de robes de mariée. Style luxe blanc et champagne créé par InstantMariage.",
  openGraph: {
    title: "Exemple site web boutique robes de mariée | InstantMariage Elite",
    description:
      "Exemple de site e-commerce pour boutique de robes de mariée. Style luxe blanc et champagne créé par InstantMariage.",
    url: "https://www.instantmariage.fr/demo/boutique",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Demo boutique robes mariée InstantMariage" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
