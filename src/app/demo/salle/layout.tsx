import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemple site web salle de réception mariage | InstantMariage Elite",
  description:
    "Exemple de site pour domaine et salle de réception mariage. Style champagne et or créé par InstantMariage.",
  openGraph: {
    title: "Exemple site web salle de réception mariage | InstantMariage Elite",
    description:
      "Exemple de site pour domaine et salle de réception mariage. Style champagne et or créé par InstantMariage.",
    url: "https://www.instantmariage.fr/demo/salle",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Demo salle réception mariage InstantMariage" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function SalleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
