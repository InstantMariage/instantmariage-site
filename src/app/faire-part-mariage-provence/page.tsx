import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage Provence — Invitation Sud & Authenticité | InstantMariage",
  description:
    "Faire-part de mariage Provence avec branches d'olivier, lavande et senteurs du Sud. Template Provence Olivier personnalisable en ligne. RSVP intégré, partage par lien.",
  keywords: [
    "faire-part mariage Provence",
    "faire-part mariage thème Provence",
    "invitation mariage Provence",
    "faire-part mariage Côte d'Azur",
    "faire-part mariage lavande",
    "faire-part mariage olivier",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-provence" },
  openGraph: {
    title: "Faire-part mariage Provence — Invitation Sud & Authenticité | InstantMariage",
    description:
      "Faire-part de mariage Provence : oliviers, lavande et soleil du Sud. Personnalisez votre invitation provençale.",
    url: "https://instantmariage.fr/faire-part-mariage-provence",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage Provence — InstantMariage",
  description:
    "Faire-part de mariage thème Provence. Branches d'olivier, lavande, terre de Provence et senteurs estivales.",
  url: "https://instantmariage.fr/faire-part-mariage-provence",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part Provence", item: "https://instantmariage.fr/faire-part-mariage-provence" },
    ],
  },
};

export default function FairePartMariageProvencePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-lime-50 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 text-[12rem] select-none">
            🌿
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              🌿 Style Provence & Midi
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-purple-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part mariage{" "}
              <span style={{ color: "#6B7C45" }}>Provence</span>
            </h1>
            <p className="text-lg text-purple-700/70 max-w-2xl mx-auto leading-relaxed mb-8">
              Soleil et authenticité du Sud. Branches d&apos;olivier, champs de lavande, pierres dorées — votre faire-part Provence annonce un mariage ancré dans la beauté intemporelle du Midi.
            </p>
            <Link
              href="/faire-part/provence-olivier"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#6B7C45" }}
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
                  Le template Provence Olivier
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Né de l&apos;amour des paysages du Midi, notre template Provence Olivier capture la palette des mas provençaux et des domaines agricoles du Sud. Les tons violets de la lavande côtoient les verts profonds de l&apos;olivier et les ocres chauds de la garrigue.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  La typographie calligraphique, les motifs végétaux et la palette solaire créent une invitation qui évoque immédiatement les marchés de Provence, les cigales et la lumière de l&apos;été méditerranéen.
                </p>
                <ul className="space-y-2">
                  {[
                    "Palette : violet lavande, vert olivier, lime",
                    "Style typographique : calligraphie & serif classique",
                    "Motifs : branches d'olivier et botanique",
                    "Ambiance : Provence, mas, vignoble, garrigue",
                    "Animation : végétale & ondulante",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span style={{ color: "#6B7C45" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Template preview */}
              <div className="flex justify-center">
                <div className="w-72 rounded-2xl overflow-hidden shadow-xl border border-purple-100">
                  <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-lime-50 h-64 flex flex-col items-center justify-center p-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl pointer-events-none select-none">🌿</div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-1 relative">Mariage</p>
                    <p className="text-xl font-bold text-purple-800 relative" style={{ fontFamily: "var(--font-playfair), serif" }}>Sophie & Thomas</p>
                    <div className="my-3 flex items-center gap-2 relative">
                      <div className="h-px w-10 opacity-40" style={{ background: "#6B7C45" }} />
                      <div className="w-1 h-1 rounded-full opacity-40" style={{ background: "#6B7C45" }} />
                      <div className="h-px w-10 opacity-40" style={{ background: "#6B7C45" }} />
                    </div>
                    <p className="text-xs text-purple-600 relative">14 Juin 2025 · Mas des Oliviers</p>
                    <p className="text-xs text-purple-400 mt-1 relative">Luberon, Provence</p>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-purple-700">Provence Olivier</p>
                    <p className="text-xs text-gray-400 mt-0.5">Provençal & Authentique</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mariages provençaux */}
        <section className="py-16 bg-violet-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Pour quels mariages le thème Provence est-il idéal ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🏡", title: "Mas provençal", desc: "La bastide en pierre, le pigeonnier, le potager — votre invitation Provence prépare vos invités à la beauté d'un domaine du Luberon ou des Alpilles." },
                { icon: "🌾", title: "Domaine viticole", desc: "Les vignobles de Côtes du Rhône, de Bandol ou des Baux-de-Provence méritent un faire-part qui leur rend hommage avec authenticité." },
                { icon: "🌸", title: "Mariage en lavande", desc: "Si votre cérémonie se tient en juin ou juillet en Haute-Provence, un faire-part aux tons lavande est le choix évident et poétique." },
                { icon: "☀️", title: "Mariage d'été", desc: "Chaleur, lumière, repas interminables à l'ombre des oliviers — votre faire-part Provence annonce une journée de bonheur solaire." },
                { icon: "🫒", title: "Thème méditerranéen", desc: "Oliviers, figuiers, lauriers roses : l'ensemble des végétaux méditerranéens s'harmonise parfaitement avec ce template et sa palette végétale." },
                { icon: "🧺", title: "Mariage champêtre du Sud", desc: "Entre le marché provençal et le pique-nique dans les champs — pour un mariage décontracté mais plein d'élégance naturelle." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-purple-100">
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
              Le faire-part mariage Provence : l&apos;authenticité du Sud
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                La Provence est l&apos;une des régions de France les plus prisées pour les mariages. Chaque année, des milliers de couples choisissent de célébrer leur union dans un mas en pierre, un domaine viticole, un jardin d&apos;oliviers ou au cœur des champs de lavande du plateau de Valensole. La beauté des paysages, la qualité de la lumière et la richesse gastronomique en font un cadre de rêve pour une journée inoubliable.
              </p>
              <p>
                Un faire-part de mariage thème Provence doit capturer cette essence : la couleur violette de la lavande au soleil couchant, le vert argenté des oliviers dans la brise, les ocres chauds des murs en pierre sèche, les senteurs de thym et de romarin. Notre template Provence Olivier a été pensé pour transmettre tout cela dès le premier regard de vos invités.
              </p>
              <p>
                La personnalisation est au cœur de l&apos;expérience. Vous pouvez mentionner le nom de votre domaine — un mas des Alpilles, une bastide du Luberon, un château des Baux-de-Provence — et votre faire-part deviendra immédiatement le reflet de votre lieu de réception. Ajoutez une photo prise dans vos champs préférés ou devant un olivier centenaire, et l&apos;invitation prend une dimension personnelle et poétique incomparable.
              </p>
              <p>
                Si votre mariage se tient en Côte d&apos;Azur — à Nice, Antibes, Cannes ou sur les hauteurs des Alpes-Maritimes — le template Provence Olivier est également très adapté. La palette végétale et lumineuse résonne avec les couleurs du littoral méditerranéen autant qu&apos;avec celles de l&apos;arrière-pays provençal.
              </p>
              <p>
                Pour les couples qui habitent loin et qui organisent un mariage en Provence pour leurs familles, le faire-part digital est particulièrement pratique : vos invités reçoivent instantanément le lien, peuvent consulter les informations, confirmer leur présence et même planifier leur voyage depuis le même endroit. Votre faire-part Provence devient votre premier outil de coordination logistique, en plus d&apos;être une invitation magnifique.
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
                FAQ — Faire-part mariage Provence
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Quel faire-part choisir pour un mariage thème Provence ?",
                    a: "Notre template Provence Olivier est conçu spécifiquement pour les mariages en Provence et dans le Sud de la France. Sa palette violet-vert et ses motifs végétaux méditerranéens en font le choix idéal pour tout mariage dans un mas, un domaine viticole ou un jardin provençal.",
                  },
                  {
                    q: "Peut-on utiliser ce template pour un faire-part mariage Côte d'Azur ?",
                    a: "Oui. Le template Provence Olivier convient aussi bien aux mariages en arrière-pays qu'aux cérémonies sur la Côte d'Azur. Si votre mariage se tient à Nice, Cannes, Antibes ou Saint-Paul-de-Vence, ce template capture parfaitement la luminosité et la végétation méditerranéenne de la région.",
                  },
                  {
                    q: "Comment personnaliser un faire-part mariage avec un thème lavande ?",
                    a: "Sélectionnez le template Provence Olivier et renseignez vos informations. Les tons violets de la lavande sont directement intégrés dans la palette du template. Vous pouvez compléter avec une photo prise dans un champ de lavande pour renforcer encore ce thème.",
                  },
                  {
                    q: "Peut-on mentionner le nom de notre domaine provençal dans le faire-part ?",
                    a: "Absolument. Le champ &laquo; Lieu de réception &raquo; du formulaire de personnalisation vous permet de saisir le nom complet de votre domaine, mas ou bastide, ainsi que la commune et la région. Ces informations s'affichent avec élégance dans le template.",
                  },
                  {
                    q: "Le faire-part Provence est-il disponible en version papier ?",
                    a: "Votre faire-part Provence Olivier est d'abord un faire-part digital, partageable par lien instantanément. Si vous souhaitez également des versions papier pour certains invités, l'option impression est disponible en complément depuis votre espace personnel.",
                  },
                ].map((faq) => (
                  <div key={faq.q} className="border border-gray-100 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.a }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part/provence-olivier"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#6B7C45" }}
              >
                Créer mon faire-part Provence
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
                { href: "/faire-part-mariage-romantique", label: "Style romantique" },
                { href: "/faire-part-mariage-luxe", label: "Style luxe" },
                { href: "/faire-part-mariage-moderne", label: "Style moderne" },
                { href: "/faire-part-mariage", label: "Tous les faire-part" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors">
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
