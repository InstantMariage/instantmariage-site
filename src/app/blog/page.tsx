import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogFilter from "@/components/BlogFilter";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

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

      {/* Articles with filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <BlogFilter articles={articles} />
      </section>

      <Footer />
    </main>
  );
}
