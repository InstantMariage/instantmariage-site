"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { seoArticles } from "@/app/blog/articles-data";

const categories = ["Tous", "Organisation", "Inspiration", "Prestataires", "Budget", "Mode"];

const editorialArticles = [
  {
    id: 1,
    slug: "choisir-photographe-mariage",
    title: "Comment choisir son photographe de mariage",
    excerpt:
      "Le photographe immortalisera les moments les plus précieux de votre journée. Voici nos conseils pour trouver LE professionnel qui capturera votre histoire d'amour avec authenticité et talent.",
    category: "Prestataires",
    date: "28 mars 2025",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
    featured: true,
  },
  {
    id: 2,
    slug: "tendances-deco-mariage-2025",
    title: "Les tendances déco mariage 2025",
    excerpt:
      "Bouquets en pampa grass, arches florales XXL, vaisselle en terre cuite… Découvrez les tendances déco qui vont sublimer les mariages de cette année et comment les adopter avec style.",
    category: "Inspiration",
    date: "15 mars 2025",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    featured: false,
  },
  {
    id: 3,
    slug: "budget-mariage-optimiser",
    title: "Budget mariage : comment optimiser sans sacrifier le rêve",
    excerpt:
      "Organiser un mariage de rêve sans se ruiner, c'est possible ! Nos astuces pour répartir intelligemment votre budget et économiser sur les bons postes sans que ça se voit.",
    category: "Budget",
    date: "5 mars 2025",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    featured: false,
  },
  {
    id: 4,
    slug: "plus-beaux-domaines-provence",
    title: "Les plus beaux domaines pour un mariage en Provence",
    excerpt:
      "Champs de lavande, mas en pierre, mas provençaux baignés de lumière dorée… La Provence offre des décors de cinéma pour un mariage inoubliable. Notre sélection des lieux les plus exclusifs.",
    category: "Inspiration",
    date: "20 février 2025",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1532073150508-0c1df022bdd1?w=800&q=80",
    featured: false,
  },
  {
    id: 5,
    slug: "robe-mariee-conseils",
    title: "Robe de mariée : nos conseils pour trouver la robe parfaite",
    excerpt:
      "Sirène, princesse, empire ou bohème… La robe de mariée est LE vêtement de votre vie. Nos conseils pour naviguer entre les essayages, les créateurs et trouver celle qui vous ressemble.",
    category: "Mode",
    date: "10 février 2025",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80",
    featured: false,
  },
  {
    id: 6,
    slug: "organisation-j-moins-6-mois",
    title: "Organisation J-6 mois : le guide complet pour ne rien oublier",
    excerpt:
      "À 6 mois du grand jour, la course contre la montre commence ! Checklist exhaustive, conseils de pros et rétroplanning détaillé pour aborder ces derniers mois sereinement et arriver le sourire aux lèvres.",
    category: "Organisation",
    date: "1 février 2025",
    readTime: "12 min",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    featured: false,
  },
];

// Merge SEO articles (shown first) with editorial articles
const seoMapped = seoArticles.map((a, i) => ({
  id: 100 + i,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  category: a.category,
  date: a.date,
  readTime: a.readTime,
  image: a.image,
  featured: false,
}));

const articles = [...seoMapped, ...editorialArticles];

const popularArticles = [
  { title: "Comment organiser son mariage : le guide complet 2026", readTime: "15 min", slug: "comment-organiser-son-mariage-guide-2026" },
  { title: "Checklist mariage : les 100 choses à ne pas oublier", readTime: "10 min", slug: "checklist-mariage-100-choses-a-ne-pas-oublier" },
  { title: "Budget mariage : combien coûte un mariage en France ?", readTime: "12 min", slug: "budget-mariage-combien-coute-mariage-france-2026" },
  { title: "Comment bien choisir son photographe de mariage", readTime: "8 min", slug: "comment-choisir-photographe-mariage" },
];

const categoryColors: Record<string, string> = {
  Organisation: "bg-blue-100 text-blue-700",
  Inspiration: "bg-rose-100 text-rose-600",
  Prestataires: "bg-amber-100 text-amber-700",
  Budget: "bg-green-100 text-green-700",
  Mode: "bg-purple-100 text-purple-700",
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === "Tous" || a.category === activeCategory;
    const matchSearch =
      search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
            Blog <span style={{ color: "#F06292" }}>& Conseils</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Inspirations, tendances et conseils d&apos;experts pour organiser le mariage de vos rêves.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-lg mx-auto relative">
            <svg
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  activeCategory === cat
                    ? { backgroundColor: "#F06292" }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Articles grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-medium text-gray-500">Aucun article trouvé</p>
                <p className="text-sm mt-1">Essayez un autre mot-clé ou une autre catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtered.map((article, i) => (
                  <article
                    key={article.id}
                    className={`group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 ${
                      i === 0 && activeCategory === "Tous" && search === ""
                        ? "md:col-span-2"
                        : ""
                    }`}
                  >
                    <Link href={`/blog/${article.slug}`}>
                      <div
                        className={`relative overflow-hidden ${
                          i === 0 && activeCategory === "Tous" && search === ""
                            ? "h-72 md:h-96"
                            : "h-52"
                        }`}
                      >
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <span
                          className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${
                            categoryColors[article.category]
                          }`}
                        >
                          {article.category}
                        </span>
                        {i === 0 && activeCategory === "Tous" && search === "" && (
                          <span className="absolute top-4 right-4 bg-white text-rose-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            À la une
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h2
                          className={`font-bold text-gray-900 group-hover:text-rose-500 transition-colors leading-snug mb-3 ${
                            i === 0 && activeCategory === "Tous" && search === ""
                              ? "text-2xl md:text-3xl"
                              : "text-xl"
                          }`}
                          style={{ fontFamily: "var(--font-playfair), serif" }}
                        >
                          {article.title}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {article.date}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {article.readTime} de lecture
                          </span>
                          <span className="ml-auto font-medium text-rose-400 flex items-center gap-1">
                            Lire
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0 space-y-8">

            {/* Articles populaires */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <h3
                className="text-lg font-bold text-gray-900 mb-5"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Articles populaires
              </h3>
              <div className="space-y-4">
                {popularArticles.map((a, i) => (
                  <Link
                    key={a.slug}
                    href={`/blog/${a.slug}`}
                    className="flex items-start gap-3 group"
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ backgroundColor: "#F06292" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-rose-500 transition-colors leading-snug">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.readTime} de lecture</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <h3
                className="text-lg font-bold text-gray-900 mb-5"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Catégories
              </h3>
              <div className="space-y-2">
                {categories.filter((c) => c !== "Tous").map((cat) => {
                  const count = articles.filter((a) => a.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        activeCategory === cat
                          ? "text-white font-semibold"
                          : "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-500"
                      }`}
                      style={activeCategory === cat ? { backgroundColor: "#F06292" } : {}}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          activeCategory === cat
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Newsletter */}
            <div
              className="rounded-3xl p-6 text-white"
              style={{ background: "linear-gradient(135deg, #F06292, #E91E63)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Newsletter
              </p>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Chaque semaine dans votre boîte
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Nos meilleurs articles, tendances et bons plans mariage.
              </p>
              <NewsletterForm variant="sidebar" />
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
