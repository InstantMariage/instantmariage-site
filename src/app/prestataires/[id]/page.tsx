import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrestataireProfil from "@/components/PrestataireProfil";
import { PROVIDERS } from "@/data/providers";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const provider = PROVIDERS.find((p) => p.id === Number(id));
  if (!provider) {
    return { title: "Prestataire – InstantMariage" };
  }
  return {
    title: `${provider.nom} – ${provider.metier} à ${provider.ville}`,
    description: provider.description,
  };
}

export default async function PrestatairePage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <PrestataireProfil id={Number(id)} />
      <Footer />
    </main>
  );
}
