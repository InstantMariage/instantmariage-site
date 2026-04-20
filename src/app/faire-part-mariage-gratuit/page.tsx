import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage gratuit — Invitation digitale sans frais | InstantMariage",
  description:
    "Créez votre faire-part de mariage gratuit en ligne. Invitation digitale animée, RSVP inclus, partage illimité, aucune carte bancaire requise. Commencez en 5 minutes.",
  keywords: [
    "faire-part mariage gratuit",
    "faire-part mariage gratuit en ligne",
    "invitation mariage gratuite",
    "créer faire-part mariage gratuit",
    "faire-part digital gratuit",
    "faire-part mariage sans frais",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-gratuit" },
  openGraph: {
    title: "Faire-part mariage gratuit — Invitation digitale sans frais | InstantMariage",
    description:
      "Faire-part de mariage digital et animé, 100% gratuit. RSVP intégré, 8 templates élégants.",
    url: "https://instantmariage.fr/faire-part-mariage-gratuit",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage gratuit — InstantMariage",
  description:
    "Créez et partagez votre faire-part de mariage digital gratuitement. 8 templates animés, RSVP intégré.",
  url: "https://instantmariage.fr/faire-part-mariage-gratuit",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part gratuit", item: "https://instantmariage.fr/faire-part-mariage-gratuit" },
    ],
  },
  mainEntity: {
    "@type": "Product",
    name: "Faire-part de mariage digital gratuit",
    description: "Invitation de mariage digitale animée, gratuite pour la version en ligne.",
    brand: { "@type": "Brand", name: "InstantMariage" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  },
};

export default function FairePartMariageGratuitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-white py-16 md:py-24 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #10B981, transparent)" }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-bold px-5 py-2 rounded-full mb-5">
              <span>✓</span>
              <span>100% Gratuit · Sans carte bancaire</span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#10B981" }}>gratuit</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              Créez, personnalisez et partagez votre faire-part de mariage digital sans débourser un centime. 8 templates élégants, animations incluses, RSVP automatique — tout gratuitement.
            </p>
            <Link
              href="/faire-part"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#10B981" }}
            >
              Créer mon faire-part gratuit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="mt-3 text-sm text-gray-400">Prêt en 5 minutes · Aucun engagement</p>
          </div>
        </section>

        {/* Ce qui est gratuit */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Tout est gratuit pour votre faire-part digital
            </h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              Pas de freemium caché, pas de limite artificielle. Voici ce que vous obtenez gratuitement.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { feature: "Accès à 8 templates premium", detail: "Tous nos templates sont disponibles gratuitement, sans restriction de choix." },
                { feature: "Animations incluses", detail: "Les effets visuels animés (particules, révélation, transitions) sont inclus dans la version gratuite." },
                { feature: "Personnalisation complète", detail: "Vos prénoms, date, lieu, message et photo de couple — tout est personnalisable gratuitement." },
                { feature: "Lien de partage illimité", detail: "Partagez votre faire-part avec autant d'invités que vous le souhaitez, sans limite." },
                { feature: "Confirmation de présence", detail: "Recevez les confirmations de présence de tous vos invités via le formulaire intégré." },
                { feature: "Tableau de bord des réponses", detail: "Suivez les confirmations en temps réel depuis votre espace personnel." },
                { feature: "Compatible mobile & desktop", detail: "Votre faire-part s'affiche parfaitement sur tous les appareils, pour tous vos invités." },
                { feature: "Lien permanent", detail: "Votre faire-part reste accessible en ligne pendant toute la durée de vos préparatifs." },
              ].map((item) => (
                <div key={item.feature} className="flex gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mt-0.5">✓</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.feature}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Options payantes (transparence) */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Options d'impression (optionnelles)
            </h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Si vous souhaitez également envoyer des faire-part papier à certains invités, nous proposons l'impression professionnelle en option. Ces options sont entièrement facultatives et n'affectent pas votre faire-part digital gratuit.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "50 exemplaires", price: "à partir de 9,90 €", note: "Format standard" },
                { label: "100 exemplaires", price: "à partir de 19,90 €", note: "Format standard" },
                { label: "300 exemplaires", price: "à partir de 49,90 €", note: "Format standard" },
              ].map((opt) => (
                <div key={opt.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-lg font-bold mt-1" style={{ color: "#F06292" }}>{opt.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.note}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              L'impression reste une option. Votre faire-part digital est et reste gratuit.
            </p>
          </div>
        </section>

        {/* Contenu SEO */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Faire-part de mariage gratuit : ce que vous devez savoir
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Organiser un mariage représente un budget conséquent. Entre la location du lieu de réception, le traiteur, la robe, la musique et les fleurs, chaque poste de dépense s'accumule rapidement. Les faire-part de mariage constituent souvent un poste budgétaire significatif, en particulier lorsqu'il faut imprimer et envoyer des invitations à plusieurs dizaines ou centaines de personnes.
              </p>
              <p>
                Avec InstantMariage, vous pouvez créer et partager votre faire-part de mariage en ligne gratuitement, sans compromettre la qualité ou l'élégance de votre invitation. Notre faire-part digital gratuit offre exactement les mêmes fonctionnalités et les mêmes templates que les versions payantes — la gratuité ne signifie pas se contenter du minimum.
              </p>
              <p>
                Comment est-ce possible ? Parce que nous croyons que chaque couple mérite une belle invitation, quelle que soit son enveloppe budgétaire. Notre modèle économique repose sur les options d'impression papier (pour les couples qui souhaitent compléter leur faire-part digital par des exemplaires physiques) et sur notre plateforme de mise en relation avec les prestataires de mariage. Le faire-part digital reste entièrement gratuit.
              </p>
              <p>
                Beaucoup de couples choisissent une approche hybride : un faire-part digital partagé par messagerie instantanée, email et réseaux sociaux pour la grande majorité de leurs invités, complété par quelques dizaines d'exemplaires papier pour les personnes âgées ou moins à l'aise avec le numérique, et pour conserver un souvenir physique de leur mariage. C'est une solution à la fois économique, pratique et écologique.
              </p>
              <p>
                Pour commencer, il vous suffit de choisir parmi nos 8 templates exclusifs, de renseigner vos informations et de générer votre lien de partage. En quelques minutes, votre faire-part de mariage animé est prêt à être envoyé. Aucune inscription préalable n'est requise pour commencer à personnaliser votre invitation.
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
                FAQ — Faire-part gratuit
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Y a-t-il des fonctionnalités masquées derrière un paywall ?",
                    a: "Non. Les 8 templates, les animations, le RSVP et le partage par lien sont entièrement gratuits. Seule l'impression papier est payante.",
                  },
                  {
                    q: "Dois-je créer un compte pour faire un faire-part gratuit ?",
                    a: "Vous pouvez commencer sans compte. Pour sauvegarder votre faire-part et accéder au tableau de bord RSVP, une inscription gratuite est nécessaire.",
                  },
                  {
                    q: "Le lien de partage expire-t-il ?",
                    a: "Non, votre lien reste actif pendant toute la durée de vos préparatifs de mariage.",
                  },
                  {
                    q: "Puis-je avoir à la fois un faire-part digital gratuit et des impressions papier ?",
                    a: "Oui, absolument. Vous pouvez créer votre faire-part digital gratuit et commander l'impression en option, depuis la même interface.",
                  },
                ].map((faq) => (
                  <div key={faq.q} className="border border-gray-100 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#10B981" }}
              >
                Créer mon faire-part gratuit maintenant
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
