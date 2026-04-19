import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage bohème — Invitation champêtre & nature | InstantMariage",
  description:
    "Faire-part de mariage bohème avec aquarelles florales, tons naturels et ambiance bucolique. Template Bohème Champêtre personnalisable en ligne. Partagez par lien avec RSVP intégré.",
  keywords: [
    "faire-part mariage bohème",
    "faire-part bohème champêtre",
    "invitation mariage bohème",
    "faire-part mariage nature",
    "faire-part mariage floral",
    "faire-part mariage champêtre",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-boheme" },
  openGraph: {
    title: "Faire-part mariage bohème — Invitation champêtre & nature | InstantMariage",
    description:
      "Faire-part de mariage bohème : aquarelles florales, tons naturels. Personnalisez votre invitation champêtre.",
    url: "https://instantmariage.fr/faire-part-mariage-boheme",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage bohème — InstantMariage",
  description:
    "Faire-part de mariage bohème et champêtre. Aquarelles florales, tons naturels, ambiance bucolique.",
  url: "https://instantmariage.fr/faire-part-mariage-boheme",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part bohème", item: "https://instantmariage.fr/faire-part-mariage-boheme" },
    ],
  },
};

export default function FairePartMariagebohemePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-stone-100 via-green-50 to-emerald-50 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 10% 10%, #8B6F47 30px, transparent 30px), radial-gradient(ellipse at 90% 90%, #6B8F71 25px, transparent 25px)" }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-stone-200/80 text-stone-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              🌿 Style Bohème Champêtre
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#6B8F71" }}>bohème</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Invitez vos proches avec une invitation qui respire la nature, la liberté et la poésie. Aquarelles florales, tons beige et vert sauge, ambiance champêtre authentique.
            </p>
            <Link
              href="/faire-part/boheme-champetre"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#6B8F71" }}
            >
              Personnaliser ce template
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Aperçu du template */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Le template Bohème Champêtre
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Notre template Bohème Champêtre capture l'essence des mariages en pleine nature. Inspiré des aquarelles botaniques et de la palette de couleurs naturelles, il évoque la légèreté et la liberté d'un mariage sous le ciel ouvert.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Les tons beige, vert sauge et terracotta se marient parfaitement avec des typographies calligraphiques pour créer une invitation qui reflète votre amour de la nature et votre sensibilité artistique.
                </p>
                <ul className="space-y-2">
                  {[
                    "Palette : beige, vert sauge, stone",
                    "Style typographique : calligraphie & serif",
                    "Motifs : floraux et botaniques",
                    "Ambiance : champêtre, poétique, authentique",
                    "Animation : nature & verdure",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Template preview */}
              <div className="flex justify-center">
                <div className="w-72 rounded-2xl overflow-hidden shadow-xl border border-stone-200">
                  <div className="bg-gradient-to-br from-stone-100 via-green-50 to-emerald-100 h-64 flex flex-col items-center justify-center p-6 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 10% 10%, #8B6F47 20px, transparent 20px), radial-gradient(ellipse at 90% 90%, #6B8F71 15px, transparent 15px)" }} />
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1 relative">Mariage</p>
                    <p className="text-xl font-bold text-stone-700 relative" style={{ fontFamily: "var(--font-playfair), serif" }}>Sophie & Thomas</p>
                    <div className="my-3 flex items-center gap-2 relative">
                      <div className="h-px w-10 bg-stone-400 opacity-40" />
                      <div className="w-1 h-1 rounded-full bg-stone-400 opacity-40" />
                      <div className="h-px w-10 bg-stone-400 opacity-40" />
                    </div>
                    <p className="text-xs text-stone-500 relative">14 Juin 2025 · Domaine des Oliviers</p>
                    <p className="text-xs text-stone-400 mt-1 relative">Provence</p>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-stone-600">Bohème Champêtre</p>
                    <p className="text-xs text-gray-400 mt-0.5">Nature & Bohème</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mariages bohème : conseils */}
        <section className="py-16 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Le faire-part bohème : tout ce qu'il dit de votre mariage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🌾", title: "Cadre naturel", desc: "Un domaine, une ferme, un vignoble ou un jardin… votre faire-part bohème annonce un mariage ancré dans la nature." },
                { icon: "🌸", title: "Décoration florale", desc: "Pampa, eucalyptus, pivoines, cosmos : votre invitation porte déjà l'empreinte de votre décoration bohème champêtre." },
                { icon: "🎨", title: "Palette douce", desc: "Les tons neutres et naturels — beige, terracotta, kaki — donnent une cohérence visuelle à vos supports de mariage." },
                { icon: "✍️", name: "Calligraphie", desc: "La typographie calligraphique du template bohème apporte cette touche artisanale et personnelle si caractéristique du style." },
                { icon: "🕯️", title: "Ambiance conviviale", desc: "Un faire-part bohème signe un mariage où l'on se sent bien, où la détente prime sur le protocole, où les émotions s'expriment librement." },
                { icon: "♻️", title: "Éco-responsable", desc: "Le digital bohème est doublement cohérent avec vos valeurs : zéro papier, zéro transport postal, empreinte carbone nulle." },
              ].map((item) => (
                <div key={item.title || item.name} className="bg-white rounded-2xl p-6 border border-stone-100">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title || item.name}</h3>
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
              Créez le faire-part bohème idéal pour votre mariage
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le mariage bohème est l'un des styles de mariage les plus populaires en France depuis plusieurs années. Caractérisé par son atmosphère décontractée, ses décors naturels, ses palettes de couleurs douces et ses ornements végétaux, le mariage bohème séduit les couples qui souhaitent une célébration authentique et pleine d'âme.
              </p>
              <p>
                Le faire-part de mariage est la première communication visuelle que vos invités reçoivent de vous. Il donne le ton de votre journée bien avant que celle-ci n'arrive. Un faire-part bohème bien pensé crée immédiatement une atmosphère, une émotion, une promesse : celle d'un mariage où la nature est reine, où la simplicité est sophistication, où chaque détail raconte une histoire.
              </p>
              <p>
                Notre template Bohème Champêtre a été conçu en collaboration avec des graphistes spécialisés dans les mariages en plein air. Les motifs floraux rappellent les aquarelles botaniques, les couleurs évoquent les paysages de garrigue et de prairie, et la calligraphie apporte cette touche artisanale qui fait toute la différence.
              </p>
              <p>
                Pour personnaliser votre faire-part bohème, rien de plus simple : sélectionnez le template Bohème Champêtre, renseignez vos prénoms, la date et le lieu de votre cérémonie, ajoutez un message personnel qui reflète votre amour de la nature ou une citation qui vous touche, et téléchargez une photo prise en extérieur pour parfaire l'ambiance. En quelques minutes, votre invitation bohème est prête à être partagée.
              </p>
              <p>
                Si vous optez pour un mariage dans un domaine viticole, une ferme rénovée, un jardin provençal ou sous une tente de toile, notre template Bohème Champêtre est idéalement assorti à votre cadre. Il créera une harmonie parfaite entre votre invitation et votre décoration le jour J.
              </p>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part/boheme-champetre"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#6B8F71" }}
              >
                Créer mon faire-part bohème
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
                { href: "/faire-part-mariage-luxe", label: "Style luxe" },
                { href: "/faire-part-mariage-champetre", label: "Style champêtre" },
                { href: "/faire-part-mariage-moderne", label: "Style moderne" },
                { href: "/faire-part-mariage", label: "Tous les faire-part" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
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
