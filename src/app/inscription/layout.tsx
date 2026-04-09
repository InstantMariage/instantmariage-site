import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription – Rejoignez InstantMariage.fr",
  description:
    "Créez votre compte InstantMariage.fr : futurs mariés, trouvez vos prestataires idéaux ; professionnels du mariage, développez votre activité et recevez des demandes de devis.",
  keywords: "inscription mariage, créer compte prestataire mariage, rejoindre plateforme mariage",
  openGraph: {
    title: "Inscription – Rejoignez InstantMariage.fr",
    description:
      "Créez votre compte InstantMariage.fr : futurs mariés, trouvez vos prestataires idéaux ; professionnels du mariage, développez votre activité et recevez des demandes de devis.",
    url: "https://instantmariage.fr/inscription",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Inscription InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscription – Rejoignez InstantMariage.fr",
    description:
      "Créez votre compte InstantMariage.fr : futurs mariés, trouvez vos prestataires idéaux ; professionnels du mariage, développez votre activité.",
    images: ["/logo.png"],
  },
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
