const providers = [
  {
    id: 1,
    name: "Atelier Lumière",
    metier: "Photographe",
    ville: "Paris, 75",
    note: 4.9,
    avis: 127,
    prix: 1200,
    badge: true,
    premium: true,
    description: "Capturer l'émotion de votre journée avec un regard artistique et naturel.",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80",
  },
  {
    id: 2,
    name: "DJ Maxence Events",
    metier: "DJ / Animateur",
    ville: "Lyon, 69",
    note: 4.8,
    avis: 89,
    prix: 950,
    badge: true,
    premium: false,
    description: "15 ans d'expérience pour animer votre soirée de mariage inoubliable.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    id: 3,
    name: "Le Domaine des Roses",
    metier: "Salle de réception",
    ville: "Bordeaux, 33",
    note: 4.9,
    avis: 204,
    prix: 3500,
    badge: true,
    premium: true,
    description: "Magnifique domaine de 5 ha avec château, parc et hébergements.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    id: 4,
    name: "Saveurs Provence",
    metier: "Traiteur",
    ville: "Marseille, 13",
    note: 4.7,
    avis: 156,
    prix: 65,
    badge: true,
    premium: false,
    description: "Cuisine méditerranéenne raffinée, cocktails et buffets sur mesure.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
  {
    id: 5,
    name: "Fleurs & Émotions",
    metier: "Fleuriste",
    ville: "Nantes, 44",
    note: 5.0,
    avis: 73,
    prix: 800,
    badge: true,
    premium: true,
    description: "Compositions florales exclusives, bouquets de mariée et décoration.",
    image: "https://images.unsplash.com/photo-1487530811015-780d00bfddb4?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: 6,
    name: "Élégance Coiffure",
    metier: "Coiffeur & Maquilleur",
    ville: "Nice, 06",
    note: 4.8,
    avis: 91,
    prix: 280,
    badge: true,
    premium: false,
    description: "Coiffure et maquillage de mariée à domicile, toute la Côte d'Azur.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80",
  },
];

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.floor(note) ? "text-amber-400" : star - 0.5 <= note ? "text-amber-300" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function FeaturedProviders() {
  return (
    <section id="prestataires" className="py-20 bg-gradient-to-b from-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Sélection du moment
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Prestataires mis en avant
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-300 to-gold-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            Découvrez nos professionnels les mieux notés, vérifiés et recommandés
            par des milliers de mariés.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {p.badge && (
                    <span className="flex items-center gap-1 bg-white/95 text-emerald-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Vérifié
                    </span>
                  )}
                  {p.premium && (
                    <span className="bg-gradient-to-r from-gold-400 to-gold-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      ✦ Premium
                    </span>
                  )}
                </div>
                {/* Metier tag */}
                <div className="absolute bottom-3 right-3">
                  <span className="bg-rose-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {p.metier}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                {/* Provider info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-rose-100"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{p.name}</h3>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.ville}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {p.description}
                </p>

                {/* Rating & Price */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <StarRating note={p.note} />
                    <span className="text-amber-500 font-bold text-sm">{p.note}</span>
                    <span className="text-gray-400 text-xs">({p.avis} avis)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">À partir de</p>
                    <p className="text-rose-500 font-bold text-base">
                      {p.prix.toLocaleString("fr-FR")} €
                      {p.metier === "Traiteur" && <span className="text-xs font-normal">/pers.</span>}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full mt-4 bg-rose-50 hover:bg-rose-400 text-rose-500 hover:text-white font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 border border-rose-200 hover:border-rose-400">
                  Voir le profil &amp; demander un devis
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* See more */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-500 font-semibold px-8 py-3.5 rounded-full border-2 border-rose-200 hover:border-rose-400 transition-all duration-200 shadow-sm hover:shadow-md">
            Voir tous les prestataires
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
