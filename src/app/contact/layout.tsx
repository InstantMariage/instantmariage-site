import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – InstantMariage.fr",
  description:
    "Contactez l'équipe InstantMariage.fr pour toute question sur notre plateforme, un problème avec un prestataire ou pour devenir partenaire.",
  keywords: "contact mariage, support InstantMariage, aide prestataire mariage",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact – InstantMariage.fr",
    description:
      "Contactez l'équipe InstantMariage.fr pour toute question sur notre plateforme, un problème avec un prestataire ou pour devenir partenaire.",
    url: "https://instantmariage.fr/contact",
    siteName: "InstantMariage.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact – InstantMariage.fr",
    description:
      "Contactez l'équipe InstantMariage.fr pour toute question sur notre plateforme ou pour devenir partenaire.",
    images: ["/og-image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
