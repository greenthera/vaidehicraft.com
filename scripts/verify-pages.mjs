import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.PAGES_BASE_PATH ?? '';
const origin = process.env.PAGES_ORIGIN || 'https://vaidehicraft.com';
const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const articles = JSON.parse(fs.readFileSync('src/data/journal.json', 'utf8'));
const routes = ['/events/infinity-4/invite', '/', '/contact', '/blog', '/privacy-policy', '/cookie-policy', '/thank-you', '/make-an-inquiry', ...['chairs','sofas','tables','swings'].map(c=>`/furniture/${c}`), ...products.flatMap(p=>[p.path,p.quotePath]), ...articles.map(a=>`/blog/${a.slug}`)];
function checkSchemaPageUrls(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (['url', 'item', 'mainEntityOfPage'].includes(key) && typeof child === 'string' && child.startsWith(`${origin}${base}`)) {
      assert(child.endsWith('/'), `Schema page URL must match static routing: ${child}`);
    }
    if (child && typeof child === 'object') checkSchemaPageUrls(child);
  }
}
for (const route of routes) {
  const file = path.join('out', route, 'index.html');
  assert(fs.existsSync(file), `Missing static page: ${route}`);
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<h1[\s>]/, `Missing visible page content: ${route}`);
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) checkSchemaPageUrls(JSON.parse(match[1]));
  for (const property of ['og:title', 'og:description', 'og:image', 'og:url']) assert(html.includes(`property="${property}"`), `Missing ${property}: ${route}`);
  for (const property of ['twitter:title', 'twitter:description', 'twitter:image']) assert(html.includes(`name="${property}"`), `Missing ${property}: ${route}`);
  const product = products.find((item) => item.path === route);
  const canonicalPath = product?.canonicalPath || route;
  const canonicalUrl = `${origin}${base}${canonicalPath === '/' ? '/' : `${canonicalPath}/`}`;
  assert(html.includes(`rel="canonical" href="${canonicalUrl}"`), `Incorrect canonical: ${route}`);
  const pageUrl = `${origin}${base}${route === '/' ? '/' : `${route}/`}`;
  assert(html.includes(`property="og:url" content="${pageUrl}"`), `Incorrect Open Graph URL: ${route}`);
  if (!base && origin === 'https://vaidehicraft.com') assert(!/greenthera\.shivantra\.com|vaidehicraft\.vercel\.app|["']\/vaidehicraft\.com\//.test(html), `Staging URL leaked into production: ${route}`);
  if (route === '/make-an-inquiry' || route.startsWith('/make-an-inquiry/')) {
    assert.match(html, /<title>Make an inquiry/, `Incorrect inquiry title: ${route}`);
    assert.match(html, /<h1\b[^>]*>Make an inquiry<\/h1>/, `Incorrect inquiry heading: ${route}`);
    assert(html.includes('aria-current="page">Make an inquiry'), `Incorrect inquiry breadcrumb: ${route}`);
    assert.match(html, /name="robots" content="index, follow"/, `Inquiry page must be indexable: ${route}`);
  }
  for (const match of html.matchAll(/<a\b[^>]*aria-label="View [^"]+ details"[^>]*>/g)) {
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1];
    assert(href?.startsWith(`${base}/furniture/`) && href.endsWith('/'), `Invalid product destination in ${route}: ${href}`);
    assert(fs.existsSync(path.join('out', href.slice(base.length), 'index.html')), `Missing product destination: ${href}`);
  }
  for (const match of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/gi)) {
    for (const candidate of match[1].split(',')) {
      const asset = candidate.trim().split(/\s+/)[0];
      if (!asset.startsWith('/') || asset.startsWith('//')) continue;
      assert(asset.startsWith(`${base}/`), `Unprefixed responsive asset ${asset} in ${route}`);
      assert(fs.existsSync(path.join('out', decodeURIComponent(asset.slice(base.length)))), `Missing responsive asset ${asset}`);
    }
  }
  for (const match of html.matchAll(/(?:src|poster)="(\/(?!\/)[^"?]+)(?:\?[^"\s]*)?"/g)) {
    const asset = match[1];
    assert(asset.startsWith(`${base}/`), `Unprefixed asset ${asset} in ${route}`);
    assert(fs.existsSync(path.join('out', decodeURIComponent(asset.slice(base.length)))), `Missing asset ${asset}`);
  }
}
const home = fs.readFileSync('out/index.html', 'utf8');
for (const redirect of JSON.parse(fs.readFileSync('src/data/legacy-redirects.json', 'utf8'))) {
  const html = fs.readFileSync(path.join('out', redirect.source, 'index.html'), 'utf8');
  assert(html.includes(`content="0;url=${base}${redirect.destination}/"`), `Incorrect static redirect: ${redirect.source}`);
  assert(fs.existsSync(path.join('out', redirect.destination, 'index.html')), `Missing redirect destination: ${redirect.destination}`);
}
assert(home.includes(`href="${origin}${base}/"`), 'Home canonical is wrong');
assert(!home.includes('/_next/image?'), 'Static build must not use the Next.js image API');
assert(fs.existsSync('out/.nojekyll'));
if (!base && !new URL(origin).hostname.endsWith('.github.io')) {
  assert.equal(fs.readFileSync('out/CNAME', 'utf8').trim(), new URL(origin).hostname, 'Incorrect custom domain');
} else assert(!fs.existsSync('out/CNAME'), 'Subpath previews must not configure a custom domain');
assert(fs.existsSync('out/404.html'));
const sitemap = fs.readFileSync('out/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'Duplicate sitemap URLs');
assert(sitemapUrls.includes(`${origin}${base}/make-an-inquiry/`), 'Main inquiry page must appear in sitemap');
for (const product of products) assert(sitemapUrls.includes(`${origin}${base}${product.quotePath}/`), `Missing product inquiry in sitemap: ${product.quotePath}`);
for (const url of sitemapUrls) {
  assert(url.startsWith(`${origin}${base}/`), `Wrong sitemap origin or base path: ${url}`);
  assert(!/\/(?:request-quote|thank-you)(?:\/|$)/.test(new URL(url).pathname), `Non-indexable sitemap URL: ${url}`);
  assert(fs.existsSync(path.join('out', new URL(url).pathname.slice(base.length), 'index.html')), `Missing sitemap page: ${url}`);
  const html = fs.readFileSync(path.join('out', new URL(url).pathname.slice(base.length), 'index.html'), 'utf8');
  assert(html.includes(`rel="canonical" href="${url}"`), `Sitemap URL differs from canonical: ${url}`);
  assert(!/name="robots" content="[^"]*noindex/.test(html), `Noindex page in sitemap: ${url}`);
}
for (const product of products.filter((item) => item.includeInSitemap)) assert(sitemap.includes(`${origin}${base}${product.path}`));
assert(fs.readFileSync('out/robots.txt', 'utf8').includes(`${origin}${base}/sitemap.xml`));
const robots = fs.readFileSync('out/robots.txt', 'utf8');
assert(robots.includes(`Disallow: ${base}/events/infinity-4/invite`), 'Private invitation must be blocked');
assert(!sitemap.includes('/events/infinity-4/invite'), 'Private invitation must not appear in sitemap');
assert.match(fs.readFileSync('out/events/infinity-4/invite/index.html', 'utf8'), /name="robots" content="[^"]*noindex/, 'Private invitation must remain noindex');
assert(robots.includes(`Disallow: ${base}/api/`), 'API must be excluded from crawling');
assert(!/Disallow:.*(?:make-an-inquiry|request-quote|_next|images|media|fonts)/.test(robots), 'Noindex forms and public resources must stay crawlable');
assert(!fs.existsSync('out/api/enquiries/index.html'));
let css = '';
let js = '';
function walk(dir) { for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.css'))css+=fs.readFileSync(file,'utf8');else if(file.endsWith('.js'))js+=fs.readFileSync(file,'utf8');} }
walk('out/_next');
assert(css.includes(`${base}/fonts/`));
assert(js.includes('docs.google.com/forms/d/e/'), 'Pages forms must post to the Google Form');
assert(!js.includes('/api/enquiries'), 'Pages forms must not depend on a server route');
if (base) assert(!/url\(["']?\/fonts\//.test(css));
console.log(`Verified ${routes.length} pre-rendered pages, public assets, metadata, fonts, sitemap, robots and 404. No browser or external submissions used.`);
