import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part mariage champêtre — Invitation nature & Provence | InstantMariage",
  description:
    "Faire-part de mariage champêtre inspiré de la Provence. Oliviers, lavande, terre authentique. Templates Provence Olivier et Bohème Champêtre personnalisables avec RSVP intégré.",
  keywords: [
    "faire-part mariage champêtre",
    "faire-part mariage provence",
    "invitation mariage campagne",
    "faire-part mariage rustique",
    "faire-part mariage oliviers",
    "invitation mariage campagne",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-mariage-champetre" },
  openGraph: {
    title: "Faire-part mariage champêtre — Invitation nature & Provence | InstantMariage",
    description:
      "Faire-part champêtre inspiré Provence : oliviers, lavande, terracotta. Personnalisez votre invitation.",
    url: "https://instantmariage.fr/faire-part-mariage-champetre",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part mariage champêtre — InstantMariage",
  description:
    "Faire-part de mariage champêtre et provençal. Oliviers, lavande, tons naturels, authenticité.",
  url: "https://instantmariage.fr/faire-part-mariage-champetre",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part champêtre", item: "https://instantmariage.fr/faire-part-mariage-champetre" },
    ],
  },
};

export default function FairePartMariageChampetreProvider() {
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
          <div className="absolute inset-0 flex items-center justify-center opacity-5 text-9xl pointer-events-none select-none">🌿</div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              🌾 Style Champêtre Provençal
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#6B7C45" }}>champêtre</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              L'invitation qui sent bon la Provence et la lavande. Branches d'olivier, tons chauds, authenticité du terroir français — votre faire-part champêtre annonce un mariage ancré dans la beauté naturelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/faire-part/provence-olivier"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#6B7C45" }}
              >
                Template Provence Olivier
              </Link>
              <Link
                href="/faire-part/boheme-champetre"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-full border-2 hover:bg-purple-50 transition-all duration-200"
                style={{ borderColor: "#6B7C45", color: "#6B7C45" }}
              >
                Template Bohème Champêtre
              </Link>
            </div>
          </div>
        </section>

        {/* 2 templates champêtres */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Deux templates pour votre mariage champêtre
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  id: "provence-olivier",
                  name: "Provence Olivier",
                  subtitle: "Provençal & Authentique",
                  desc: "Branches d'olivier ondulantes, lavande violette, terres ocres de Provence. Pour un mariage dans les Alpilles, le Luberon ou la Camargue.",
                  palette: "Olive, lavande, ocre",
                  bg: "from-violet-50 via-purple-50 to-lime-50",
                  accent: "#6B7C45",
                  textColor: "text-purple-800",
                },
                {
                  id: "boheme-champetre",
                  name: "Bohème Champêtre",
                  subtitle: "Nature & Bohème",
                  desc: "Aquarelles florales, tons beige et vert sauge. Pour un mariage en domaine, sous une tente de toile ou dans un jardin privé.",
                  palette: "Beige, vert sauge, stone",
                  bg: "from-stone-100 via-green-50 to-emerald-100",
                  accent: "#6B8F71",
                  textColor: "text-stone-700",
                },
              ].map((t) => (
                <Link
                  key={t.id}
                  href={`/faire-part/${t.id}`}
                  className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`h-48 bg-gradient-to-br ${t.bg} flex flex-col items-center justify-center p-6`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 opacity-60 ${t.textColor}`}>Mariage</p>
                    <p className={`text-lg font-bold text-center ${t.textColor}`} style={{ fontFamily: "var(--font-playfair), serif" }}>Sophie & Thomas</p>
                    <div className="my-2 w-14 h-px opacity-40" style={{ background: t.accent }} />
                    <p className={`text-xs opacity-50 ${t.textColor}`}>14 Juin 2025 · Provence</p>
                  </div>
                  <div className="bg-white p-5">
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors" style={{ fontFamily: "var(--font-playfair), serif" }}>{t.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">{t.subtitle}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
                    <p className="text-xs mt-3 font-medium" style={{ color: t.accent }}>Palette : {t.palette}</p>
                    <div className="mt-4 text-xs font-semibold flex items-center gap-1" style={{ color: t.accent }}>
                      Personnaliser →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Caractéristiques champêtre */}
        <section className="py-16 bg-lime-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Pourquoi choisir un faire-part champêtre ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🌿", title: "Authenticité", desc: "Le style champêtre reflète votre attachement aux valeurs essentielles : la nature, la convivialité, le terroir. Votre faire-part dit qui vous êtes." },
                { icon: "🦋", title: "Poésie visuelle", desc: "Les motifs botaniques, les aquarelles et les typographies calligraphiques créent une invitation poétique et mémorable." },
                { icon: "🌅", title: "Cohérence globale", desc: "Votre invitation champêtre prépare vos invités à l'ambiance de votre mariage, de la cérémonie à la réception sous les étoiles." },
                { icon: "🎨", title: "Personnalisation", desc: "Les tons naturels s'adaptent à vos propres couleurs de mariage : ajoutez une touche de terracotta, de rose poudré ou de vert forêt." },
                { icon: "📱", title: "Partage facile", desc: "Un lien à envoyer par WhatsApp, par email ou sur Instagram — votre faire-part champêtre voyage facilement jusqu'à vos invités." },
                { icon: "💐", title: "Accord floral", desc: "Pivoines, cosmos, pampa, eucalyptus… vos motifs floraux peuvent rappeler exactement les fleurs de votre bouquet de mariée." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-lime-100">
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
              Le faire-part champêtre, miroir de votre mariage
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le mariage champêtre est l'un des thèmes qui inspire le plus de couples en France. Des Alpilles à la Normandie, de la Dordogne à la Bretagne, les domaines champêtres et les mas provençaux accueillent chaque année des milliers de mariages baignés de lumière, d'authenticité et de gaieté. Le faire-part champêtre est le premier élément de cette atmosphère que vos invités découvriront.
              </p>
              <p>
                Notre template Provence Olivier puise son inspiration dans les paysages emblématiques du sud de la France. Les branches d'olivier chargées de fruits, la lavande violette qui ondule, les tons chauds de la garrigue et les ocres des mas provençaux composent une palette visuelle immédiatement évocatrice. En ouvrant votre invitation, vos invités sentent presque l'air chaud et parfumé de la Provence.
              </p>
              <p>
                Le template Bohème Champêtre, plus universel, convient à tous les cadres naturels. Que votre mariage se déroule dans un château de la Loire, une ferme du Périgord ou un domaine viticole de Bourgogne, ses aquarelles florales et ses tons neutres s'adapteront parfaitement à votre lieu de réception.
              </p>
              <p>
                Pour personnaliser votre faire-part champêtre, pensez à utiliser la section du message personnel pour intégrer une courte citation sur la nature ou l'amour qui reflète votre sensibilité. Mentionnez les éléments champêtres qui caractérisent votre lieu de réception — la vieille grange rénovée, le puits de pierre, le pigeonnier… Ces détails rendent votre invitation encore plus unique et spécifique à votre histoire.
              </p>
              <p>
                N'oubliez pas d'inclure des informations pratiques pour vos invités : si votre domaine champêtre est situé en zone rurale, pensez à préciser l'adresse exacte et à mentionner les possibilités de stationnement ou d'hébergement à proximité. Votre faire-part digital peut même inclure un lien vers un plan d'accès Google Maps, une fonctionnalité que le faire-part papier ne peut pas offrir.
              </p>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part/provence-olivier"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "#6B7C45" }}
              >
                Créer mon faire-part champêtre
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
                { href: "/faire-part-mariage-moderne", label: "Style moderne" },
                { href: "/faire-part-mariage", label: "Tous les faire-part" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-lime-400 hover:text-lime-700 transition-colors">
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
