import variants from "@/data/product-image-variants.json";
import { assetPath, basePath } from "@/lib/site-path";

/** Static srcsets work on GitHub Pages without an image-optimization server. */
export function productImageSources(src: string) {
  const local = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  const stem = local.match(/^\/images\/products\/([^/]+)\.webp$/)?.[1];
  if (!stem) return undefined;
  const width = (variants.sources as Record<string, number>)[stem];
  if (!width) return undefined;
  const omitted = (variants.omitted as Record<string, number[]>)[stem] || [];
  const candidates = variants.widths.filter((value) => value < width && !omitted.includes(value)).map((value) => ({
    width: value,
    src: assetPath(`/images/products/responsive/${variants.version}/${stem}-${value}.webp`),
  }));
  candidates.push({ width, src: assetPath(local) });
  return candidates.map((candidate) => `${candidate.src} ${candidate.width}w`).join(", ");
}
