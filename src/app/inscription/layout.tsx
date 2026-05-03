import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription gratuite — Rejoignez InstantMariage.fr",
  description:
    "Créez votre compte gratuit sur InstantMariage.fr. Mariés : trouvez les meilleurs prestataires. Prestataires : développez votre activité mariage.",
  keywords: "inscription mariage, créer compte prestataire mariage, rejoindre plateforme mariage",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Inscription gratuite — Rejoignez InstantMariage.fr",
    description:
      "Créez votre compte gratuit sur InstantMariage.fr. Mariés : trouvez les meilleurs prestataires. Prestataires : développez votre activité mariage.",
    url: "https://instantmariage.fr/inscription",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Inscription InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscription gratuite — Rejoignez InstantMariage.fr",
    description:
      "Créez votre compte gratuit sur InstantMariage.fr. Mariés : trouvez les meilleurs prestataires. Prestataires : développez votre activité mariage.",
    images: ["/og-image.png"],
  },
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
