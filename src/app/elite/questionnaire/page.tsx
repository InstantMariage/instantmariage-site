import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EliteQuestionnaire from "@/components/EliteQuestionnaire";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurez votre site Elite | InstantMariage.fr",
  description: "Renseignez vos informations pour la création de votre site professionnel mariage.",
  robots: { index: false, follow: false },
};

export default function EliteQuestionnairePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="min-h-screen" />}>
        <EliteQuestionnaire />
      </Suspense>
      <Footer />
    </main>
  );
}
