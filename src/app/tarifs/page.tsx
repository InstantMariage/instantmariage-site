import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TarifsContent from "@/components/TarifsContent";
import type { Metadata } from "next";

const tarifsFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Puis-je changer de formule à tout moment ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre espace prestataire. Le changement prend effet immédiatement, et la différence est calculée au prorata.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionne la réduction annuelle ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En choisissant la facturation annuelle, vous économisez 20% sur votre abonnement. Le montant est prélevé en une seule fois pour l'année complète. Vous pouvez annuler à tout moment et être remboursé au prorata.",
      },
    },
    {
      "@type": "Question",
      name: "Mes données sont-elles sécurisées ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolument. Toutes vos données (devis, contrats, photos) sont hébergées en France sur des serveurs sécurisés, conformément au RGPD. Vos clients ne voient que ce que vous choisissez de partager.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionne le badge « Prestataire vérifié » ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le badge vérifié est attribué après vérification de votre identité et de vos activités professionnelles. Il rassure les futurs mariés sur le sérieux de votre prestation et améliore votre classement dans les résultats.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Tarifs – InstantMariage.fr",
  description:
    "Découvrez nos formules pour les prestataires mariage : Starter, Pro et Premium. Gérez vos devis, factures et visibilité en ligne.",
  keywords: "tarifs prestataire mariage, abonnement photographe mariage, forfait wedding planner, visibilité mariage",
  alternates: { canonical: "/tarifs" },
  openGraph: {
    title: "Tarifs – InstantMariage.fr",
    description:
      "Découvrez nos formules pour les prestataires mariage : Starter, Pro et Premium. Gérez vos devis, factures et visibilité en ligne.",
    url: "https://instantmariage.fr/tarifs",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Tarifs InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarifs – InstantMariage.fr",
    description:
      "Formules Starter, Pro et Premium pour les prestataires mariage. Gérez vos devis, factures et visibilité en ligne.",
    images: ["/logo.png"],
  },
};

export default function TarifsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tarifsFaqSchema) }}
      />
      <main className="min-h-screen">
        <Header />
        <TarifsContent />
        <Footer />
      </main>
    </>
  );
}
