"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Article = {
  slug: string;
  titre: string;
  excerpt: string | null;
  category: string;
  image: string | null;
  read_time: string;
  date_publication: string;
};

const categoryColors: Record<string, string> = {
  Organisation: "bg-blue-100 text-blue-700",
  Inspiration: "bg-rose-100 text-rose-600",
  Prestataires: "bg-amber-100 text-amber-700",
  Budget: "bg-green-100 text-green-700",
  Mode: "bg-purple-100 text-purple-700",
  Conseils: "bg-teal-100 text-teal-700",
};

const FILTER_TABS = ["Tous", "Organisation", "Conseils", "Budget", "Inspiration"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogFilter({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState("Tous");

  const filtered =
    active === "Tous" ? articles : articles.filter((a) => a.category === active);

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              active === tab
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-500"
            }`}
            style={
              active === tab
                ? { backgroundColor: "#F06292", borderColor: "#F06292" }
                : {}
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">Aucun article dans cette catégorie pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full aspect-[3/2] overflow-hidden rounded-t-2xl">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.titre}
                    fill
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-rose-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span
                  className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[article.category] ?? "bg-white/80 text-gray-700"}`}
                >
                  {article.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h2
                  className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {article.titre}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                  <span>{formatDate(article.date_publication)}</span>
                  <span>{article.read_time} de lecture</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
