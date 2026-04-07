import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrestataireProfil from "@/components/PrestataireProfil";

export const metadata: Metadata = {
  title: "Lucie Fontaine Photographie – Photographe de mariage à Marseille",
  description:
    "Photographe de mariage à Marseille depuis 8 ans. Style naturel et émotionnel. Mariages en PACA, Var, Alpes-Maritimes. À partir de 1 900 €.",
  keywords: "photographe mariage Marseille, reportage photo mariage PACA",
};

export default function PrestatairePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <PrestataireProfil />
      <Footer />
    </main>
  );
}
