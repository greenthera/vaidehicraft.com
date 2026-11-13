"use client";

import { assetPath } from "@/lib/site-path";
import { useEffect, useRef } from "react";

export function StoreVideo({ src = "/media/canearth15-store-tour.mp4", poster = "/images/canearth15-store-video-poster.webp", deferOnMobile = false, label = "A tour of the Canearth15 pop-up store" }: { src?: string; poster?: string; label?: string; deferOnMobile?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let disposed = false;
    let loaded = !deferOnMobile;
    // Set DOM properties as well as attributes before requesting playback.
    element.muted = true;
    element.defaultMuted = true;
    element.playsInline = true;
    const play = () => {
      if (disposed || !loaded || document.visibilityState === "hidden" || !element.paused) return;
      void element.play().catch(() => { /* Retry when ready, visible, or after user interaction. */ });
    };
    const load = () => {
      if (!loaded) {
        loaded = true;
        element.src = assetPath(src);
        element.load();
      }
      play();
    };
    element.addEventListener("loadeddata", play);
    element.addEventListener("canplay", play);
    window.addEventListener("pageshow", play);
    document.addEventListener("visibilitychange", play);
    document.addEventListener("pointerdown", play, { passive: true });
    document.addEventListener("keydown", play);

    const mobile = window.matchMedia("(max-width: 750px)");
    let observer: IntersectionObserver | undefined;
    if (deferOnMobile && mobile.matches && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { load(); observer?.disconnect(); }
      }, { rootMargin: "300px 0px" });
      observer.observe(element);
    } else {
      load();
    }
    const onResize = () => { if (!mobile.matches) { load(); observer?.disconnect(); } };
    mobile.addEventListener("change", onResize);
    return () => {
      disposed = true;
      observer?.disconnect();
      mobile.removeEventListener("change", onResize);
      element.removeEventListener("loadeddata", play);
      element.removeEventListener("canplay", play);
      window.removeEventListener("pageshow", play);
      document.removeEventListener("visibilitychange", play);
      document.removeEventListener("pointerdown", play);
      document.removeEventListener("keydown", play);
    };
  }, [deferOnMobile, src]);
  return (
    <div className="relative h-full min-w-0 [min-height:inherit] bg-[#dcc7b3]">
      <video key={src} ref={video} src={deferOnMobile ? undefined : assetPath(src)} autoPlay muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback preload={deferOnMobile ? "none" : "auto"} poster={assetPath(poster)} aria-label={label} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}
