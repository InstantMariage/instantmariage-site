import { MetadataRoute } from "next";
import { METIERS_SEO, VILLES_SEO, buildSlug } from "@/data/seo-local";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://instantmariage.fr";

  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/annuaire", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/sitemap-villes", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tarifs", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/inscription", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/demo", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/a-propos", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/cgu", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  // Pages SEO locales : [metier]-mariage-[ville]
  const localPages: MetadataRoute.Sitemap = [];
  for (const metier of METIERS_SEO) {
    for (const ville of VILLES_SEO) {
      localPages.push({
        url: `${baseUrl}/annuaire/${buildSlug(metier.slug, ville.slug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...localPages,
  ];
}
