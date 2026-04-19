import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faire-part animé mariage — Invitations avec animations | InstantMariage",
  description:
    "Créez un faire-part de mariage animé unique. Effets de particules dorées, calligraphie animée, transitions élégantes. Impressionnez vos invités avec une invitation qui prend vie.",
  keywords: [
    "faire-part animé mariage",
    "faire-part mariage animation",
    "invitation mariage animée",
    "faire-part mariage vidéo",
    "faire-part mariage avec animation",
    "invitation mariage originale",
  ],
  alternates: { canonical: "https://instantmariage.fr/faire-part-anime-mariage" },
  openGraph: {
    title: "Faire-part animé mariage — Invitations avec animations | InstantMariage",
    description:
      "Faire-part de mariage animés avec effets dorés et calligraphie vivante. Impressionnez vos invités.",
    url: "https://instantmariage.fr/faire-part-anime-mariage",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Faire-part animé mariage — InstantMariage",
  description:
    "Faire-part de mariage avec animations élégantes. Calligraphie animée, particules dorées, transitions fluides.",
  url: "https://instantmariage.fr/faire-part-anime-mariage",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://instantmariage.fr" },
      { "@type": "ListItem", position: 2, name: "Faire-part mariage", item: "https://instantmariage.fr/faire-part-mariage" },
      { "@type": "ListItem", position: 3, name: "Faire-part animé mariage", item: "https://instantmariage.fr/faire-part-anime-mariage" },
    ],
  },
};

const animations = [
  { icon: "✨", name: "Particules dorées", desc: "Des paillettes dorées flottent délicatement sur votre invitation, créant un effet féérique et sophistiqué." },
  { icon: "✍️", name: "Calligraphie vivante", desc: "Vos prénoms s'écrivent progressivement à l'écran comme sous la plume d'un calligraphe." },
  { icon: "🌸", name: "Pluie de pétales", desc: "Des pétales de roses ou de fleurs tombent poétiquement en arrière-plan de votre invitation." },
  { icon: "⭐", name: "Ciel étoilé", desc: "Pour le template Nuit Étoilée, les étoiles scintillent et la voie lactée s'anime doucement." },
  { icon: "🌿", name: "Nature animée", desc: "Les brins de lavande et feuilles d'olivier ondulent légèrement dans une brise imaginaire." },
  { icon: "💫", name: "Fade & reveal", desc: "Les informations apparaissent progressivement avec de délicates animations de fondu enchaîné." },
];

export default function FairePartAnimeMariagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero avec animation simulée */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 py-20 md:py-28 overflow-hidden">
          {/* Stars */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  width: i % 4 === 0 ? "3px" : "2px",
                  height: i % 4 === 0 ? "3px" : "2px",
                  background: "#C9A96E",
                  opacity: 0.4 + (i % 5) * 0.12,
                  top: `${5 + (i * 13) % 90}%`,
                  left: `${3 + (i * 17) % 94}%`,
                  animationDelay: `${(i * 0.3) % 3}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <span>✦</span>
              <span>Animations exclusives</span>
              <span>✦</span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Faire-part de mariage{" "}
              <span style={{ color: "#C9A96E" }}>animé</span>
            </h1>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto leading-relaxed mb-8">
              Offrez à vos invités une expérience inoubliable avec une invitation de mariage qui prend vie. Animations élégantes, effets visuels raffinés, un faire-part animé qui laisse une impression durable.
            </p>
            <Link
              href="/faire-part"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#C9A96E", color: "white" }}
            >
              Voir les templates animés
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Animations disponibles */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Les animations de vos faire-part
            </h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              Chaque template intègre des animations soigneusement chorégraphiées pour sublimer l'annonce de votre mariage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {animations.map((anim) => (
                <div key={anim.name} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{anim.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{anim.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{anim.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates avec animation */}
        <section className="py-16 bg-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Nos templates animés les plus populaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { id: "nuit-etoilee", name: "Nuit Étoilée", style: "Mystique & Romantique", bg: "from-indigo-900 to-violet-900", text: "text-indigo-100", accent: "#C9A96E" },
                { id: "elegance-doree", name: "Élégance Dorée", style: "Classique & Raffiné", bg: "from-amber-50 to-yellow-100", text: "text-amber-800", accent: "#C9A96E" },
                { id: "romantique-floral", name: "Romantique Floral", style: "Romantique & Fleuri", bg: "from-pink-50 to-rose-100", text: "text-rose-700", accent: "#F06292" },
                { id: "boheme-champetre", name: "Bohème Champêtre", style: "Nature & Bohème", bg: "from-stone-100 to-emerald-100", text: "text-stone-700", accent: "#6B8F71" },
              ].map((t) => (
                <Link
                  key={t.id}
                  href={`/faire-part/${t.id}`}
                  className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`h-40 bg-gradient-to-br ${t.bg} flex flex-col items-center justify-center p-4`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 opacity-60 ${t.text}`}>Mariage</p>
                    <p className={`text-sm font-bold text-center ${t.text}`} style={{ fontFamily: "var(--font-playfair), serif" }}>
                      Sophie & Thomas
                    </p>
                    <div className="my-2 w-12 h-px opacity-40" style={{ background: t.accent }} />
                    <p className={`text-xs opacity-50 ${t.text}`}>14 Juin 2025</p>
                  </div>
                  <div className="bg-white p-4">
                    <p className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.style}</p>
                    <p className="text-xs font-semibold mt-2" style={{ color: "#C9A96E" }}>Personnaliser →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contenu SEO */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Pourquoi choisir un faire-part de mariage animé ?
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Le faire-part de mariage animé représente la nouvelle génération des invitations nuptiales. Là où le faire-part papier traditionnel livre un message statique, le faire-part animé crée une véritable expérience sensorielle pour chacun de vos invités.
              </p>
              <p>
                Imaginez la réaction de vos proches lorsqu'ils ouvrent le lien de votre invitation : vos prénoms s'écrivent progressivement en calligraphie dorée, des pétales de roses tombent délicatement en arrière-plan, et les informations de votre cérémonie se révèlent une à une avec élégance. Cette magie visuelle communique à elle seule le soin et l'attention que vous portez à votre mariage.
              </p>
              <p>
                Les faire-part animés d'InstantMariage sont développés avec la technologie Remotion, spécialement conçue pour créer des animations vidéo de haute qualité directement dans le navigateur. Le résultat est fluide, professionnel et compatible avec tous les appareils, qu'il s'agisse d'un smartphone sous iOS ou Android, d'une tablette ou d'un ordinateur.
              </p>
              <p>
                Contrairement aux animations basiques que l'on trouve sur certaines plateformes, nos effets visuels ont été pensés pour sublimer l'esthétique de chaque template sans jamais le desservir. Les animations restent élégantes et sobres, en parfaite cohérence avec l'univers raffiné de votre mariage. Elles captivent l'attention sans distraire du message principal : l'annonce de votre union.
              </p>
              <p>
                Un faire-part animé est aussi un excellent moyen de se démarquer et de préparer l'ambiance de votre mariage. Si votre réception se déroule dans un château, sous une nuit étoilée ou dans un domaine champêtre, votre invitation en donne un avant-goût savamment mis en scène. C'est une promesse visuelle qui donne envie à vos invités de répondre présent.
              </p>
            </div>

            <div className="mt-10 p-6 bg-indigo-50 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-2">Comment fonctionnent les animations ?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Nos animations sont générées automatiquement dès que vous finalisez votre faire-part. Aucune compétence technique n'est requise : vous remplissez votre formulaire de personnalisation, et la magie opère en coulisses. Chaque animation est optimisée pour se lancer instantanément, même sur les connexions mobiles.
              </p>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faire-part"
                className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #312e81, #4338ca)", color: "white" }}
              >
                Découvrir tous les templates animés
              </Link>
            </div>
          </div>
        </section>

        {/* Liens internes */}
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">À découvrir aussi</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: "/faire-part-mariage", label: "Faire-part mariage" },
                { href: "/faire-part-digital-mariage", label: "Faire-part digital" },
                { href: "/faire-part-mariage-gratuit", label: "Faire-part gratuit" },
                { href: "/faire-part-mariage-luxe", label: "Style luxe" },
                { href: "/faire-part-mariage-moderne", label: "Style moderne" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
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
