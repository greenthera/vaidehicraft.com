export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";
import { assetPath } from "@/lib/site-path";

export default function robots(): MetadataRoute.Robots {
  return siteOrigin
    // Inquiry pages stay crawlable so their noindex metadata can be read.
    // Only the non-page API is blocked; images, scripts and styles stay accessible.
    ? { rules: { userAgent: "*", allow: "/", disallow: assetPath("/api/") }, sitemap: `${siteOrigin}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
