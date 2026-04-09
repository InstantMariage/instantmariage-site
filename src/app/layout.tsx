import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InstantMariage.fr - Trouvez les meilleurs prestataires mariage",
  description:
    "La plateforme #1 des prestataires mariage en France",
  keywords: "mariage, prestataires mariage, photographe mariage, traiteur mariage, DJ mariage",
  metadataBase: new URL("https://instantmariage.fr"),
  openGraph: {
    title: "InstantMariage.fr - Trouvez les meilleurs prestataires mariage",
    description: "La plateforme #1 des prestataires mariage en France",
    url: "https://instantmariage.fr",
    siteName: "InstantMariage.fr",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "InstantMariage.fr",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstantMariage.fr - Trouvez les meilleurs prestataires mariage",
    description: "La plateforme #1 des prestataires mariage en France",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${inter.variable} font-inter antialiased`}>
        {children}
      </body>
    </html>
  );
}
