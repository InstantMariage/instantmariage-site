const testimonials = [
  {
    id: 1,
    prenom: "Sophie & Thomas",
    ville: "Lyon, 69",
    date: "Juin 2024",
    photo: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80",
    note: 5,
    texte:
      "InstantMariage.fr nous a permis de trouver notre photographe et notre traiteur en moins d'une semaine ! Les prestataires étaient exactement ce qu'on cherchait : professionnels, à l'écoute et dans notre budget. Le plan de table gratuit est une vraie pépite, il nous a évité tellement de stress !",
    prestataires: ["Photographe", "Traiteur"],
  },
  {
    id: 2,
    prenom: "Camille & Julien",
    ville: "Paris, 75",
    date: "Septembre 2024",
    photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80",
    note: 5,
    texte:
      "On a tout organisé depuis InstantMariage.fr. Le rétroplanning nous a sauvé la mise — on n'aurait jamais pensé à réserver notre salle aussi tôt sinon ! Tous les prestataires avaient de vrais avis vérifiés, pas du faux comme sur d'autres sites. Mariage de rêve garanti.",
    prestataires: ["Salle", "DJ", "Fleuriste"],
  },
  {
    id: 3,
    prenom: "Marie & Antoine",
    ville: "Bordeaux, 33",
    date: "Juillet 2024",
    photo: "https://images.unsplash.com/photo-1537907690979-a04e3f7db8ad?w=200&q=80",
    note: 5,
    texte:
      "La qualité des prestataires sur la plateforme est incroyable. On a rencontré notre Wedding Planner ici, et elle a transformé notre vision en quelque chose de magique. La gestion du budget intégrée nous a aidés à rester dans nos limites. Je recommande à tous les futurs mariés !",
    prestataires: ["Wedding Planner", "Photographe"],
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-rose-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Ils nous font confiance
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Ce que disent nos mariés
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-300 to-gold-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            Plus de <strong className="text-gray-700">48 000 couples</strong> ont organisé leur mariage
            grâce à InstantMariage.fr
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Quote icon */}
              <div
                className="text-5xl text-rose-200 leading-none mb-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                "
              </div>

              {/* Stars */}
              <Stars count={t.note} />

              {/* Text */}
              <p className="text-gray-600 text-sm leading-relaxed mt-3 flex-1">{t.texte}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {t.prestataires.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-rose-50 text-rose-500 px-2.5 py-1 rounded-full font-medium border border-rose-100"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mt-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={t.photo}
                      alt={t.prenom}
                      className="w-12 h-12 rounded-full object-cover border-2 border-rose-100"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.prenom}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t.ville} · {t.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-14 bg-white rounded-2xl shadow-card p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "4.9/5", label: "Note moyenne", icon: "⭐" },
              { value: "48 000+", label: "Mariages organisés", icon: "💍" },
              { value: "12 000+", label: "Prestataires vérifiés", icon: "✅" },
              { value: "100%", label: "Avis authentiques", icon: "🛡️" },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center">
                <span className="text-2xl mb-2">{badge.icon}</span>
                <p
                  className="text-2xl md:text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {badge.value}
                </p>
                <p className="text-gray-500 text-sm mt-1">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
