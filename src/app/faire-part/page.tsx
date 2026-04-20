export const dynamic = 'force-dynamic';

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FairePartDashboardBanner from "@/components/FairePartDashboardBanner";
import FairePartTemplateGrid from "@/components/faire-part/FairePartTemplateGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faire-part de mariage | Templates élégants – InstantMariage",
  description:
    "Choisissez parmi 8 templates de faire-part animés et personnalisables. Élégance dorée, bohème champêtre, moderne minimal et plus encore.",
};


export default function FairePartPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-white py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #F06292, transparent)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #C9A96E, transparent)" }} />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              <span>✦</span>
              <span>8 templates disponibles</span>
              <span>✦</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Vos faire-part de mariage{" "}
              <span style={{ color: "#F06292" }}>sur-mesure</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Choisissez un template, personnalisez-le avec vos informations et partagez une invitation digitale animée à vos proches.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              {[
                { icon: "✨", label: "100% personnalisable" },
                { icon: "📱", label: "Mobile & desktop" },
                { icon: "🔗", label: "Lien partageable" },
                { icon: "💌", label: "Confirmations intégrées" },
              ].map((f) => (
                <span key={f.label} className="flex items-center gap-1.5">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <FairePartDashboardBanner />

        {/* Filter bar */}
        <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Style :</span>
            {["Tous", "Classique", "Nature", "Moderne", "Luxe", "Romantique"].map((filter) => (
              <button
                key={filter}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  filter === "Tous"
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500"
                }`}
                style={filter === "Tous" ? { background: "#F06292" } : {}}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Templates grid */}
        <FairePartTemplateGrid />

        {/* CTA section */}
        <section className="bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100 py-14 md:py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Vous avez une idée précise ?
            </h2>
            <p className="text-gray-500 mb-7">
              Nos prestataires peuvent créer votre faire-part entièrement sur-mesure, selon votre thème et votre vision.
            </p>
            <Link
              href="/annuaire?metier=papeterie"
              className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "#F06292" }}
            >
              <span>Trouver un prestataire papeterie</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
