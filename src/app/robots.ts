export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";
import { assetPath } from "@/lib/site-path";

export default function robots(): MetadataRoute.Robots {
  return siteOrigin
    // Main and product inquiry pages are crawlable and indexable.
    // The private event invitation is blocked at the owner’s request.
    ? { rules: { userAgent: "*", allow: "/", disallow: [assetPath("/api/"), assetPath("/events/infinity-4/invite")] }, sitemap: `${siteOrigin}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
