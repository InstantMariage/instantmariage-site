import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part de mariage — Invitations digitales & animées | InstantMariage",
  description:
    "Créez votre faire-part de mariage en ligne en quelques minutes. 8 templates digitaux et animés 100% personnalisables, RSVP intégré, partage instantané. Gratuit pour l'invitation digitale.",
  keywords: [
    "faire-part mariage",
    "faire-part mariage en ligne",
    "invitation mariage digital",
    "faire-part mariage personnalisé",
    "faire-part mariage animé",
    "créer faire-part mariage",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage" },
  openGraph: {
    title: "Faire-part de mariage — Invitations digitales & animées | InstantMariage",
    description:
      "Créez votre faire-part de mariage digital et animé en quelques minutes. 8 templates élégants, RSVP intégré.",
    url: "https://instantmariage.fr/faire-part-mariage",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part de mariage — InstantMariage",
  description:
    "Créez votre faire-part de mariage digital et animé. 8 templates personnalisables avec RSVP intégré.",
  url: "https://instantmariage.fr/faire-part-mariage",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part de mariage", item: "https://instantmariage.fr/faire-part-mariage" },
    ],
  },
  mainEntity: {
    "@type": "Product",
    name: "Faire-part de mariage digital InstantMariage",
    description:
      "Invitation de mariage digitale et animée, personnalisable en ligne avec RSVP intégré et partage par lien.",
    brand: { "@type": "Brand", name: "InstantMariage" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      description: "Faire-part digital gratuit, impression disponible à partir de 9,90 €",
    },
  },
};

const styles = [
  {
    slug: "faire-part-mariage-boheme",
    icon: "🌿",
    name: "Bohème Champêtre",
    desc: "Aquarelles florales, tons naturels, ambiance bucolique et poétique.",
  },
  {
    slug: "faire-part-mariage-luxe",
    icon: "✨",
    name: "Luxe & Raffiné",
    desc: "Marbre blanc et or, typographie sophistiquée, élégance absolue.",
  },
  {
    slug: "faire-part-mariage-champetre",
    icon: "🌾",
    name: "Champêtre Provence",
    desc: "Oliviers, lavande, terre de Provence pour un mariage authentique.",
  },
  {
    slug: "faire-part-mariage-moderne",
    icon: "◼",
    name: "Moderne Minimal",
    desc: "Lignes épurées, espaces blancs, design contemporain et intemporel.",
  },
];

export default function FairePartMariagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #F06292, transparent)" }} />
            <div className="absolute bottom-0 -left-8 w-56 h-56 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #C9A96E, transparent)" }} />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <p className="text-sm font-semibold text-rose-500 uppercase tracking-widest mb-3">
              InstantMariage · Invitations digitales
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#F06292" }}>qui impressionnent</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              Créez en quelques minutes une invitation digitale animée et personnalisée. Partagez-la par lien, recevez les réponses RSVP automatiquement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/faire-part"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#F06292" }}
              >
                Choisir un template
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/faire-part-anime-mariage"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-full border-2 hover:bg-rose-50 transition-all duration-200"
                style={{ borderColor: "#F06292", color: "#F06292" }}
              >
                Voir les animations
              </Link>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Pourquoi choisir un faire-part digital ?
            </h2>
            <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
              Le faire-part de mariage en ligne combine l'élégance du faire-part traditionnel avec les avantages du numérique.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "⚡",
                  title: "Envoi instantané",
                  desc: "Partagez votre invitation par SMS, WhatsApp, e-mail ou réseaux sociaux en un clic. Vos proches reçoivent immédiatement le lien vers votre faire-part animé.",
                },
                {
                  icon: "🎨",
                  title: "Personnalisation totale",
                  desc: "Choisissez parmi 8 templates soigneusement designés. Personnalisez couleurs, textes, photos et informations de votre cérémonie pour un résultat unique.",
                },
                {
                  icon: "💌",
                  title: "Confirmations automatiques",
                  desc: "Fini les appels téléphoniques ! Vos invités confirment leur présence directement en ligne. Consultez le tableau de bord de vos réponses en temps réel.",
                },
                {
                  icon: "📱",
                  title: "Compatible tous écrans",
                  desc: "Votre faire-part s'affiche parfaitement sur smartphone, tablette et ordinateur. Vos invités de tous âges accèdent facilement à votre invitation.",
                },
                {
                  icon: "🌿",
                  title: "Éco-responsable",
                  desc: "Réduisez votre empreinte carbone en optant pour le digital. Un faire-part en ligne économise du papier, de l'encre et le transport postal.",
                },
                {
                  icon: "🖨️",
                  title: "Option impression",
                  desc: "Vous souhaitez également un faire-part papier ? Commandez l'impression professionnelle de vos faire-part directement depuis notre plateforme.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-rose-50/50 rounded-2xl p-6">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Faire-part par style de mariage
            </h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              Que votre mariage soit champêtre, luxueux, moderne ou bohème, nous avons le template idéal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {styles.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {s.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  <div className="mt-4 text-xs font-semibold text-rose-400 flex items-center gap-1">
                    Voir les templates <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contenu SEO détaillé */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Comment créer votre faire-part de mariage en ligne ?
            </h2>
            <div className="prose prose-gray max-w-none space-y-4 text-gray-600 leading-relaxed">
              <p>
                Créer un faire-part de mariage n'a jamais été aussi simple. Avec InstantMariage, vous pouvez concevoir et partager votre invitation de mariage en quelques étapes, sans aucune compétence en design requise.
              </p>
              <p>
                <strong className="text-gray-900">Étape 1 — Choisissez votre template :</strong> Parcourez notre collection de 8 templates exclusifs, des plus classiques aux plus contemporains. Chaque design a été créé par des graphistes spécialisés dans l'univers du mariage. Que vous rêviez d'un faire-part élégance dorée, bohème champêtre, luxe marbré ou moderne minimaliste, vous trouverez votre bonheur.
              </p>
              <p>
                <strong className="text-gray-900">Étape 2 — Personnalisez votre invitation :</strong> Saisissez vos prénoms, la date et le lieu de votre cérémonie, ajoutez un message personnel touchant et téléchargez votre plus belle photo de couple. Notre éditeur en ligne vous permet de visualiser le résultat en temps réel avant de valider.
              </p>
              <p>
                <strong className="text-gray-900">Étape 3 — Partagez et gérez les RSVP :</strong> Une fois votre faire-part créé, vous obtenez un lien unique à partager avec tous vos invités. Ils peuvent consulter l'invitation animée et confirmer leur présence directement en ligne. Vous suivez les réponses depuis votre tableau de bord.
              </p>
              <p>
                Le faire-part digital présente de nombreux avantages par rapport au faire-part papier traditionnel. En plus d'être plus économique et écologique, il vous offre une flexibilité incomparable : vous pouvez modifier les informations jusqu'au dernier moment, ajouter des détails pratiques (plan d'accès, liste de mariage, hébergements) et toucher instantanément vos invités aux quatre coins du monde.
              </p>
              <p>
                Si vous souhaitez également envoyer un faire-part physique pour vos invités qui le préfèrent ou pour conserver un souvenir tangible, InstantMariage propose aussi l'impression professionnelle de vos faire-part à partir de 50 exemplaires, livrés directement chez vous.
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Questions fréquentes sur les faire-part de mariage
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Le faire-part digital est-il gratuit ?",
                    a: "Oui, la création et le partage de votre faire-part digital sont gratuits. L'impression papier est disponible en option payante à partir de 9,90 €.",
                  },
                  {
                    q: "Puis-je modifier mon faire-part après l'avoir partagé ?",
                    a: "Absolument. Vous pouvez mettre à jour les informations de votre faire-part à tout moment depuis votre tableau de bord. Le lien reste le même.",
                  },
                  {
                    q: "Combien de temps à l'avance envoyer les faire-part ?",
                    a: "Il est recommandé d'envoyer vos faire-part 3 à 6 mois avant le mariage pour les invités locaux, et 6 à 12 mois pour les invités venant de loin.",
                  },
                  {
                    q: "Les faire-part fonctionnent-ils sur tous les téléphones ?",
                    a: "Oui, nos faire-part digitaux sont optimisés pour tous les smartphones (iOS et Android), tablettes et ordinateurs.",
                  },
                ].map((faq) => (
                  <div key={faq.q} className="border border-gray-100 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gradient-to-r from-rose-500 to-pink-500 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Créez votre faire-part maintenant
            </h2>
            <p className="text-rose-100 mb-8">
              Rejoignez des milliers de mariés qui ont choisi InstantMariage pour leurs invitations.
            </p>
            <Link
              href="/faire-part"
              className="inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ color: "#F06292" }}
            >
              Commencer gratuitement
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
