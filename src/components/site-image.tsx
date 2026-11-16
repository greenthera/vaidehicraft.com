import Image, { type ImageProps } from "next/image";
import { assetPath } from "@/lib/site-path";
import { productImageSources } from "@/lib/product-image-sources";

export default function SiteImage(props: ImageProps) {
  const src = typeof props.src === "string" ? assetPath(props.src) : props.src;
  const srcSet = typeof props.src === "string" && !props.unoptimized && !props.loader ? productImageSources(props.src) : undefined;
  if (!srcSet) return <Image {...props} alt={props.alt} src={src} />;
  const eager = Boolean(props.priority || props.preload || props.loading === "eager");
  const sizes = props.sizes || (props.width ? `${props.width}px` : "100vw");
  return <>
    {(props.priority || props.preload) && <link rel="preload" as="image" href={typeof src === "string" ? src : undefined} imageSrcSet={srcSet} imageSizes={sizes} fetchPriority="high" />}
    <picture className="contents"><source type="image/webp" srcSet={srcSet} sizes={sizes} /><Image {...props} alt={props.alt} src={src} priority={false} preload={false} loading={props.loading || (eager ? "eager" : "lazy")} fetchPriority={props.fetchPriority || (eager ? "high" : undefined)} /></picture>
  </>;
}
