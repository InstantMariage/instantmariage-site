import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TarifsContent from "@/components/TarifsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs – InstantMariage.fr",
  description:
    "Découvrez nos formules pour les prestataires mariage : Gratuit, Starter, Pro et Premium. Gérez vos devis, factures et visibilité en ligne.",
};

export default function TarifsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <TarifsContent />
      <Footer />
    </main>
  );
}
