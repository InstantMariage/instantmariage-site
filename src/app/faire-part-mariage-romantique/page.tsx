import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage romantique fleuri — Douceur & Poésie | InstantMariage",
  description:
    "Faire-part de mariage romantique avec pivoines, roses et douceur rose poudré. Template Romantique Floral personnalisable en ligne. RSVP intégré, partage par lien.",
  keywords: [
    "faire-part mariage romantique",
    "faire-part mariage fleuri",
    "invitation mariage romantique",
    "faire-part mariage pivoine",
    "faire-part mariage roses",
    "faire-part mariage rose poudré",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-romantique" },
  openGraph: {
    title: "Faire-part mariage romantique fleuri — Douceur & Poésie | InstantMariage",
    description:
      "Faire-part de mariage romantique : pivoines, roses, tons rose poudré. Personnalisez votre invitation florale.",
    url: "https://instantmariage.fr/faire-part-mariage-romantique",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage romantique — InstantMariage",
  description:
    "Faire-part de mariage romantique et fleuri. Pivoines et roses en pleine floraison, douceur rose poudré.",
  url: "https://instantmariage.fr/faire-part-mariage-romantique",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part romantique", item: "https://instantmariage.fr/faire-part-mariage-romantique" },
    ],
  },
};

export default function FairePartMariageRomantiquePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 text-[12rem] select-none">
            🌸
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              🌸 Style Romantique Fleuri
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-rose-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part mariage{" "}
              <span style={{ color: "#F06292" }}>romantique fleuri</span>
            </h1>
            <p className="text-lg text-rose-700/70 max-w-2xl mx-auto leading-relaxed mb-8">
              Douceur et poésie. Pivoines et roses en pleine floraison, tons rose poudré et ivoire — votre faire-part romantique transmet à vos invités toute la tendresse et l&apos;émotion de votre union.
            </p>
            <Link
              href="/faire-part/romantique-floral"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#F06292" }}
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
                  Le template Romantique Floral
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conçu pour les couples qui assument pleinement leur romantisme, le template Romantique Floral célèbre la beauté des fleurs et la poésie des émotions. Pivoines, roses de jardin et fleurs sauvages composent un décor luxuriant et délicat, à la fois élégant et chaleureux.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  La palette rose poudré, nude et fuchsia est relevée par des touches d&apos;ivoire et d&apos;or. La calligraphie douce et les typographies sereines créent une invitation qui touche au cœur dès le premier regard.
                </p>
                <ul className="space-y-2">
                  {[
                    "Palette : rose poudré, fuchsia, ivoire",
                    "Style typographique : calligraphie & serif doux",
                    "Motifs : pivoines, roses, fleurs romantiques",
                    "Ambiance : romantique, poétique, féminin",
                    "Animation : pluie de pétales & révélation douce",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span style={{ color: "#F06292" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Template preview */}
              <div className="flex justify-center">
                <div className="w-72 rounded-2xl overflow-hidden shadow-xl border border-rose-100">
                  <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 h-64 flex flex-col items-center justify-center p-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl pointer-events-none select-none">🌸</div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1 relative">Mariage</p>
                    <p className="text-xl font-bold text-rose-700 relative" style={{ fontFamily: "var(--font-playfair), serif" }}>Sophie & Thomas</p>
                    <div className="my-3 flex items-center gap-2 relative">
                      <div className="h-px w-10 opacity-40" style={{ background: "#F06292" }} />
                      <div className="w-1 h-1 rounded-full opacity-40" style={{ background: "#F06292" }} />
                      <div className="h-px w-10 opacity-40" style={{ background: "#F06292" }} />
                    </div>
                    <p className="text-xs text-rose-500 relative">14 Juin 2025 · Château des Roses</p>
                    <p className="text-xs text-rose-400 mt-1 relative">Val de Loire</p>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-rose-600">Romantique Floral</p>
                    <p className="text-xs text-gray-400 mt-0.5">Romantique & Fleuri</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mariages romantiques */}
        <section className="py-16 bg-rose-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Le faire-part romantique, pour quel mariage ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🌹", title: "Mariage avec fleuriste", desc: "Si vous avez choisi un fleuriste qui travaille les pivoines, les roses garden et les fleurs délicates, votre faire-part annonce déjà la beauté de vos compositions florales." },
                { icon: "🏰", title: "Château & Orangerie", desc: "Un château, une orangerie, un manoir fleuri — les cadres romantiques appellent des invitations à leur mesure, où la délicatesse règne." },
                { icon: "🌷", title: "Thème garden party", desc: "Pour un mariage dans un jardin anglais ou une propriété avec roseraie, le fair-part fleuri est en parfaite harmonie avec votre décoration." },
                { icon: "🕯️", title: "Cérémonie intime", desc: "Un faire-part romantique prépare vos invités à une atmosphère douce et chaleureuse, où les émotions et les regards comptent plus que le protocole." },
                { icon: "🎀", title: "Mariage printemps", desc: "Mai, juin — la saison des pivoines est la saison idéale pour ce template floral. Vos invités auront hâte de voir les vraies fleurs répondre à l'invitation." },
                { icon: "💌", title: "Mariage en famille", desc: "La douceur du romantique floral convient parfaitement aux mariages familiaux où l'amour et la tendresse s'expriment sans retenue." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-rose-100">
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
              Le faire-part de mariage romantique fleuri : douceur et poésie
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le romantisme dans le mariage n&apos;est jamais démodé. Il s&apos;exprime au contraire avec une fraîcheur nouvelle à chaque génération, adaptant ses codes visuels aux tendances du moment tout en restant fidèle à l&apos;essentiel : l&apos;amour, la douceur et la beauté. Un faire-part romantique fleuri est la promesse d&apos;une journée où les émotions seront au premier plan.
              </p>
              <p>
                Les fleurs ont toujours été le langage du romantisme. La pivoine, reine des fleurs de mariage depuis les années 2010, est devenue l&apos;emblème des célébrations délicates et généreuses. La rose de jardin, aux pétales multiples et aux couleurs tendres, apporte chaleur et abondance. Associées dans notre template Romantique Floral, elles composent une invitation qui n&apos;a pas besoin de mots pour communiquer la beauté de votre amour.
              </p>
              <p>
                La palette de couleurs a été soigneusement choisie pour capturer la lumière de l&apos;aube sur un jardin en fleurs. Le rose poudré est la nuance la plus douce du spectre rose — jamais criard, toujours élégant. Le fuchsia vif l&apos;anime et lui donne du caractère. L&apos;ivoire et le blanc apportent l&apos;équilibre et la lumière. Ensemble, ils créent une harmonie chromatique qui fonctionne aussi bien sur écran qu&apos;en impression papier.
              </p>
              <p>
                Personnaliser votre faire-part romantique fleuri est un moment en lui-même. Choisissez vos prénoms, entrez la date de votre grande journée, ajoutez le nom de votre domaine ou de votre château, et rédigez un message personnel qui traduit votre complicité. Vous pouvez intégrer une photo de vous deux — une image dans un jardin fleuri sera particulièrement bien intégrée dans ce template.
              </p>
              <p>
                L&apos;animation de ce template est l&apos;une des plus appréciées de notre collection : une pluie douce de pétales de roses tombe sur votre invitation, vos prénoms se révèlent progressivement dans une calligraphie dorée, et les fleurs s&apos;animent avec délicatesse en arrière-plan. Vos invités auront envie de le regarder encore et encore — et de répondre présent avec enthousiasme.
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
                FAQ — Faire-part mariage romantique
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Quel style pour un faire-part mariage romantique ?",
                    a: "Un faire-part romantique se caractérise par une palette de roses doux, des motifs floraux généreux (pivoines, roses de jardin), une typographie calligraphique et une ambiance délicate et poétique. Notre template Romantique Floral incarne exactement ces codes avec une élégance moderne.",
                  },
                  {
                    q: "Comment personnaliser un faire-part mariage fleuri ?",
                    a: "Sélectionnez le template Romantique Floral depuis notre galerie, puis renseignez vos prénoms, la date et le lieu de votre mariage, un message personnel, et téléchargez une photo de couple. En quelques minutes, votre faire-part fleuri est prêt à être partagé par lien.",
                  },
                  {
                    q: "Le faire-part romantique est-il adapté à tous les mariages ?",
                    a: "Il convient particulièrement aux mariages printaniers et estivaux avec une décoration florale, aux cérémonies en château ou en jardin, et aux couples qui souhaitent exprimer leur tendresse dès l'invitation. Il s'adapte aussi très bien aux mariages en salle avec une décoration florale abondante.",
                  },
                  {
                    q: "Peut-on ajouter sa propre photo dans le faire-part fleuri ?",
                    a: "Oui, le formulaire de personnalisation vous permet d'intégrer une photo de couple. Pour le template Romantique Floral, une photo prise dans un jardin, une roseraie ou un lieu champêtre s'intégrera particulièrement bien dans l'esprit fleuri et poétique de l'invitation.",
                  },
                  {
                    q: "Combien de temps faut-il pour créer un faire-part mariage romantique ?",
                    a: "Entre 5 et 15 minutes. Vous remplissez le formulaire de personnalisation, l'animation est générée automatiquement, et vous obtenez un lien à partager immédiatement. Aucune compétence technique n'est requise.",
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
                href="/faire-part/romantique-floral"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#F06292" }}
              >
                Créer mon faire-part romantique
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
                { href: "/faire-part-mariage-provence", label: "Style Provence" },
                { href: "/faire-part-mariage-luxe", label: "Style luxe" },
                { href: "/faire-part-mariage-moderne", label: "Style moderne" },
                { href: "/faire-part-mariage", label: "Tous les faire-part" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 transition-colors">
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
