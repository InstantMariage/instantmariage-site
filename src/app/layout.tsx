import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PushNotifications from "@/components/PushNotifications";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F06292",
};

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
  verification: {
    google: "qW9lilNNncGB3P5WZ4eybkNFySB7hIYCCl65bGGxuLk",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InstantMariage",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZP327QEQKW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZP327QEQKW');
          `}
        </Script>
      </head>
      <body className={`${playfair.variable} ${inter.variable} font-inter antialiased overflow-x-hidden max-w-full`}>
        <PushNotifications />
        {children}
      </body>
    </html>
  );
}
