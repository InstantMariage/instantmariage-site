import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <span>✦</span> Le magazine du mariage
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Blog <span style={{ color: "#F06292" }}>&amp; Conseils</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Inspirations, tendances et conseils d&apos;experts pour organiser le mariage de vos rêves.
          </p>
        </div>
      </section>

      {/* Coming soon */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-12 md:p-16">
          {/* Icône décorative */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "linear-gradient(135deg, #fce4ec, #f8bbd0)" }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "#F06292" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Bientôt disponible
          </h2>

          <p className="text-gray-500 text-lg leading-relaxed mb-3">
            Nos premiers articles arrivent très prochainement.
          </p>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            Conseils d&apos;organisation, inspirations déco, sélections de prestataires… Revenez vite pour découvrir notre magazine mariage.
          </p>

          {/* Séparateur décoratif */}
          <div className="flex items-center gap-3 my-10 max-w-xs mx-auto">
            <div className="flex-1 h-px bg-rose-100" />
            <span style={{ color: "#F06292" }} className="text-lg">✦</span>
            <div className="flex-1 h-px bg-rose-100" />
          </div>

          {/* Retour accueil */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-7 py-3.5 rounded-2xl transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #F06292, #E91E63)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l&apos;accueil
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
