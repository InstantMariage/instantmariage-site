import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnuaireContent from "@/components/AnnuaireContent";

export const metadata: Metadata = {
  title: "Annuaire des prestataires mariage – InstantMariage.fr",
  description:
    "Trouvez les meilleurs photographes, traiteurs, DJ, fleuristes et tous vos prestataires mariage en France. Filtrez par région, budget et métier.",
  keywords: "annuaire prestataires mariage, photographe mariage, traiteur mariage, DJ mariage, fleuriste mariage",
};

export default function AnnuairePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <AnnuaireContent />
      <Footer />
    </main>
  );
}
