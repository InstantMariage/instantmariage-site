import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog mariage – Conseils, tendances et inspiration – InstantMariage.fr",
  description:
    "Tous nos conseils pour organiser votre mariage : choisir votre photographe, les tendances déco 2025, budget, inspiration et guides pratiques pour futurs mariés.",
  keywords: "blog mariage, conseils mariage, organisation mariage, tendances mariage 2025, inspiration mariage",
  openGraph: {
    title: "Blog mariage – Conseils, tendances et inspiration – InstantMariage.fr",
    description:
      "Tous nos conseils pour organiser votre mariage : choisir votre photographe, les tendances déco 2025, budget, inspiration et guides pratiques pour futurs mariés.",
    url: "https://instantmariage.fr/blog",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Blog InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog mariage – Conseils, tendances et inspiration – InstantMariage.fr",
    description:
      "Tous nos conseils pour organiser votre mariage : choisir votre photographe, les tendances déco 2025, budget, inspiration et guides pratiques.",
    images: ["/logo.png"],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
