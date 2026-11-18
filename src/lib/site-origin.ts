type Environment = Record<string, string | undefined>;

export const productionSiteOrigin = "https://vaidehicraft.com";

export function resolveSiteOrigin(value?: string) {
  const configured = value?.trim();
  if (!configured) return undefined;
  let url: URL;
  try { url = new URL(configured); } catch { throw new Error("The site URL must be a complete http(s) origin."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("The site URL must contain only an http(s) scheme and hostname, with no credentials, path, query or fragment.");
  }
  return url.origin;
}

/** Keep the official domain canonical across hosting providers; previews stay noindex. */
export function resolveSiteConfiguration(env: Environment) {
  const origin = resolveSiteOrigin(env.NEXT_PUBLIC_SITE_URL?.trim() || env.SITE_URL) || productionSiteOrigin;
  let preview = env.NODE_ENV === "development";
  const vercelEnvironment = env.VERCEL_ENV || env.NEXT_PUBLIC_VERCEL_ENV;

  if (env.VERCEL === "1" || vercelEnvironment || env.VERCEL_URL || env.NEXT_PUBLIC_VERCEL_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    // Without production context, treat a Vercel deployment as a preview.
    preview ||= vercelEnvironment !== "production";
  } else if (env.NETLIFY === "true") {
    preview ||= env.CONTEXT !== "production" || env.NETLIFY_PREVIEW_SERVER === "true";
  } else if (env.RENDER === "true") {
    preview ||= env.IS_PULL_REQUEST === "true";
  }

  return { siteOrigin: preview ? undefined : origin, metadataOrigin: origin };
}
