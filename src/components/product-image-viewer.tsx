"use client";

import Image from "@/components/site-image";
import { clampImageTransform, pinchTransform, type ImageTransform, type ZoomPoint } from "@/lib/image-zoom";
import { useLayoutEffect, useId, useRef, useState, type PointerEvent } from "react";
import { LuZoomIn, LuZoomOut } from "react-icons/lu";
import { IoChevronBackOutline, IoChevronForwardOutline, IoCloseOutline } from "react-icons/io5";

export function ProductImageViewer({ images, name, initialIndex, previewSrc, onClose }: { images: string[]; name: string; initialIndex: number; previewSrc: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const title = useId();
  const hint = useId();
  const [index, setIndex] = useState(initialIndex);
  const [readyImage, setReadyImage] = useState("");
  const [transform, setTransform] = useState<ImageTransform>({ scale: 1, x: 0, y: 0 });
  const currentTransform = useRef(transform);
  const zoomed = transform.scale > 1;
  const pointers = useRef(new Map<number, ZoomPoint>());
  const pinch = useRef<{ distance: number; scale: number; anchor: ZoomPoint } | null>(null);
  const pinched = useRef(false);
  const gesture = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const lastTap = useRef({ time: 0, x: 0, y: 0 });
  const pointerType = useRef("");
  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  function updateTransform(next: ImageTransform) {
    const area = canvas.current;
    const image = photo.current;
    const bounded = clampImageTransform(next, area?.clientWidth || 0, area?.clientHeight || 0, image?.naturalWidth || 0, image?.naturalHeight || 0);
    currentTransform.current = bounded;
    setTransform(bounded);
  }
  function toggleZoom() { updateTransform({ scale: currentTransform.current.scale > 1 ? 1 : 2.5, x: 0, y: 0 }); }
  function navigate(next: number) {
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
    updateTransform({ scale: 1, x: 0, y: 0 });
    pointers.current.clear(); pinch.current = null; gesture.current = null; pinched.current = false;
    lastTap.current.time = 0;
  }
  function pinchGeometry() {
    const points = [...pointers.current.values()];
    if (points.length !== 2 || !canvas.current) return null;
    const [a, b] = points;
    const bounds = canvas.current.getBoundingClientRect();
    return { distance: Math.hypot(b.x - a.x, b.y - a.y), midpoint: { x: (a.x + b.x) / 2 - bounds.left - bounds.width / 2, y: (a.y + b.y) / 2 - bounds.top - bounds.height / 2 } };
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || pointers.current.size >= 2) return;
    pointerType.current = event.pointerType;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    const view = currentTransform.current;
    if (pointers.current.size === 1) {
      pinched.current = false;
      gesture.current = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y, moved: false };
    } else {
      const geometry = pinchGeometry();
      if (!geometry) return;
      pinch.current = { distance: geometry.distance, scale: view.scale, anchor: { x: (geometry.midpoint.x - view.x) / view.scale, y: (geometry.midpoint.y - view.y) / view.scale } };
      pinched.current = true;
      lastTap.current.time = 0;
      gesture.current = null;
    }
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const startPinch = pinch.current;
    const geometry = pinchGeometry();
    if (startPinch && geometry) {
      updateTransform(pinchTransform(startPinch.distance, startPinch.scale, geometry.distance, geometry.midpoint, startPinch.anchor));
      return;
    }
    const start = gesture.current;
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) > 12) start.moved = true;
    if (currentTransform.current.scale > 1) updateTransform({ scale: currentTransform.current.scale, x: start.ox + dx, y: start.oy + dy });
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (pinched.current) {
      pinch.current = null;
      const remaining = [...pointers.current.values()][0];
      const view = currentTransform.current;
      gesture.current = remaining ? { ...remaining, ox: view.x, oy: view.y, moved: true } : null;
      if (!remaining) pinched.current = false;
      return;
    }
    const start = gesture.current;
    gesture.current = null;
    if (cancelled || !start) { lastTap.current.time = 0; return; }
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (currentTransform.current.scale === 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) { navigate(index + (dx < 0 ? 1 : -1)); return; }
    if (event.pointerType === "mouse" || start.moved || Math.hypot(dx, dy) > 12) return;
    const now = Date.now();
    const previous = lastTap.current;
    if (now - previous.time < 350 && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 30) { toggleZoom(); lastTap.current.time = 0; }
    else lastTap.current = { time: now, x: event.clientX, y: event.clientY };
  }
  const control = "button-outline flex size-11 shrink-0 items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default";
  return <dialog ref={dialog} onClose={() => { if (!dialog.current?.open) onClose(); }} aria-labelledby={title} aria-describedby={hint} onKeyDown={(event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); navigate(index + (event.key === "ArrowRight" ? 1 : -1)); }
    if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); updateTransform({ scale: event.key === "-" ? 1 : 2.5, x: 0, y: 0 }); }
  }} className="product-image-viewer fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[#f7f4ee] p-0 text-[#244536] backdrop:bg-black/70">
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d3c5af] bg-white px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <div className="min-w-0"><h2 id={title} className="truncate text-sm font-bold sm:text-lg">{name}</h2><p aria-live="polite" className="mt-1 text-xs text-[#526356]">{index + 1} / {images.length}</p></div>
        <div className="flex gap-2"><button type="button" onClick={toggleZoom} aria-label={zoomed ? "Zoom out" : "Zoom in"} aria-pressed={zoomed} className={control}>{zoomed ? <LuZoomOut aria-hidden="true" size={22} /> : <LuZoomIn aria-hidden="true" size={22} />}</button><button autoFocus type="button" onClick={() => dialog.current?.close()} aria-label="Close image viewer" className="button-primary flex size-11 shrink-0 items-center justify-center"><IoCloseOutline aria-hidden="true" size={24} /></button></div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div ref={canvas} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={(event) => pointerUp(event, true)} onLostPointerCapture={(event) => pointerUp(event, true)} onDoubleClick={() => { if (pointerType.current === "mouse") toggleZoom(); }} className={`absolute inset-0 touch-none overflow-hidden select-none ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}>
          {index === initialIndex && previewSrc && readyImage !== images[index] && <Image src={previewSrc} alt="" fill unoptimized loading="eager" className="pointer-events-none object-contain" />}
          <Image onLoad={(event) => { photo.current = event.currentTarget; setReadyImage(images[index]); }} key={images[index]} src={images[index]} alt={`${name}, enlarged photograph ${index + 1}`} fill loading="eager" sizes="100vw" draggable={false} className={`pointer-events-none object-contain transition-opacity duration-150 motion-reduce:transition-none ${readyImage === images[index] ? "opacity-100" : "opacity-0"}`} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }} />
        </div>
        {images.length > 1 && <><button type="button" aria-label="Previous product image" disabled={index === 0} onClick={() => navigate(index - 1)} className={`${control} absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow-sm`}><IoChevronBackOutline aria-hidden="true" size={22} /></button><button type="button" aria-label="Next product image" disabled={index === images.length - 1} onClick={() => navigate(index + 1)} className={`${control} absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow-sm`}><IoChevronForwardOutline aria-hidden="true" size={22} /></button></>}
      </div>
      <footer className="shrink-0 border-t border-[#d3c5af] bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"><p id={hint} className="text-center text-xs leading-5 text-[#526356]">Pinch with two fingers or double-tap to zoom in and out. On desktop, double-click to zoom. Drag to move when zoomed. Swipe or use arrows to change images.</p></footer>
    </div>
  </dialog>;
}
