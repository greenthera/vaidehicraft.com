import type { ReactNode } from "react";
import mobileImages from "@/data/mobile-home-images.json";
import { assetPath } from "@/lib/site-path";

/** Mobile-only sources; the existing child image remains the desktop fallback. */
export function MobilePicture({ image, sizes = "100vw", children }: { image: keyof typeof mobileImages; sizes?: string; children: ReactNode }) {
  const sources = mobileImages[image];
  return <picture className="contents"><source media="(max-width: 750px)" type="image/avif" srcSet={sources.map((source) => `${assetPath(source.path)} ${source.width}w`).join(", ")} sizes={sizes} />{children}</picture>;
}
