import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion – InstantMariage.fr",
  description:
    "Connectez-vous à votre espace InstantMariage.fr pour gérer vos demandes de devis, vos messages et votre profil prestataire mariage.",
  keywords: "connexion mariage, login prestataire mariage, espace personnel mariage",
  openGraph: {
    title: "Connexion – InstantMariage.fr",
    description:
      "Connectez-vous à votre espace InstantMariage.fr pour gérer vos demandes de devis, vos messages et votre profil prestataire mariage.",
    url: "https://instantmariage.fr/login",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Connexion InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connexion – InstantMariage.fr",
    description:
      "Connectez-vous à votre espace InstantMariage.fr pour gérer vos demandes de devis, vos messages et votre profil.",
    images: ["/logo.png"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
