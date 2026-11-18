# GitHub Pages production deployment

Production is configured for **https://vaidehicraft.com/**. There is no repository prefix in page URLs or asset paths. `www.vaidehicraft.com` should redirect to this primary domain through the hosting configuration.

## Build and publish

```bash
npm run build:pages
npm run verify:pages
```

These commands prepare and validate `out/` without publishing. The export includes all 228 content/form pages, local assets, legacy redirect pages, `404.html`, `robots.txt`, `sitemap.xml`, `.nojekyll`, and `CNAME` containing `vaidehicraft.com`. Direct routes use `route/index.html`.

When ready to publish:

```bash
npm run deploy
```

This rebuilds, verifies, and pushes only `out/` to the `gh-pages` branch of `https://github.com/greenthera/vaidehicraft.com.git`. Source code is not committed or pushed by this command. GitHub Pages must use `gh-pages` / root. The normal `npm run build` remains available for Node/server hosting and retains the enquiry API.

## Complete the domain cutover

1. In the repository's **Settings → Pages**, set the custom domain to `vaidehicraft.com` before changing DNS.
2. Publish the verified root-domain build using `npm run deploy` so the new files and `CNAME` are ready before DNS cutover.
3. At the DNS provider, point the apex domain to GitHub Pages using its documented A records (or supported ALIAS/ANAME). Point `www` by CNAME to `greenthera.github.io`, without a repository path. Retain the business's existing mail records.
4. Once GitHub reports the domain/certificate ready, enable **Enforce HTTPS**. With both DNS entries configured and the apex selected as the custom domain, GitHub Pages redirects `www` to the apex.
5. Verify HTTPS, homepage and direct product/inquiry URLs, images, videos, consent choices, and one approved enquiry in the linked Google Sheet. Submit `https://vaidehicraft.com/sitemap.xml` in the domain's Search Console property.

Follow [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for the current DNS records. These code changes do not change GitHub settings, DNS, certificates, or Search Console.

## Configuration

No env file is required for the production defaults. Remove any old staging overrides from your shell or build settings.

- `PAGES_ORIGIN`: defaults to `https://vaidehicraft.com`.
- `PAGES_BASE_PATH`: defaults to an empty string.
- `NEXT_PUBLIC_SITE_URL` / `SITE_URL`: optional origin override for normal server builds; defaults to the official domain. The Pages builder supplies its own origin from `PAGES_ORIGIN`.

A root custom-domain export generates `CNAME` from its origin hostname. A subpath or default `*.github.io` export omits it. Never set the production base path to `/vaidehicraft.com`.

For an explicit staging/subpath build without publishing:

```bash
PAGES_ORIGIN=https://greenthera.shivantra.com PAGES_BASE_PATH=/vaidehicraft.com npm run build:pages
PAGES_ORIGIN=https://greenthera.shivantra.com PAGES_BASE_PATH=/vaidehicraft.com npm run verify:pages
```

Rebuild with the default production settings before publishing to the production branch. The build uses an isolated `.pages-build/` copy, then removes it. It does not delete the working API route or publish environment files.

## Forms and SEO

GitHub Pages cannot run `/api/enquiries`. Its forms post directly to the existing Google Form and linked Sheet, then open a personalized WhatsApp message in a reserved tab and show Thank You in the website tab. Popup blocking has a manual WhatsApp fallback. Google hides the response to cross-site requests, so the static flow cannot confirm whether Google rejected a submission; keep the Form accepting responses and retain its field IDs.

Canonicals, Open Graph/Twitter images, schema and sitemap use the official domain with root asset paths. Inquiry and thank-you pages remain noindex and outside the sitemap. Recognised platform previews and development stay noindex. Content, product slugs, fonts, media, consent and analytics settings are preserved.

GitHub Pages controls HTTP caching, security headers and domain redirects. Old application routes receive static HTML redirects, not HTTP 301 responses. Redirects from the previous staging host must be configured on that host if needed.
