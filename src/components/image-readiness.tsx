"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Warm upcoming images after scrolling, without competing with the first image. */
export function ImageReadiness() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    let disposed = false;
    let started = false;
    let observer: IntersectionObserver | undefined;
    let frame: number | undefined;
    let secondFrame: number | undefined;
    const queued = new WeakSet<HTMLImageElement>();
    const queue: HTMLImageElement[] = [];
    const pending = new Set<HTMLImageElement>();
    const targets = new Map<Element, HTMLImageElement[]>();
    const limit = window.matchMedia("(max-width: 750px)").matches ? 1 : 2;
    const hero = document.querySelector<HTMLImageElement>('main img[fetchpriority="high"], main img[loading="eager"]');

    function drain() {
      if (disposed) return;
      while (queue.length && pending.size < limit) {
        const image = queue.shift()!;
        if (!image.isConnected || (image.complete && image.naturalWidth > 0)) continue;
        const warm = new window.Image();
        warm.decoding = "async";
        warm.fetchPriority = "low";
        pending.add(warm);
        const finish = () => {
          warm.onload = null;
          warm.onerror = null;
          pending.delete(warm);
          drain();
        };
        warm.onload = () => { void warm.decode().catch(() => {}).finally(finish); };
        warm.onerror = finish;
        // Let the browser select exactly the same source as the visible picture.
        const picture = image.parentElement?.tagName === "PICTURE" ? image.parentElement : null;
        const source = picture && [...picture.querySelectorAll("source")].find((item) => !item.media || window.matchMedia(item.media).matches);
        const srcset = source?.srcset || image.srcset;
        if (srcset) {
          warm.sizes = source?.sizes || image.sizes || "100vw";
          warm.srcset = srcset;
        }
        warm.src = image.src;
      }
    }

    function observe() {
      if (disposed) return;
      for (const image of document.querySelectorAll<HTMLImageElement>('main img[loading="lazy"]')) {
        if (image.complete && image.naturalWidth > 0) continue;
        // A skipped content-visibility scene has no usable child image geometry.
        const target = image.closest(".mobile-scene-spaces, .mobile-scene-cane") || image;
        const images = targets.get(target) || [];
        images.push(image);
        targets.set(target, images);
      }
      observer = new IntersectionObserver((entries) => {
        const distance = (entry: IntersectionObserverEntry) => Math.max(0, entry.boundingClientRect.top - window.innerHeight, -entry.boundingClientRect.bottom);
        const approaching = entries.filter((entry) => entry.isIntersecting).sort((a, b) => distance(a) - distance(b));
        for (const entry of approaching) {
          for (const image of targets.get(entry.target) || []) {
            if (!queued.has(image)) { queued.add(image); queue.push(image); }
          }
          observer?.unobserve(entry.target);
        }
        drain();
      }, { rootMargin: "1600px 0px" });
      for (const target of targets.keys()) observer.observe(target);
    }

    function afterPaint() {
      if (disposed) return;
      frame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(observe);
      });
    }
    function start() {
      if (started || window.scrollY < 1) return;
      started = true;
      window.removeEventListener("scroll", start);
      if (hero && !hero.complete) {
        hero.addEventListener("load", afterPaint, { once: true });
        hero.addEventListener("error", afterPaint, { once: true });
      } else afterPaint();
    }
    window.addEventListener("scroll", start, { passive: true });
    start();
    return () => {
      disposed = true;
      window.removeEventListener("scroll", start);
      hero?.removeEventListener("load", afterPaint);
      hero?.removeEventListener("error", afterPaint);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
      observer?.disconnect();
      for (const image of pending) { image.onload = null; image.onerror = null; }
      pending.clear();
      queue.length = 0;
    };
  }, [pathname]);
  return null;
}
