import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync('src/lib/site-origin.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {}, URL };
vm.runInNewContext(compiled, context);
const { resolveSiteConfiguration, resolveSiteOrigin } = context.exports;
const official = 'https://vaidehicraft.com';
const cases = [
  ['Production defaults to official domain', { NODE_ENV: 'production' }, official, official],
  ['Vercel production keeps official canonical', { VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'vaidehicraft.vercel.app' }, official, official],
  ['Vercel deployment hostname is not canonical', { VERCEL_ENV: 'production', VERCEL_URL: 'unique-hash.vercel.app' }, official, official],
  ['Prefixed Vercel production', { NEXT_PUBLIC_VERCEL_ENV: 'production', NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: 'branch.vercel.app' }, official, official],
  ['Vercel preview', { VERCEL_ENV: 'preview', VERCEL_URL: 'branch.vercel.app' }, undefined, official],
  ['Vercel dev', { VERCEL_ENV: 'development' }, undefined, official],
  ['Vercel without context', { VERCEL_URL: 'branch.vercel.app' }, undefined, official],
  ['Vercel primary hostname without context', { VERCEL_PROJECT_PRODUCTION_URL: 'branch.vercel.app' }, undefined, official],
  ['Preview inherited override stays private', { VERCEL_ENV: 'preview', NEXT_PUBLIC_SITE_URL: official }, undefined, official],
  ['Netlify production', { NETLIFY: 'true', CONTEXT: 'production', URL: 'https://site.netlify.app' }, official, official],
  ['Netlify preview', { NETLIFY: 'true', CONTEXT: 'deploy-preview' }, undefined, official],
  ['Netlify branch deployment', { NETLIFY: 'true', CONTEXT: 'branch-deploy' }, undefined, official],
  ['Netlify dev server', { NETLIFY: 'true', CONTEXT: 'production', NETLIFY_PREVIEW_SERVER: 'true' }, undefined, official],
  ['Render production', { RENDER: 'true', IS_PULL_REQUEST: 'false', RENDER_EXTERNAL_URL: 'https://site.onrender.com' }, official, official],
  ['Render pull request', { RENDER: 'true', IS_PULL_REQUEST: 'true' }, undefined, official],
  ['Local development default', { NODE_ENV: 'development' }, undefined, official],
  ['Local with production context stays private', { NODE_ENV: 'development', VERCEL_ENV: 'production' }, undefined, official],
  ['Explicit custom-domain override', { SITE_URL: 'https://other.example' }, 'https://other.example', 'https://other.example'],
  ['Public override takes priority', { NEXT_PUBLIC_SITE_URL: 'https://other.example/', SITE_URL: official }, 'https://other.example', 'https://other.example'],
  ['Local with override stays private', { NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'https://other.example' }, undefined, 'https://other.example'],
];
for (const [name, env, siteOrigin, metadataOrigin] of cases) {
  const actual = resolveSiteConfiguration(env);
  assert.equal(actual.siteOrigin, siteOrigin, name);
  assert.equal(actual.metadataOrigin, metadataOrigin, name);
}
for (const value of ['invalid', 'javascript:alert(1)', 'https://u:p@example.com', 'https://example.com/path', 'https://example.com?x=1', 'https://example.com/#x']) assert.throws(() => resolveSiteOrigin(value));
assert.equal(resolveSiteOrigin('  '), undefined);
console.log(`PASS: ${cases.length} hosting/domain cases, preview indexing protection, custom-domain migration and invalid-origin rejection.`);
