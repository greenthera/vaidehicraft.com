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
    let playPending = false;
    let retryFrame: number | undefined;
    // Set DOM properties as well as attributes before requesting playback.
    element.muted = true;
    element.defaultMuted = true;
    element.playsInline = true;
    const play = () => {
      if (disposed || !loaded || playPending || document.visibilityState === "hidden" || !element.paused) return;
      playPending = true;
      void element.play().catch(() => { /* Readiness and interaction events retry blocked autoplay. */ }).finally(() => { playPending = false; });
    };
    const retry = () => {
      if (disposed || !loaded || document.visibilityState === "hidden") return;
      if (retryFrame !== undefined) window.cancelAnimationFrame(retryFrame);
      retryFrame = window.requestAnimationFrame(() => { retryFrame = undefined; play(); });
    };
    const load = () => {
      if (!loaded) {
        loaded = true;
        element.src = assetPath(src);
        element.load();
      }
      play();
    };
    let recovered = false;
    let lastTime = element.currentTime;
    let lastProgress = Date.now();
    const recover = () => {
      if (disposed || !loaded || recovered || document.visibilityState === "hidden") return;
      recovered = true;
      playPending = false;
      element.load();
      play();
    };
    // Recover a decoder stuck on a frame, without restarting a slow download.
    const watchdog = deferOnMobile ? undefined : window.setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === "hidden" || element.paused || element.seeking || element.readyState < 2 || element.currentTime !== lastTime) {
        lastTime = element.currentTime;
        lastProgress = now;
      } else if (now - lastProgress >= 9000) recover();
    }, 3000);
    element.addEventListener("error", recover);
    element.addEventListener("loadedmetadata", retry);
    element.addEventListener("loadeddata", play);
    element.addEventListener("canplay", play);
    element.addEventListener("canplaythrough", retry);
    element.addEventListener("pause", retry);
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
      // A reused route can mount before the browser selects the new video source.
      if (!deferOnMobile && element.networkState === HTMLMediaElement.NETWORK_EMPTY) element.load();
      load();
    }
    const onResize = () => { if (!mobile.matches) { load(); observer?.disconnect(); } };
    mobile.addEventListener("change", onResize);
    return () => {
      disposed = true;
      if (watchdog !== undefined) window.clearInterval(watchdog);
      if (retryFrame !== undefined) window.cancelAnimationFrame(retryFrame);
      observer?.disconnect();
      mobile.removeEventListener("change", onResize);
      element.removeEventListener("loadedmetadata", retry);
      element.removeEventListener("loadeddata", play);
      element.removeEventListener("canplay", play);
      element.removeEventListener("canplaythrough", retry);
      element.removeEventListener("pause", retry);
      element.removeEventListener("error", recover);
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
