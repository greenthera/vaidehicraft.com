export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { articlePath, journalArticles } from "@/lib/journal";
import { collections, products } from "@/lib/catalog";
import { siteOrigin, pageUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteOrigin) return [];
  // Include indexable public pages only. /make-an-inquiry (including product
  // forms), /thank-you, private event invitations and legacy redirects are omitted.
  return [
    { url: pageUrl("/", siteOrigin), changeFrequency: "monthly", priority: 1 },
    { url: pageUrl("/privacy-policy", siteOrigin), changeFrequency: "yearly", priority: 0.3 },
    { url: pageUrl("/cookie-policy", siteOrigin), changeFrequency: "yearly", priority: 0.3 },
    { url: pageUrl("/contact", siteOrigin), changeFrequency: "monthly", priority: 0.5 },
    { url: pageUrl("/blog", siteOrigin), changeFrequency: "monthly", priority: 0.5 },
    ...journalArticles.map((article) => ({ url: pageUrl(articlePath(article.slug), siteOrigin), images: [`${siteOrigin}${article.image}`], changeFrequency: "yearly" as const, priority: 0.5 })),
    ...collections.map((collection) => ({ url: pageUrl(`/furniture/${collection.slug}`, siteOrigin), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...products.filter((product) => product.includeInSitemap).map((product) => ({ url: pageUrl(product.path, siteOrigin), images: product.images.map((image) => `${siteOrigin}${image}`), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
