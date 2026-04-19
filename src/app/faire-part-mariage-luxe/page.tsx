import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage luxe — Invitations haut de gamme | InstantMariage",
  description:
    "Faire-part de mariage luxe et haut de gamme. Marbre blanc et or, calligraphie sophistiquée, élégance absolue. Template Luxe Marbré personnalisable. RSVP intégré.",
  keywords: [
    "faire-part mariage luxe",
    "faire-part mariage haut de gamme",
    "invitation mariage luxe",
    "faire-part mariage or",
    "faire-part mariage marbre",
    "faire-part mariage prestige",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-luxe" },
  openGraph: {
    title: "Faire-part mariage luxe — Invitations haut de gamme | InstantMariage",
    description:
      "Faire-part de mariage luxe : marbre blanc, or, calligraphie raffinée. Personnalisez votre invitation prestige.",
    url: "https://instantmariage.fr/faire-part-mariage-luxe",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage luxe — InstantMariage",
  description:
    "Faire-part de mariage luxe haut de gamme. Marbre blanc et or, typographie sophistiquée, élégance absolue.",
  url: "https://instantmariage.fr/faire-part-mariage-luxe",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part luxe", item: "https://instantmariage.fr/faire-part-mariage-luxe" },
    ],
  },
};

export default function FairePartMariageLuxePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-200 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: "linear-gradient(135deg, transparent 30%, rgba(139,115,85,0.3) 45%, transparent 55%, rgba(139,115,85,0.15) 70%, transparent 80%)" }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-zinc-800/10 text-zinc-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              ✦ Luxe & Prestige
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#8B7355" }}>luxe</span>
            </h1>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Une invitation à la hauteur de votre union d'exception. Veines de marbre blanc, rehauts d'or, typographie de prestige. Votre faire-part luxe sera à la mesure de vos ambitions.
            </p>
            <Link
              href="/faire-part/luxe-marbre"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #8B7355, #C9A96E)" }}
            >
              Personnaliser ce template
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Caractéristiques luxe */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Le template Luxe Marbré
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conçu pour les couples qui ne font aucun compromis sur l'élégance, le template Luxe Marbré s'inspire des palaces et des grandes maisons de couture. Chaque détail est pensé pour transmettre un sentiment d'excellence et de raffinement rare.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Les veinures de marbre blanc et les rehauts dorés créent une profondeur visuelle sophistiquée. La typographie associe serif classique et lignes géométriques fines pour un résultat d'une sobriété absolue — le comble du luxe.
                </p>
                <ul className="space-y-2">
                  {[
                    "Palette : blanc, zinc, or champagne",
                    "Style typographique : serif classique & script doré",
                    "Motifs : veines de marbre et filets dorés",
                    "Ambiance : palace, raffinement, prestige",
                    "Animation : révélation progressive & or animé",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span style={{ color: "#C9A96E" }}>✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Template preview */}
              <div className="flex justify-center">
                <div className="w-72 rounded-2xl overflow-hidden shadow-xl border border-zinc-200">
                  <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-200 h-64 flex flex-col items-center justify-center p-6 relative">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(135deg, transparent 30%, rgba(139,115,85,0.3) 45%, transparent 55%, rgba(139,115,85,0.15) 70%, transparent 80%)" }} />
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1 relative">Mariage</p>
                    <p className="text-xl font-bold text-zinc-800 relative" style={{ fontFamily: "var(--font-playfair), serif" }}>Sophie & Thomas</p>
                    <div className="my-3 flex items-center gap-2 relative">
                      <div className="h-px w-10 opacity-40" style={{ background: "#8B7355" }} />
                      <div className="w-1 h-1 rounded-full opacity-40" style={{ background: "#8B7355" }} />
                      <div className="h-px w-10 opacity-40" style={{ background: "#8B7355" }} />
                    </div>
                    <p className="text-xs text-zinc-500 relative">14 Juin 2025 · Château de Vaux</p>
                    <p className="text-xs text-zinc-400 mt-1 relative">Île-de-France</p>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-zinc-700">Luxe Marbré</p>
                    <p className="text-xs text-gray-400 mt-0.5">Luxe & Sophistiqué</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Occasions luxe */}
        <section className="py-16 bg-zinc-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Pour quels mariages le faire-part luxe est-il idéal ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🏰", title: "Château & Manoir", desc: "Votre réception dans un château du Val de Loire, un manoir normand ou une demeure historique mérite une invitation à la même hauteur." },
                { icon: "🎭", title: "Cérémonie à Paris", desc: "Mariage à Paris, au bord de la Seine ou dans les beaux quartiers ? Le style luxe marbré est l'écrin idéal pour votre invitation parisienne." },
                { icon: "🌊", title: "Riviera & Palace", desc: "Monaco, Cannes, Saint-Tropez… sur la Côte d'Azur, votre faire-part luxe sera parfaitement à sa place parmi vos invités de prestige." },
                { icon: "🥂", title: "Mariage gastronomique", desc: "Si votre traiteur étoilé compose un menu d'exception, votre faire-part luxe annonce la couleur dès la première impression." },
                { icon: "💎", title: "Black tie & Gala", desc: "Pour un mariage en tenue de soirée ou un gala de mariage, le faire-part luxe impose le dress code avec sobriété et élégance." },
                { icon: "✈️", title: "Mariage destination", desc: "Venice, Amalfi, Santorini… pour un mariage à l'étranger, votre invitation luxe voyage avec classe aux quatre coins du monde." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
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
              Le faire-part de mariage luxe : l'élégance absolue
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le faire-part de mariage luxe est bien plus qu'une simple invitation. C'est le premier ambassadeur de votre cérémonie d'exception, la promesse d'une journée hors du commun, l'annonce d'un événement dont vos invités se souviendront toute leur vie. Il doit donc refléter, dès la première seconde, le niveau d'excellence de votre mariage.
              </p>
              <p>
                Le design marbré et or s'est imposé comme le langage visuel du mariage prestige. Les veines naturelles du marbre évoquent l'intemporel, la pierre, la solidité — autant de symboles forts pour une union qui s'inscrit dans la durée. L'or, quant à lui, est depuis des millénaires la couleur de la royauté, de la richesse et de la lumière. Associés, ils créent une esthétique à la fois puissante et délicate.
              </p>
              <p>
                Notre template Luxe Marbré intègre ces codes visuels de manière subtile et contemporaine. Nous avons évité le tape-à-l'œil pour préférer une approche nuancée où chaque élément — du choix des typographies aux proportions des marges — a été pensé par nos graphistes pour communiquer le raffinement dans chaque pixel.
              </p>
              <p>
                La personnalisation de votre faire-part luxe suit le même niveau d'exigence. Vous pouvez saisir vos prénoms en toutes lettres, renseigner le lieu exact de votre cérémonie (avec une précision qui reflète votre attention au détail), ajouter une citation choisie ou un poème court, et intégrer une photo de couple d'une qualité irréprochable pour compléter l'impression d'ensemble.
              </p>
              <p>
                Votre faire-part luxe InstantMariage est envoyé par lien numérique — un choix qui, paradoxalement, amplifie son effet de prestige : vos invités reçoivent une invitation animée, sophistiquée, immersive, bien au-delà de ce que peut offrir le papier imprimé. Et si vous souhaitez également une version papier haut de gamme avec finitions premium, notre option d'impression avec pelliculage mat ou brillant et rehauts dorés est disponible sur commande.
              </p>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part/luxe-marbre"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #8B7355, #C9A96E)" }}
              >
                Créer mon faire-part luxe
              </Link>
            </div>
          </div>
        </section>

        {/* Autres styles */}
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">Autres styles de faire-part</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: "/faire-part-mariage-boheme", label: "Style bohème" },
                { href: "/faire-part-mariage-champetre", label: "Style champêtre" },
                { href: "/faire-part-mariage-moderne", label: "Style moderne" },
                { href: "/faire-part-mariage", label: "Tous les faire-part" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-zinc-400 hover:text-zinc-700 transition-colors">
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
