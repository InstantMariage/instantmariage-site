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
        <section
          className="relative py-20 md:py-28 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #FFF9FB 0%, #FFFFFF 100%)"
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "800px",
              height: "400px",
              background: "radial-gradient(ellipse, rgba(240, 98, 146, 0.12) 0%, rgba(240, 98, 146, 0) 70%)",
              filter: "blur(40px)"
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center">
            <div
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-8"
              style={{
                background: "rgba(240, 98, 146, 0.1)",
                border: "1px solid rgba(240, 98, 146, 0.2)",
                color: "#F06292",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ background: "#F06292" }} />
              8 TEMPLATES · CAGNOTTE INTÉGRÉE
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-[-0.02em] mb-6"
              style={{ fontFamily: "var(--font-playfair), serif", color: "#1a1a1a" }}
            >
              Vos faire-part,{" "}
              <br className="hidden sm:inline" />
              personnalisés et{" "}
              <span style={{ color: "#F06292" }}>animés.</span>
            </h1>
            <p
              className="font-normal text-base sm:text-lg md:text-xl leading-relaxed max-w-[640px] mx-auto mb-16 md:mb-20"
              style={{ color: "#6a6a6a" }}
            >
              Créez une invitation digitale unique, partagez-la en un clic, et recevez les réponses et les cadeaux de vos proches au même endroit.
            </p>
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
