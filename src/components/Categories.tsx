import { CATEGORIES } from "@/data/categories";

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
          {CATEGORIES.map((cat) => (
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
