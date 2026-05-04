import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

type Article = {
  slug: string;
  titre: string;
  excerpt: string | null;
  category: string;
  date_publication: string;
};

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, titre, excerpt, category, date_publication")
    .eq("statut", "publie")
    .order("date_publication", { ascending: false })
    .limit(50);

  const items: Article[] = articles ?? [];
  const siteUrl = "https://instantmariage.fr";

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>InstantMariage.fr – Blog &amp; Conseils Mariage</title>
    <description>Inspirations, tendances et conseils d'experts pour organiser le mariage de vos rêves.</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>InstantMariage.fr</title>
      <link>${siteUrl}</link>
    </image>
    ${items
      .map(
        (a) => `<item>
      <title><![CDATA[${a.titre}]]></title>
      <description><![CDATA[${a.excerpt ?? ""}]]></description>
      <link>${siteUrl}/blog/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${a.slug}</guid>
      <pubDate>${new Date(a.date_publication).toUTCString()}</pubDate>
      <category><![CDATA[${a.category}]]></category>
    </item>`
      )
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
