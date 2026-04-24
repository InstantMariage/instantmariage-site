"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

const regions = [
  "Toute la France",
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhône-Alpes",
  "Occitanie",
  "Nouvelle-Aquitaine",
  "Bretagne",
  "Normandie",
  "Grand Est",
  "Hauts-de-France",
  "Pays de la Loire",
  "Bourgogne-Franche-Comté",
  "Centre-Val de Loire",
  "Corse",
];

const metiers = ["Tous les métiers", ...CATEGORIES.map((c) => c.name)];

export default function Hero() {
  const [metier, setMetier] = useState("");
  const [region, setRegion] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
    if (region) params.set("region", region);
    const query = params.toString();
    router.push(`/annuaire${query ? `?${query}` : ""}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777030776686-pexels-imagestudio-1488312-2.jpg"
          alt="Couple lors de leur mariage"
          fill
          className="object-cover object-[30%_center] md:object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/40 to-rose-900/30" />
        {/* Decorative gold dots */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #C9A96E 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="text-gold-300">✦</span>
          <span>La nouvelle façon d&apos;organiser son mariage</span>
          <span className="text-gold-300">✦</span>
        </div>

        {/* Main title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Trouvez les meilleurs{" "}
          <span className="text-[#F06292]">prestataires</span>{" "}
          pour votre mariage
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Plus de <strong className="text-white">100 prestataires</strong> vérifiés partout en France —
          photographes, traiteurs, DJ, fleuristes et bien plus encore.
        </p>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-3 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Métier select */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F06292]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                value={metier}
                onChange={(e) => setMetier(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-gray-700 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none cursor-pointer font-medium"
              >
                {metiers.map((m) => (
                  <option key={m} value={m === "Tous les métiers" ? "" : m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-200 my-2" />

            {/* Région select */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F06292]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-gray-700 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none cursor-pointer font-medium"
              >
                {regions.map((r) => (
                  <option key={r} value={r === "Toute la France" ? "" : r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button onClick={handleSearch} className="text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-8 pt-8 border-t border-white/20">
          {[
            { value: "100+", label: "Prestataires vérifiés" },
            { value: "500+", label: "Mariages organisés" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {stat.value}
              </div>
              <div className="text-white/70 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 60C480 40 240 0 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
