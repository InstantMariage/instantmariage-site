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
        </div>

        {/* Empty state CTA */}
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl shadow-card border border-rose-100 text-center max-w-2xl mx-auto">
          <div className="text-5xl mb-6">💍</div>
          <h3
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Soyez parmi les premiers prestataires sur InstantMariage&nbsp;!
          </h3>
          <p className="text-gray-500 text-lg mb-8">
            La plateforme est en plein lancement. Inscrivez-vous gratuitement dès maintenant et gagnez en visibilité auprès des futurs mariés.
          </p>
          <a
            href="/inscription"
            className="inline-flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            S&apos;inscrire gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
