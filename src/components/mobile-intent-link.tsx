"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { assetPath } from "@/lib/site-path";
import { useSyncExternalStore, type ComponentProps } from "react";

const warmedUntil = new Map<string, number>();
function subscribe(callback: () => void) {
  const query = window.matchMedia("(min-width: 751px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const desktopSnapshot = () => window.matchMedia("(min-width: 751px)").matches;
const serverSnapshot = () => false;

/** Keep desktop auto-prefetch; avoid competing with the mobile page's first paint. */
export function MobileIntentLink({ href, prefetch, onPointerEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const desktop = useSyncExternalStore(subscribe, desktopSnapshot, serverSnapshot);
  const router = useRouter();
  function warm() {
    if (desktop || prefetch === false || typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return;
    const target = new URL(assetPath(href), window.location.href);
    if (target.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "") && target.search === window.location.search) return;
    if ((warmedUntil.get(href) || 0) > Date.now()) return;
    warmedUntil.set(href, Date.now() + 30_000);
    router.prefetch(href);
  }
  return <Link {...props} href={href} prefetch={desktop ? prefetch : false}
    onPointerEnter={(event) => { warm(); onPointerEnter?.(event); }}
    onFocus={(event) => { warm(); onFocus?.(event); }}
    onTouchStart={(event) => { warm(); onTouchStart?.(event); }} />;
}
