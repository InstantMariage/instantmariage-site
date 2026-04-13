import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqContent from "@/components/FaqContent";
import type { FaqItem } from "@/components/FaqContent";

export const metadata: Metadata = {
  title: "FAQ – Questions fréquentes | InstantMariage.fr",
  description:
    "Toutes les réponses à vos questions sur InstantMariage.fr : comment trouver un prestataire, comment s'inscrire, les tarifs, la gestion du profil et bien plus.",
  keywords:
    "faq mariage, questions fréquentes mariage, aide instantmariage, prestataire mariage inscription, trouver photographe mariage",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ – Questions fréquentes | InstantMariage.fr",
    description:
      "Toutes les réponses à vos questions sur InstantMariage.fr : comment trouver un prestataire, comment s'inscrire, les tarifs et la gestion du profil.",
    url: "https://instantmariage.fr/faq",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "FAQ InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ – Questions fréquentes | InstantMariage.fr",
    description:
      "Toutes les réponses à vos questions sur InstantMariage.fr : futurs mariés et prestataires.",
    images: ["/logo.png"],
  },
};

const faqMaries: FaqItem[] = [
  {
    q: "Comment trouver un prestataire mariage sur InstantMariage.fr ?",
    a: "Rendez-vous sur notre annuaire, sélectionnez votre métier (photographe, traiteur, fleuriste…) et votre ville ou région. Vous obtenez une liste de prestataires disponibles avec leurs photos, avis et tarifs indicatifs. Vous pouvez affiner votre recherche par département ou par métier.",
  },
  {
    q: "Comment contacter un prestataire ?",
    a: "Sur la fiche de chaque prestataire, un bouton « Contacter » vous permet d'envoyer un message directement depuis le site. Le prestataire reçoit votre demande par e-mail et peut vous répondre via notre messagerie intégrée. Aucun numéro de téléphone ni adresse e-mail personnelle n'est échangé avant que vous ne le souhaitiez.",
  },
  {
    q: "Est-ce gratuit pour les futurs mariés ?",
    a: "Oui, totalement ! L'accès à l'annuaire, la messagerie avec les prestataires, ainsi que tous nos outils de planification (rétroplanning, budget, checklist, liste d'invités, plan de table) sont 100 % gratuits pour les futurs mariés. Aucune carte bancaire n'est requise.",
  },
  {
    q: "Comment fonctionne le site InstantMariage.fr ?",
    a: "InstantMariage.fr est une plateforme qui met en relation les futurs mariés et les professionnels du mariage. Les mariés peuvent parcourir l'annuaire, envoyer des messages aux prestataires et utiliser des outils de planification gratuits. Les prestataires créent leur profil et choisissent un abonnement pour apparaître dans l'annuaire et recevoir des demandes de devis.",
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Oui. Toutes vos données sont hébergées en France sur des serveurs sécurisés, conformément au RGPD. Nous ne vendons ni ne partageons vos informations personnelles avec des tiers à des fins commerciales. Vous pouvez à tout moment accéder à vos données, les modifier ou demander leur suppression depuis votre espace personnel.",
  },
  {
    q: "Comment laisser un avis sur un prestataire ?",
    a: "Après votre mariage, vous recevrez une invitation par e-mail pour laisser un avis sur les prestataires que vous avez contactés via InstantMariage.fr. Vous pouvez également le faire depuis la fiche du prestataire en vous connectant à votre compte. Les avis sont modérés avant publication pour garantir leur authenticité.",
  },
];

const faqPrestataires: FaqItem[] = [
  {
    q: "Comment m'inscrire en tant que prestataire sur InstantMariage.fr ?",
    a: "Cliquez sur « Inscription gratuite » en haut du site, choisissez le profil « Prestataire » et remplissez les informations de votre entreprise (nom, métier, zone d'intervention, description). Votre profil est actif immédiatement, même avec le plan gratuit. Vous pourrez ensuite compléter votre galerie photos et vos informations de contact.",
  },
  {
    q: "Combien coûte l'inscription sur InstantMariage.fr ?",
    a: "L'inscription de base est gratuite et vous permet d'être référencé dans notre annuaire avec un profil simple. Pour bénéficier d'outils avancés (devis, galerie photos, formulaire de contact, statistiques), nous proposons des abonnements payants à partir de 9,90 €/mois. Consultez notre page Tarifs pour comparer toutes les formules.",
  },
  {
    q: "Comment être mis en avant dans l'annuaire ?",
    a: "Les prestataires avec un abonnement Premium apparaissent en tête des résultats de recherche et sont mis en avant sur la page d'accueil. Avec le plan Pro, vous bénéficiez du badge « Prestataire vérifié » qui rassure les futurs mariés et améliore votre classement. La qualité de votre profil (photos, description complète, avis clients) joue également un rôle important.",
  },
  {
    q: "Comment gérer mon profil prestataire ?",
    a: "Connectez-vous à votre espace prestataire depuis « Mon espace » en haut du site. Vous pouvez y modifier votre description, ajouter ou supprimer des photos, mettre à jour vos coordonnées, consulter vos statistiques de visites et gérer vos devis et factures. Toutes les modifications sont répercutées en temps réel sur votre fiche publique.",
  },
  {
    q: "Puis-je répondre aux messages des futurs mariés ?",
    a: "Oui, dès qu'un(e) marié(e) vous contacte, vous recevez une notification par e-mail. Vous pouvez répondre directement depuis votre espace prestataire via notre messagerie intégrée. La messagerie est disponible pour tous les abonnements, y compris le plan gratuit.",
  },
  {
    q: "Puis-je changer de formule ou annuler mon abonnement ?",
    a: "Oui, vous pouvez upgrader, downgrader ou annuler votre abonnement à tout moment depuis votre espace prestataire, rubrique « Mon abonnement ». En cas d'annulation, votre accès aux fonctionnalités payantes reste actif jusqu'à la fin de la période en cours. Aucuns frais d'annulation ne sont prélevés.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...faqMaries, ...faqPrestataires].map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen">
        <Header />
        <FaqContent faqMaries={faqMaries} faqPrestataires={faqPrestataires} />
        <Footer />
      </main>
    </>
  );
}
