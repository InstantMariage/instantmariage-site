import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique mariage — Cadre QR Code personnalisé | InstantMariage",
  description: "Collectez 500+ photos de votre mariage automatiquement. Cadre QR Code personnalisé avec vos prénoms, livré chez vous en 5-7 jours. Dès 39,90€.",
  openGraph: {
    title: "Boutique mariage — Cadre QR Code | InstantMariage",
    description: "Vos invités scannent, leurs photos arrivent dans votre album. Sans application. Sans effort.",
    url: "https://instantmariage.fr/boutique",
    images: ["https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777310770358-good.png"],
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
