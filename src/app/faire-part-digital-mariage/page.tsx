import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part digital mariage — Invitation en ligne moderne | InstantMariage",
  description:
    "Créez votre faire-part de mariage digital en ligne. Partagez par lien, SMS ou email. RSVP intégré, animations, personnalisation complète. 100% gratuit pour l'invitation digitale.",
  keywords: [
    "faire-part digital mariage",
    "faire-part mariage en ligne",
    "invitation mariage digital",
    "faire-part numérique mariage",
    "invitation en ligne mariage",
    "faire-part mariage internet",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-digital-mariage" },
  openGraph: {
    title: "Faire-part digital mariage — Invitation en ligne moderne | InstantMariage",
    description:
      "Invitation de mariage 100% digitale. Partagez par lien, recevez les RSVP automatiquement. Gratuit.",
    url: "https://instantmariage.fr/faire-part-digital-mariage",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part digital mariage — InstantMariage",
  description:
    "Faire-part de mariage digital et en ligne. Partagez votre invitation par lien, recevez les RSVP automatiquement.",
  url: "https://instantmariage.fr/faire-part-digital-mariage",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part digital", item: "https://instantmariage.fr/faire-part-digital-mariage" },
    ],
  },
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "Créateur de faire-part digital mariage InstantMariage",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  },
};

export default function FairePartDigitalMariagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-sky-50 via-blue-50 to-white py-16 md:py-24 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #0284C7, transparent)" }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <p className="text-sm font-semibold text-sky-500 uppercase tracking-widest mb-3">
              100% digital · Gratuit
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#0284C7" }}>digital</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              L'invitation de mariage moderne. Créez, personnalisez et partagez votre faire-part en ligne en quelques minutes. Vos invités reçoivent le lien, confirment leur présence, et vous gérez tout depuis votre tableau de bord.
            </p>
            <Link
              href="/faire-part"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#0284C7" }}
            >
              Créer mon faire-part digital
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Comparaison digital vs papier */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Faire-part digital vs faire-part papier
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 text-gray-500 font-medium text-sm"></th>
                    <th className="py-4 px-4 text-center">
                      <span className="inline-block bg-sky-100 text-sky-700 font-bold text-sm px-4 py-1.5 rounded-full">Digital ✦</span>
                    </th>
                    <th className="py-4 px-4 text-center">
                      <span className="inline-block bg-gray-100 text-gray-600 font-medium text-sm px-4 py-1.5 rounded-full">Papier</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Coût", "Gratuit", "5 – 10 € / unité"],
                    ["Délai d'envoi", "Instantané", "2 – 4 semaines"],
                    ["Modifications possibles", "À tout moment", "Impression nouvelle"],
                    ["Confirmation de présence", "✓ Intégrée", "Courrier / téléphone"],
                    ["Animations", "✓ Incluses", "Non"],
                    ["Impact écologique", "✓ Minimal", "Papier + transport"],
                    ["Photo du couple", "✓ Incluse", "Option coûteuse"],
                    ["Portée internationale", "✓ Immédiate", "Délais postaux"],
                  ].map(([feature, digital, papier], i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{feature}</td>
                      <td className="py-3.5 px-4 text-center text-sm text-sky-700 font-semibold">{digital}</td>
                      <td className="py-3.5 px-4 text-center text-sm text-gray-400">{papier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="py-16 bg-sky-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Tout ce qu'inclut votre faire-part digital
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🔗", title: "Lien personnalisé", desc: "Votre invitation accessible via un lien unique que vous partagez librement. Pas d'application à télécharger pour vos invités." },
                { icon: "💌", title: "Confirmer ma présence", desc: "Vos invités confirment leur présence, le nombre d'accompagnants et leurs restrictions alimentaires directement en ligne." },
                { icon: "📊", title: "Tableau de bord", desc: "Suivez en temps réel le nombre d'ouvertures, les confirmations de présence et les réponses de chaque invité." },
                { icon: "🎨", title: "8 templates élégants", desc: "Du classique au contemporain, chaque template a été designé par des experts du mariage pour une esthétique irréprochable." },
                { icon: "📷", title: "Photo du couple", desc: "Intégrez votre plus belle photo de couple directement dans l'invitation pour une touche ultra-personnelle." },
                { icon: "🌐", title: "Multi-langue", desc: "Rédigez votre faire-part en français, anglais ou toute autre langue pour vos invités internationaux." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contenu SEO */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Le faire-part digital : la révolution de l'invitation de mariage
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le faire-part de mariage digital marque une véritable révolution dans la manière d'annoncer son union. Exit les semaines d'attente avant de recevoir ses invitations de chez l'imprimeur, les enveloppes à coller une à une et les frais postaux qui s'accumulent. Avec un faire-part digital, vous envoyez votre invitation à tous vos proches en quelques secondes, où qu'ils se trouvent dans le monde.
              </p>
              <p>
                Le faire-part numérique ne sacrifie rien à l'élégance. Bien au contraire : il vous offre des possibilités de personnalisation bien supérieures au format papier. Vous pouvez intégrer des animations, une galerie de photos, un plan interactif vers le lieu de réception, et même une liste de mariage directement accessible depuis l'invitation.
              </p>
              <p>
                L'un des atouts majeurs du faire-part digital est la gestion automatisée des RSVP. Fini les relances téléphoniques fastidieuses et les post-it perdus ! Vos invités confirment leur présence en ligne, et vous recevez une notification à chaque réponse. Le décompte exact du nombre de personnes est disponible en temps réel, vous facilitant grandement la coordination avec votre traiteur.
              </p>
              <p>
                La dimension éco-responsable est également un argument de poids pour de nombreux couples. Un faire-part digital évite l'impression de centaines de cartons, économisant ainsi papier, encre et carbone lié au transport postal. Pour un mariage respectueux de l'environnement, c'est un choix cohérent et moderne.
              </p>
              <p>
                Si vous souhaitez conserver le charme du faire-part papier pour certains invités (grands-parents, invités moins à l'aise avec le numérique), rien ne vous empêche de combiner les deux : un faire-part digital pour la majorité de vos invités, et une impression sélective pour les quelques personnes qui le souhaitent. InstantMariage vous propose les deux options dans une interface unifiée.
              </p>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/faire-part"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#0284C7" }}
              >
                Créer mon faire-part digital gratuit
              </Link>
              <p className="mt-3 text-sm text-gray-400">Aucune carte bancaire requise · Prêt en 5 minutes</p>
            </div>
          </div>
        </section>

        {/* Liens internes */}
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">À découvrir aussi</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: "/faire-part-mariage", label: "Faire-part mariage" },
                { href: "/faire-part-anime-mariage", label: "Faire-part animé" },
                { href: "/faire-part-mariage-gratuit", label: "Faire-part gratuit" },
                { href: "/faire-part-mariage-boheme", label: "Style bohème" },
                { href: "/faire-part-mariage-luxe", label: "Style luxe" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
