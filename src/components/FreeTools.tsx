import Link from "next/link";

const tools = [
  {
    icon: "👥",
    title: "Liste des invités",
    description:
      "Gérez votre liste d'invités, suivez les confirmations, les régimes alimentaires et organisez le placement.",
    features: ["Import/Export Excel", "Suivi RSVP en temps réel", "Statistiques automatiques"],
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: "🪑",
    title: "Plan de table",
    description:
      "Créez votre plan de table interactif par glisser-déposer. Visualisez la salle en 2D.",
    features: ["Interface drag & drop", "Plusieurs formes de tables", "Export PDF haute qualité"],
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: "📅",
    title: "Rétroplanning",
    description:
      "Ne ratez aucune étape grâce à notre rétroplanning personnalisé selon votre date de mariage.",
    features: ["+150 tâches pré-remplies", "Notifications par e-mail", "Partage avec proches"],
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: "💰",
    title: "Budget mariage",
    description:
      "Planifiez et suivez votre budget en temps réel. Évitez les mauvaises surprises.",
    features: ["Catégories personnalisables", "Graphiques visuels", "Alertes dépassement"],
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
];

export default function FreeTools() {
  return (
    <section id="outils" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase mb-3">
            100% gratuit
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Outils gratuits pour les mariés
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-300 to-gold-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            Organisez votre mariage sereinement avec nos outils en ligne,
            accessibles gratuitement et sans limite.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className={`group ${tool.bg} border ${tool.border} rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-200`}
                >
                  {tool.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{tool.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{tool.description}</p>

                  {/* Features */}
                  <ul className="space-y-1.5">
                    {tool.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-gray-600 text-xs">
                        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 rounded-3xl p-8 md:p-12 text-center shadow-lg">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          <div className="absolute top-4 left-8 text-white/20 text-6xl font-playfair">♥</div>
          <div className="absolute bottom-4 right-8 text-white/20 text-4xl font-playfair">♥</div>

          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              ✦ Accès gratuit &amp; illimité
            </span>
            <h3
              className="text-2xl md:text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Tous vos outils mariage en un seul endroit
            </h3>
            <p className="text-white/85 text-base mb-8 max-w-lg mx-auto">
              Créez votre compte gratuit et accédez instantanément à tous nos
              outils pour organiser le mariage de vos rêves.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-rose-500 hover:bg-rose-50 font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg text-sm">
                Accéder gratuitement
              </button>
              <Link href="/demo" className="bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-3.5 rounded-full border border-white/40 transition-all duration-200 text-sm backdrop-blur-sm">
                Voir une démo
              </Link>
            </div>
            <p className="text-white/60 text-xs mt-5">
              Aucune carte bancaire requise · Accès immédiat · Données sécurisées
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
