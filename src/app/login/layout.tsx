import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — InstantMariage.fr",
  description:
    "Connectez-vous à votre espace InstantMariage.fr pour accéder à vos outils, messages et prestataires favoris.",
  keywords: "connexion mariage, login prestataire mariage, espace personnel mariage",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Connexion — InstantMariage.fr",
    description:
      "Connectez-vous à votre espace InstantMariage.fr pour accéder à vos outils, messages et prestataires favoris.",
    url: "https://instantmariage.fr/login",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Connexion InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connexion — InstantMariage.fr",
    description:
      "Connectez-vous à votre espace InstantMariage.fr pour accéder à vos outils, messages et prestataires favoris.",
    images: ["/og-image.png"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
