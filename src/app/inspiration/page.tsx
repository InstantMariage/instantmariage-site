"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const styles = ["Tous", "Champêtre", "Moderne", "Luxe", "Bohème", "Classique"];

const photos = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&auto=format&fit=crop",
    alt: "Cérémonie champêtre en plein air",
    style: "Champêtre",
    height: "tall",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80&auto=format&fit=crop",
    alt: "Portrait de mariés élégants",
    style: "Classique",
    height: "medium",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80&auto=format&fit=crop",
    alt: "Décoration florale luxueuse pour mariage",
    style: "Luxe",
    height: "short",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80&auto=format&fit=crop",
    alt: "Table de réception moderne décorée",
    style: "Moderne",
    height: "medium",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80&auto=format&fit=crop",
    alt: "Toast des mariés lors de la réception",
    style: "Bohème",
    height: "tall",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80&auto=format&fit=crop",
    alt: "Robe de mariée bohème élégante",
    style: "Bohème",
    height: "tall",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80&auto=format&fit=crop",
    alt: "Bouquet de fleurs champêtres pour mariée",
    style: "Champêtre",
    height: "short",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80&auto=format&fit=crop",
    alt: "Château somptueux pour réception de luxe",
    style: "Luxe",
    height: "medium",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80&auto=format&fit=crop",
    alt: "Table de réception moderne décorée avec soin",
    style: "Moderne",
    height: "short",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80&auto=format&fit=crop",
    alt: "Mariés dans un jardin classique fleuri",
    style: "Classique",
    height: "tall",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1477120292453-2bde1017f252?w=800&q=80&auto=format&fit=crop",
    alt: "Détails floraux champêtres pour la décoration",
    style: "Champêtre",
    height: "medium",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80&auto=format&fit=crop",
    alt: "Salle de réception bohème avec guirlandes lumineuses",
    style: "Bohème",
    height: "short",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop",
    alt: "Art de table classique et élégant pour mariage",
    style: "Classique",
    height: "medium",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80&auto=format&fit=crop",
    alt: "Château somptueux pour réception de mariage de luxe",
    style: "Luxe",
    height: "tall",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80&auto=format&fit=crop",
    alt: "Portrait élégant des mariés lors de la cérémonie",
    style: "Moderne",
    height: "medium",
  },
];

const heightClass: Record<string, string> = {
  short: "h-48",
  medium: "h-64",
  tall: "h-80",
};

const styleColors: Record<string, string> = {
  Champêtre: "bg-green-100 text-green-700",
  Moderne: "bg-blue-100 text-blue-700",
  Luxe: "bg-amber-100 text-amber-700",
  Bohème: "bg-orange-100 text-orange-700",
  Classique: "bg-purple-100 text-purple-700",
};

export default function InspirationPage() {
  const [activeStyle, setActiveStyle] = useState("Tous");
  const [saved, setSaved] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filtered = photos.filter(
    (p) => activeStyle === "Tous" || p.style === activeStyle
  );

  // Split into 3 columns for masonry
  const col1 = filtered.filter((_, i) => i % 3 === 0);
  const col2 = filtered.filter((_, i) => i % 3 === 1);
  const col3 = filtered.filter((_, i) => i % 3 === 2);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <span>✦</span> Galerie de mariages
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Votre tableau <span style={{ color: "#F06292" }}>d&apos;inspiration</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Des centaines de photos de mariages réels pour vous inspirer et
            imaginer votre jour parfait.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { value: "2 400+", label: "Photos de mariages" },
              { value: "5", label: "Styles" },
              { value: "Gratuit", label: "À sauvegarder" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: "#F06292", fontFamily: "var(--font-playfair), serif" }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeStyle === style
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={activeStyle === style ? { backgroundColor: "#F06292" } : {}}
              >
                {style}
              </button>
            ))}

            {saved.length > 0 && (
              <div className="ml-auto flex-shrink-0 flex items-center gap-2 text-sm text-rose-500 font-medium bg-rose-50 px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
                </svg>
                {saved.length} sauvegardée{saved.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🖼️</p>
            <p className="text-lg font-medium text-gray-500">Aucune photo pour ce style</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[col1, col2, col3].map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-4">
                {col.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl bg-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300"
                  >
                    <div className={`relative ${heightClass[photo.height]}`}>
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />

                      {/* Style badge */}
                      <span
                        className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${styleColors[photo.style]}`}
                      >
                        {photo.style}
                      </span>

                      {/* Save button */}
                      <button
                        onClick={() => toggleSave(photo.id)}
                        aria-label="Sauvegarder"
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                          saved.includes(photo.id)
                            ? "bg-rose-500 text-white opacity-100"
                            : "bg-white text-gray-500 opacity-0 group-hover:opacity-100 hover:text-rose-500"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={saved.includes(photo.id) ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      </button>

                      {/* Caption */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-white text-xs font-medium truncate">{photo.alt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        <div className="text-center mt-12">
          <button
            className="inline-flex items-center gap-2 bg-white border-2 text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:text-white"
            style={{
              borderColor: "#F06292",
              color: "#F06292",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F06292";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
              (e.currentTarget as HTMLButtonElement).style.color = "#F06292";
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Charger plus de photos
          </button>
        </div>
      </section>

      {/* CTA Prestataires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div
          className="rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E63 60%, #C2185B 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">
              Passez à l&apos;action
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Trouvez les prestataires qui<br className="hidden md:block" /> réaliseront vos inspirations
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Plus de 100 professionnels vérifiés — photographes, fleuristes,
              décorateurs — prêts à donner vie à votre vision.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/"
                className="bg-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-rose-50 shadow-sm"
                style={{ color: "#F06292" }}
              >
                Trouver un prestataire
              </Link>
              <Link
                href="/blog"
                className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-200"
              >
                Lire nos conseils
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
