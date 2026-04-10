import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function InspirationPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Coming soon */}
      <section className="pt-28 pb-24 bg-gradient-to-b from-rose-50 via-pink-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 shadow-sm"
            style={{ background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)" }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "#F06292" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9.75h18M3.75 3h16.5A.75.75 0 0121 3.75v16.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 20.25V3.75A.75.75 0 013.75 3z"
              />
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <span>✦</span> Galerie d&apos;inspiration
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-5"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Bientôt <span style={{ color: "#F06292" }}>disponible</span>
          </h1>

          {/* Message */}
          <p className="text-gray-500 text-lg leading-relaxed max-w-lg mx-auto mb-10">
            Nous collectons les plus belles inspirations de mariages réels pour vous inspirer et vous aider à imaginer votre jour parfait.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-xs mx-auto mb-10">
            <div className="flex-1 h-px bg-rose-100" />
            <svg className="w-4 h-4 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <div className="flex-1 h-px bg-rose-100" />
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full text-sm text-white shadow-sm transition-all duration-200 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E63 100%)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Parcourir l&apos;annuaire des prestataires
          </Link>
        </div>
      </section>

      {/* Placeholder for future content — categories */}
      {/* TODO: add masonry gallery, style filters (Champêtre, Moderne, Luxe, Bohème, Classique) */}

      <Footer />
    </main>
  );
}
