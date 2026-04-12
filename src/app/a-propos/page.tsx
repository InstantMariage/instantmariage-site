import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "À propos – InstantMariage.fr",
  description:
    "Découvrez l'histoire d'InstantMariage.fr, notre mission et l'équipe qui connecte chaque jour des couples avec les meilleurs prestataires de France.",
  keywords: "à propos InstantMariage, équipe mariage, plateforme mariage France, histoire mariage",
  openGraph: {
    title: "À propos – InstantMariage.fr",
    description:
      "Découvrez l'histoire d'InstantMariage.fr, notre mission et l'équipe qui connecte chaque jour des couples avec les meilleurs prestataires de France.",
    url: "https://instantmariage.fr/a-propos",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "À propos InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos – InstantMariage.fr",
    description:
      "Découvrez notre mission et l'équipe qui connecte des couples avec les meilleurs prestataires de France.",
    images: ["/logo.png"],
  },
};

const stats = [
  { value: "100+", label: "Prestataires référencés", icon: "🤝" },
  { value: "🚀", label: "En plein lancement", icon: "" },
  { value: "13", label: "Régions couvertes", icon: "🇫🇷" },
  { value: "Nouveau", label: "Satisfaction client", icon: "⭐" },
];

const values = [
  {
    title: "Confiance",
    icon: "🔒",
    description:
      "Chaque prestataire est vérifié, chaque avis est authentique. Nous construisons une communauté fondée sur la transparence et l'honnêteté, pour que vous puissiez choisir en toute sérénité.",
  },
  {
    title: "Qualité",
    icon: "✨",
    description:
      "Nous sélectionnons rigoureusement nos partenaires. Seuls les professionnels qui répondent à nos critères d'excellence intègrent la plateforme. Votre mariage mérite le meilleur.",
  },
  {
    title: "Simplicité",
    icon: "🎯",
    description:
      "Organiser un mariage est complexe — notre plateforme, elle, ne l'est pas. Recherche intuitive, outils clairs, communication fluide : nous simplifions chaque étape de votre préparation.",
  },
];

export default function APropos() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&q=80"
            alt="Mariage élégant"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-rose-900/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span>✦</span>
            <span>Notre histoire</span>
            <span>✦</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Nous rendons chaque mariage{" "}
            <span className="text-rose-300">inoubliable</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            InstantMariage.fr est né d&apos;une volonté simple : rendre
            l&apos;organisation du mariage en France plus facile, plus humaine
            et plus belle.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L1440 80L1440 40C1200 0 960 80 720 60C480 40 240 0 0 40L0 80Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── NOTRE HISTOIRE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-4">
                Notre histoire
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-snug"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Nés d&apos;une expérience personnelle,
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #F06292, #E91E63)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  construits pour vous
                </span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                <p>
                  En 2025, Adel et Marina ont réalisé qu&apos;organiser un
                  mariage en France restait un vrai défi : des heures perdues
                  sur des forums éparpillés, des devis qui n&apos;arrivent
                  jamais, des avis impossibles à vérifier. Il manquait une
                  plateforme simple, centralisée et digne de confiance.
                </p>
                <p>
                  Ils ont alors décidé de créer InstantMariage.fr — un endroit
                  où les futurs mariés trouvent en quelques minutes les
                  professionnels qui feront de leur grand jour un moment
                  inoubliable.
                </p>
                <p>
                  InstantMariage.fr est en plein lancement et accueille ses
                  premiers prestataires et futurs mariés.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[480px]">
                <Image
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80"
                  alt="Couple heureux le jour de leur mariage"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-2xl">
                  💍
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Fondé en 2025</p>
                  <p className="text-gray-500 text-xs">Marseille, France</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOTRE MISSION ── */}
      <section className="py-24 bg-rose-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-4">
            Notre mission
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-snug"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Connecter les futurs mariés avec les meilleurs prestataires
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-10">
            Notre mission est de démocratiser l&apos;accès aux meilleurs
            professionnels du mariage en France. Quelle que soit votre région,
            votre budget ou votre vision, InstantMariage.fr vous guide vers les
            partenaires qui sauront faire de votre mariage une expérience
            unique et sur-mesure.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: "🔍",
                title: "Trouvez",
                desc: "Accédez à 100+ prestataires vérifiés en quelques clics.",
              },
              {
                icon: "💬",
                title: "Comparez",
                desc: "Lisez les avis authentiques, consultez les portfolios, demandez des devis.",
              },
              {
                icon: "🎊",
                title: "Célébrez",
                desc: "Profitez de votre grand jour en sachant que chaque détail est entre de bonnes mains.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS VALEURS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Nos valeurs
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Ce en quoi nous croyons profondément
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-rose-50 group-hover:bg-rose-100 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-colors duration-300">
                  {value.icon}
                </div>
                <h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {value.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {value.description}
                </p>
                <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-rose-300 to-pink-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <section className="py-24 bg-gradient-to-br from-rose-500 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">
              Chiffres clés
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              InstantMariage en quelques chiffres
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Prêt à organiser votre mariage de rêve ?
          </h2>
          <p className="text-gray-500 mb-8">
            Rejoignez des couples qui font confiance à
            InstantMariage.fr pour trouver leurs prestataires idéaux.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-rose-400 hover:bg-rose-500 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-sm hover:shadow-lg"
            >
              Trouver un prestataire
            </a>
            <a
              href="/contact"
              className="border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
