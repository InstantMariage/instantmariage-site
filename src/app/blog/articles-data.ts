export type ContentBlock =
  | { type: "intro"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  metaDescription: string;
  keywords: string;
  content: ContentBlock[];
}

export const seoArticles: Article[] = [
  // Les articles seront ajoutés ici prochainement
];

export function getArticleBySlug(slug: string): Article | undefined {
  return seoArticles.find((a) => a.slug === slug);
}
