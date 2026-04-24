import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

/* ── Types ──────────────────────────────────────────────────── */
type ContentBlock =
  | { type: "intro"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "table"; headers: string[]; rows: string[][] };

type Article = {
  id: string;
  slug: string;
  titre: string;
  excerpt: string | null;
  category: string;
  content: ContentBlock[];
  image: string | null;
  meta_description: string | null;
  keywords: string | null;
  read_time: string;
  auteur: string;
  statut: string;
  date_publication: string;
  nb_vues: number;
};

/* ── Supabase ───────────────────────────────────────────────── */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await getSupabase()
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("statut", "publie")
    .single();
  return data ?? null;
}

/* ── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  const { data } = await getSupabase()
    .from("articles")
    .select("slug")
    .eq("statut", "publie");
  return (data ?? []).map((a) => ({ slug: a.slug }));
}

/* ── Metadata ───────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: `${article.titre} – InstantMariage`,
    description: article.meta_description ?? undefined,
    keywords: article.keywords ?? undefined,
    openGraph: {
      title: article.titre,
      description: article.meta_description ?? undefined,
      url: `https://instantmariage.fr/blog/${article.slug}`,
      siteName: "InstantMariage.fr",
      images: article.image ? [{ url: article.image, width: 1200, height: 630, alt: article.titre }] : [],
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.titre,
      description: article.meta_description ?? undefined,
      images: article.image ? [article.image] : [],
    },
  };
}

/* ── Category badge colors ─────────────────────────────────── */
const categoryColors: Record<string, string> = {
  Organisation: "bg-blue-100 text-blue-700",
  Inspiration: "bg-rose-100 text-rose-600",
  Prestataires: "bg-amber-100 text-amber-700",
  Budget: "bg-green-100 text-green-700",
  Mode: "bg-purple-100 text-purple-700",
  Conseils: "bg-teal-100 text-teal-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Content renderer ───────────────────────────────────────── */
function renderBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case "intro":
      return (
        <p
          key={idx}
          className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium border-l-4 pl-5 py-1 mb-8"
          style={{ borderColor: "#F06292" }}
        >
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2
          key={idx}
          className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-5"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={idx}
          className="text-xl font-bold text-gray-800 mt-8 mb-3"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={idx} className="text-gray-600 leading-relaxed mb-5 text-base md:text-[17px]">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={idx} className="space-y-2.5 mb-6 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600 text-base md:text-[17px]">
              <span
                className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#F06292" }}
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx} className="space-y-3 mb-6 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600 text-base md:text-[17px]">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: "#F06292" }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div
          key={idx}
          className="rounded-2xl p-5 mb-6 border"
          style={{ backgroundColor: "#FFF5F8", borderColor: "#FBBDD5" }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: "#EC407A" }}>
            💡 {block.title}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">{block.text}</p>
        </div>
      );
    case "quote":
      return (
        <blockquote key={idx} className="my-8 pl-6 border-l-4 border-rose-300">
          <p
            className="text-gray-700 text-lg italic leading-relaxed mb-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            &ldquo;{block.text}&rdquo;
          </p>
          {block.author && (
            <cite className="text-sm text-gray-400 not-italic">— {block.author}</cite>
          )}
        </blockquote>
      );
    case "table":
      return (
        <div key={idx} className="overflow-x-auto mb-8 rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #F06292, #EC407A)" }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left text-white font-semibold px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-rose-50/40"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-5 py-3 text-gray-600 border-b border-gray-50">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

/* ── Page ───────────────────────────────────────────────────── */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const { data: otherArticles } = await getSupabase()
    .from("articles")
    .select("slug, titre, image, read_time")
    .eq("statut", "publie")
    .neq("slug", slug)
    .limit(3);

  const isCategoryVendor = article.category === "Prestataires";

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="pt-20">
        <div className="relative h-72 md:h-96 lg:h-[480px] overflow-hidden">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.titre}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-rose-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Back link */}
          <div className="absolute top-6 left-4 sm:left-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/90 text-sm font-medium
                         bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full
                         hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Blog
            </Link>
          </div>

          {/* Category + title */}
          <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${categoryColors[article.category] ?? "bg-white/20 text-white"}`}>
              {article.category}
            </span>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {article.titre}
            </h1>
          </div>
        </div>

        {/* Meta bar */}
        <div
          className="border-b border-gray-100"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #EC407A 100%)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-5 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(article.date_publication)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.read_time} de lecture
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {article.category}
            </span>
          </div>
        </div>
      </section>

      {/* ── Content + Sidebar ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Article body */}
          <article className="flex-1 max-w-3xl">
            {article.content.map((block, idx) => renderBlock(block, idx))}

            {/* ── CTA bottom ────────────────────────────────── */}
            <div
              className="mt-14 rounded-3xl p-8 text-center text-white"
              style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E63 100%)" }}
            >
              {isCategoryVendor ? (
                <>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
                    Pour les prestataires
                  </p>
                  <h2
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    Rejoignez l&apos;annuaire InstantMariage
                  </h2>
                  <p className="text-white/85 mb-6 text-sm leading-relaxed max-w-md mx-auto">
                    Créez votre profil gratuit et soyez visible auprès de milliers de couples
                    qui recherchent activement des prestataires comme vous.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/inscription"
                      className="bg-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-rose-50 shadow-sm"
                      style={{ color: "#E91E63" }}
                    >
                      Créer mon profil gratuit →
                    </Link>
                    <Link
                      href="/tarifs"
                      className="border-2 border-white/60 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-white/10"
                    >
                      Voir les offres Pro
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
                    Prochaine étape
                  </p>
                  <h2
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    Trouvez vos prestataires de rêve
                  </h2>
                  <p className="text-white/85 mb-6 text-sm leading-relaxed max-w-md mx-auto">
                    Photographes, traiteurs, fleuristes, DJ… Consultez notre annuaire de prestataires
                    vérifiés et demandez des devis gratuitement.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/annuaire"
                      className="bg-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-rose-50 shadow-sm"
                      style={{ color: "#E91E63" }}
                    >
                      Voir l&apos;annuaire →
                    </Link>
                    <Link
                      href="/inscription"
                      className="border-2 border-white/60 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-white/10"
                    >
                      Créer mon compte
                    </Link>
                  </div>
                </>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0 space-y-6">

            {/* Table of contents */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3
                className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ backgroundColor: "#F06292" }}
                >
                  ≡
                </span>
                Dans cet article
              </h3>
              <nav className="space-y-1.5">
                {article.content
                  .filter((b) => b.type === "h2")
                  .map((b, i) =>
                    b.type === "h2" ? (
                      <p
                        key={i}
                        className="text-sm text-gray-500 leading-snug pl-2 border-l-2 border-gray-100 hover:border-rose-300 hover:text-rose-500 transition-colors cursor-default py-0.5"
                      >
                        {b.text}
                      </p>
                    ) : null
                  )}
              </nav>
            </div>

            {/* Other articles */}
            {otherArticles && otherArticles.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3
                  className="text-base font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Articles similaires
                </h3>
                <div className="space-y-4">
                  {otherArticles.map((a) => (
                    <Link key={a.slug} href={`/blog/${a.slug}`} className="flex gap-3 group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        {a.image ? (
                          <Image
                            src={a.image}
                            alt={a.titre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full bg-rose-50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-rose-500 transition-colors leading-snug line-clamp-2">
                          {a.titre}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{a.read_time} de lecture</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mini CTA */}
            <div
              className="rounded-3xl p-6 text-white text-center"
              style={{ background: "linear-gradient(135deg, #F06292, #E91E63)" }}
            >
              <div className="text-3xl mb-3">💍</div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Outils gratuits
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Checklist, budget, rétroplanning… Accédez à tous nos outils dans votre espace mariés.
              </p>
              <Link
                href="/inscription"
                className="block bg-white text-sm font-semibold py-2.5 rounded-full transition hover:bg-rose-50"
                style={{ color: "#E91E63" }}
              >
                Créer mon compte gratuit
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
