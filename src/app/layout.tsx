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
  title: "InstantMariage.fr – Trouvez les meilleurs prestataires mariage",
  description:
    "La plateforme #1 pour trouver photographes, traiteurs, DJ et tous vos prestataires mariage en France. Devis gratuits, avis vérifiés, outils mariés.",
  keywords: "mariage, prestataires mariage, photographe mariage, traiteur mariage, DJ mariage",
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
