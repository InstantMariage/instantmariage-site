const categories = [
  {
    name: "Photographe",
    icon: "📷",
    count: "2 340",
    color: "from-pink-50 to-rose-50",
    border: "border-rose-100",
    hoverBg: "hover:bg-rose-50",
  },
  {
    name: "Vidéaste",
    icon: "🎬",
    count: "890",
    color: "from-purple-50 to-pink-50",
    border: "border-purple-100",
    hoverBg: "hover:bg-purple-50",
  },
  {
    name: "DJ",
    icon: "🎧",
    count: "780",
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
    hoverBg: "hover:bg-blue-50",
  },
  {
    name: "Musicien / Groupe",
    icon: "🎹",
    count: "340",
    color: "from-violet-50 to-purple-50",
    border: "border-violet-100",
    hoverBg: "hover:bg-violet-50",
  },
  {
    name: "Traiteur",
    icon: "🍽️",
    count: "1 580",
    color: "from-orange-50 to-amber-50",
    border: "border-orange-100",
    hoverBg: "hover:bg-orange-50",
  },
  {
    name: "Fleuriste",
    icon: "💐",
    count: "760",
    color: "from-green-50 to-emerald-50",
    border: "border-green-100",
    hoverBg: "hover:bg-green-50",
  },
  {
    name: "Lieu de réception",
    icon: "🏛️",
    count: "2 100",
    color: "from-yellow-50 to-amber-50",
    border: "border-yellow-100",
    hoverBg: "hover:bg-yellow-50",
  },
  {
    name: "Coiffeur",
    icon: "✂️",
    count: "620",
    color: "from-pink-50 to-fuchsia-50",
    border: "border-pink-100",
    hoverBg: "hover:bg-pink-50",
  },
  {
    name: "Maquilleur",
    icon: "💄",
    count: "540",
    color: "from-fuchsia-50 to-pink-50",
    border: "border-fuchsia-100",
    hoverBg: "hover:bg-fuchsia-50",
  },
  {
    name: "Henna",
    icon: "🌿",
    count: "180",
    color: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
    hoverBg: "hover:bg-emerald-50",
  },
  {
    name: "Wedding Planner",
    icon: "📋",
    count: "430",
    color: "from-teal-50 to-cyan-50",
    border: "border-teal-100",
    hoverBg: "hover:bg-teal-50",
  },
  {
    name: "Pâtissier / Wedding cake",
    icon: "🎂",
    count: "680",
    color: "from-rose-50 to-orange-50",
    border: "border-rose-100",
    hoverBg: "hover:bg-rose-50",
  },
  {
    name: "Animation",
    icon: "🎪",
    count: "290",
    color: "from-amber-50 to-yellow-50",
    border: "border-amber-100",
    hoverBg: "hover:bg-amber-50",
  },
  {
    name: "Transport",
    icon: "🚗",
    count: "520",
    color: "from-gray-50 to-slate-50",
    border: "border-gray-100",
    hoverBg: "hover:bg-gray-50",
  },
  {
    name: "Officiant",
    icon: "🕊️",
    count: "280",
    color: "from-sky-50 to-blue-50",
    border: "border-sky-100",
    hoverBg: "hover:bg-sky-50",
  },
  {
    name: "Décorateur",
    icon: "🎨",
    count: "410",
    color: "from-lime-50 to-green-50",
    border: "border-lime-100",
    hoverBg: "hover:bg-lime-50",
  },
  {
    name: "Créateur de contenu",
    icon: "📱",
    count: "220",
    color: "from-cyan-50 to-sky-50",
    border: "border-cyan-100",
    hoverBg: "hover:bg-cyan-50",
  },
  {
    name: "Papeterie & Personnalisation",
    icon: "✉️",
    count: "160",
    color: "from-rose-50 to-pink-50",
    border: "border-rose-100",
    hoverBg: "hover:bg-rose-50",
  },
];

export default function Categories() {
  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Tous les métiers
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Trouvez votre prestataire idéal
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-300 to-gold-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            Choisissez parmi nos 18 catégories de professionnels du mariage,
            tous soigneusement vérifiés.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`group flex flex-col items-center gap-3 p-4 bg-gradient-to-br ${cat.color} border ${cat.border} ${cat.hoverBg} rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md text-center`}
            >
              <div className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-sm leading-tight">{cat.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{cat.count} pros</p>
              </div>
            </button>
          ))}
        </div>

        {/* See all link */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold text-sm transition-colors group">
            Voir toutes les catégories
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
