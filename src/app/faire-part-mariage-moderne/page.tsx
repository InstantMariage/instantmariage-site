import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage moderne — Invitation épurée & contemporaine | InstantMariage",
  description:
    "Faire-part de mariage moderne et minimaliste. Design épuré, typographie contemporaine, lignes géométriques fines. Template Moderne Minimal personnalisable avec RSVP intégré.",
  keywords: [
    "faire-part mariage moderne",
    "faire-part mariage minimaliste",
    "invitation mariage contemporaine",
    "faire-part mariage épuré",
    "faire-part mariage design",
    "invitation mariage tendance",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-moderne" },
  openGraph: {
    title: "Faire-part mariage moderne — Invitation épurée & contemporaine | InstantMariage",
    description:
      "Faire-part moderne et minimaliste : typographie contemporaine, design épuré. Personnalisez votre invitation.",
    url: "https://instantmariage.fr/faire-part-mariage-moderne",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage moderne — InstantMariage",
  description:
    "Faire-part de mariage moderne et minimaliste. Design épuré, typographie contemporaine, esthétique intemporelle.",
  url: "https://instantmariage.fr/faire-part-mariage-moderne",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part moderne", item: "https://instantmariage.fr/faire-part-mariage-moderne" },
    ],
  },
};

export default function FairePartMariageModernePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-white via-gray-50 to-slate-100 py-16 md:py-24 overflow-hidden border-b border-gray-100">
          <div className="absolute top-8 left-8 w-12 h-px bg-gray-400 opacity-20 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-12 h-px bg-gray-400 opacity-20 pointer-events-none" />
          <div className="absolute top-8 right-8 w-px h-12 bg-gray-400 opacity-20 pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-px h-12 bg-gray-400 opacity-20 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider">
              ◼ Style Moderne Minimaliste
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span className="text-gray-500">moderne</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              L'élégance dans sa forme la plus pure. Design épuré, typographies soigneusement choisies, espaces blancs maîtrisés. Votre faire-part moderne dit beaucoup en peu — et c'est tout l'art.
            </p>
            <Link
              href="/faire-part/moderne-minimal"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Personnaliser ce template
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Philosophie design */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Le template Moderne Minimal
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Inspiré des grands principes du design contemporain — moins, c'est plus — notre template Moderne Minimal s'adresse aux couples qui ont le goût de l'épure et de l'intemporel. Pas d'ornements superflus, pas de fioritures inutiles : chaque élément gagne en impact précisément parce qu'il est seul.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  La typographie est l'héroïne de ce template. Associations de grotesques modernes et de serifs classiques, hiérarchie visuelle irréprochable, espacement parfait — votre invitation respire et s'impose avec autorité dans la boîte mail ou sur l'écran de vos invités.
                </p>
                <ul className="space-y-2">
                  {[
                    "Palette : blanc, gris ardoise, noir",
                    "Style typographique : sans-serif moderne + serif",
                    "Motifs : lignes géométriques fines",
                    "Ambiance : studio, galerie d'art, loft",
                    "Animation : fade progressif & typographie animée",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-900 font-bold">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Template preview */}
              <div className="flex justify-center">
                <div className="w-72 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                  <div className="bg-gradient-to-br from-white via-gray-50 to-slate-100 h-64 flex flex-col items-center justify-center p-6 relative">
                    <div className="absolute top-6 left-6 w-8 h-px bg-gray-400 opacity-40" />
                    <div className="absolute bottom-6 right-6 w-8 h-px bg-gray-400 opacity-40" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-2">Mariage</p>
                    <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair), serif" }}>Sophie & Thomas</p>
                    <div className="my-3 w-full max-w-24 h-px bg-gray-300 opacity-50" />
                    <p className="text-xs text-gray-400 tracking-wide">14 · 06 · 2025</p>
                    <p className="text-xs text-gray-400 mt-1 tracking-wide">Paris, France</p>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-gray-700">Moderne Minimal</p>
                    <p className="text-xs text-gray-400 mt-0.5">Épuré & Contemporain</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pour quel mariage ? */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Le faire-part moderne, pour quel mariage ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🏙️", title: "Mariage urbain", desc: "Loft parisien, rooftop, musée, galerie d'art — le fair-part moderne est parfaitement accordé aux espaces industriels et contemporains de la ville." },
                { icon: "⬜", title: "Décoration épurée", desc: "Si votre palette est blanc, noir et graphite, si votre décoration joue la minimaliste architecturale, ce template vous ressemble." },
                { icon: "📐", title: "Couples design", desc: "Architectes, graphistes, artistes, créatifs — ce template parle le même langage que vous et reflète votre sensibilité esthétique." },
                { icon: "🖤", title: "Mariage noir & blanc", desc: "Le noir et blanc dans toute sa puissance. Ce faire-part moderne transcende les tendances et reste beau dans 10, 20, 50 ans." },
                { icon: "🌃", title: "Soirée de gala", desc: "Pour un mariage en soirée avec dress code strict, le faire-part moderne imposera le ton avec une élégance sans effort." },
                { icon: "🔲", title: "Second mariage", desc: "Pour un deuxième mariage ou une cérémonie intime entre adultes, la sobriété contemporaine est souvent plus juste que l'exubérance." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
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
              Le faire-part de mariage moderne : la force du minimalisme
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le minimalisme en design n'est pas une mode passagère — c'est une philosophie esthétique qui a traversé les décennies sans vieillir. Dieter Rams, Muji, Apple : les grandes marques qui incarnent le design contemporain partagent toutes cette conviction que la beauté réside dans la suppression du superflu, dans la précision du geste, dans la clarté du message. Appliquer ces principes à votre faire-part de mariage, c'est choisir une invitation qui restera belle longtemps après que les tendances du moment seront oubliées.
              </p>
              <p>
                Le faire-part moderne a également cet avantage de ne pas s'imposer mais de se laisser découvrir. Là où d'autres templates chargent l'œil de motifs et d'ornements, le template Moderne Minimal laisse de l'espace pour respirer. Vos prénoms sont mis en valeur par les espaces blancs qui les entourent. La date ressort grâce à sa position isolée. Le lieu s'affirme par sa typographie contrastée.
              </p>
              <p>
                Ce faire-part s'adapte particulièrement bien aux mariages parisiens, aux lieux de réception industriels reconvertis (anciennes usines, entrepôts, ateliers), aux galeries d'art et aux espaces contemporains. Il convient aussi parfaitement aux couples qui ont opté pour une cérémonie laïque épurée ou un mariage civil intimiste.
              </p>
              <p>
                Le digital renforce encore l'esthétique moderne de ce template. Sur écran, les contrastes sont nets, les typographies impeccables, les animations discrètes mais soignées. La révélation progressive des informations, qui s'affichent une à une sur fond blanc immaculé, crée une expérience de lecture contemplative — l'opposé de la surcharge visuelle. Vos invités prendront le temps de lire chaque mot, attentifs et curieux.
              </p>
              <p>
                Pour personnaliser votre faire-part moderne, pensez à choisir des informations précises et bien rédigées — ce template met les mots en valeur autant que le design. Rédigez votre message personnel avec soin : quelques phrases bien tournées, sans emphase excessive. La sobriété du template appelle à la même sobriété dans le texte.
              </p>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part/moderne-minimal"
                className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Créer mon faire-part moderne
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
                { href: "/faire-part-mariage-luxe", label: "Style luxe" },
                { href: "/faire-part-mariage-champetre", label: "Style champêtre" },
                { href: "/faire-part-mariage", label: "Tous les faire-part" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-600 hover:text-gray-900 transition-colors">
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
