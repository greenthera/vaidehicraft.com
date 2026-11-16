import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Generate static-host image sizes without changing the original product photos.
const root = fileURLToPath(new URL('..', import.meta.url));
const directory = path.join(root, 'public/images/products');
const metadataFile = path.join(root, 'src/data/product-image-variants.json');
const widths = [320, 640, 960];
const files = (await fs.readdir(directory)).filter(name => name.endsWith('.webp')).sort();
const inputs = await Promise.all(files.map(async name => ({ name, bytes: await fs.readFile(path.join(directory, name)) })));
const digest = crypto.createHash('sha256').update('webp-quality86-effort5-widths320-640-960-v1');
for (const input of inputs) digest.update(input.name).update(input.bytes);
const version = digest.digest('hex').slice(0, 12);
const generatedRoot = path.join(directory, 'responsive');
const destination = path.join(generatedRoot, version);
let previous;
try { previous = JSON.parse(await fs.readFile(metadataFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (previous?.version === version && previous.sources) {
  let complete = true;
  for (const input of inputs) {
    const stem = path.parse(input.name).name;
    const originalWidth = previous.sources[stem];
    for (const width of widths.filter(value => value < originalWidth && !previous.omitted?.[stem]?.includes(value))) {
      try { if (!(await fs.stat(path.join(destination, `${stem}-${width}.webp`))).size) complete = false; }
      catch (error) { if (error.code !== 'ENOENT') throw error; complete = false; }
    }
  }
  if (complete) { console.log(`Responsive product images are current (${files.length} originals).`); process.exit(0); }
}
await fs.mkdir(destination, { recursive: true });
const metadata = { version, widths, sources: {}, omitted: {} };
let generated = 0;
let totalOriginal = 0;
let totalSmall = 0;
let completed = 0;
const queue = [...inputs];
await Promise.all(Array.from({ length: 2 }, async () => {
  while (queue.length) {
    const input = queue.shift();
    const stem = path.parse(input.name).name;
    const info = await sharp(input.bytes).metadata();
    metadata.sources[stem] = info.width;
    totalOriginal += input.bytes.length;
    for (const width of widths.filter(value => value < info.width)) {
      const output = await sharp(input.bytes).resize({ width, withoutEnlargement: true }).webp({ quality: 86, effort: 5, smartSubsample: true }).toBuffer();
      if (output.length >= input.bytes.length) {
        (metadata.omitted[stem] ||= []).push(width);
        continue;
      }
      await fs.writeFile(path.join(destination, `${stem}-${width}.webp`), output);
      generated++;
      if (width === 320) totalSmall += output.length;
    }
    if (++completed % 75 === 0) console.log(`Prepared ${completed}/${inputs.length} product photos.`);
  }
}));
for (const key of ['sources', 'omitted']) metadata[key] = Object.fromEntries(Object.entries(metadata[key]).sort(([a], [b]) => a.localeCompare(b)));
await fs.writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);
// Only this build-generated directory is cleaned; uploaded originals stay intact.
for (const item of await fs.readdir(generatedRoot)) if (item !== version) await fs.rm(path.join(generatedRoot, item), { recursive: true, force: true });
console.log(`Prepared ${generated} responsive images from ${inputs.length} originals; 320px copies total ${totalSmall} bytes vs ${totalOriginal} bytes for originals.`);
