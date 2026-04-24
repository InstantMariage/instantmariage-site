import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

const categoryColors: Record<string, string> = {
  Organisation: "bg-blue-100 text-blue-700",
  Inspiration: "bg-rose-100 text-rose-600",
  Prestataires: "bg-amber-100 text-amber-700",
  Budget: "bg-green-100 text-green-700",
  Mode: "bg-purple-100 text-purple-700",
  Conseils: "bg-teal-100 text-teal-700",
};

type ArticleSummary = {
  slug: string;
  titre: string;
  excerpt: string | null;
  category: string;
  image: string | null;
  read_time: string;
  date_publication: string;
};

async function getArticles(): Promise<ArticleSummary[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("articles")
    .select("slug, titre, excerpt, category, image, read_time, date_publication")
    .eq("statut", "publie")
    .order("date_publication", { ascending: false });
  return data ?? [];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const articles = await getArticles();

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

      {/* Articles grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">Les articles arrivent très prochainement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
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
      </section>

      <Footer />
    </main>
  );
}
