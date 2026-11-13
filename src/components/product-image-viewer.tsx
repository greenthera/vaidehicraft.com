"use client";

import Image from "@/components/site-image";
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
  const [zoomed, setZoomed] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const gesture = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const lastTap = useRef({ time: 0, x: 0, y: 0 });
  const pointerType = useRef("");
  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  function toggleZoom() { setZoomed((value) => !value); setOffset({ x: 0, y: 0 }); }
  function navigate(next: number) {
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
    setZoomed(false); setOffset({ x: 0, y: 0 }); lastTap.current.time = 0;
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    pointerType.current = event.pointerType;
    gesture.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || !zoomed || !canvas.current || !photo.current) return;
    const { clientWidth: w, clientHeight: h } = canvas.current;
    const scale = Math.min(w / photo.current.naturalWidth, h / photo.current.naturalHeight);
    const bx = Math.max(0, (photo.current.naturalWidth * scale * 2.5 - w) / 2);
    const by = Math.max(0, (photo.current.naturalHeight * scale * 2.5 - h) / 2);
    setOffset({ x: Math.max(-bx, Math.min(bx, start.ox + event.clientX - start.x)), y: Math.max(-by, Math.min(by, start.oy + event.clientY - start.y)) });
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (!zoomed && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) { navigate(index + (dx < 0 ? 1 : -1)); return; }
    if (event.pointerType === "mouse" || Math.hypot(dx, dy) > 12) return;
    const now = Date.now();
    const previous = lastTap.current;
    if (now - previous.time < 350 && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 30) { toggleZoom(); lastTap.current.time = 0; }
    else lastTap.current = { time: now, x: event.clientX, y: event.clientY };
  }
  const control = "button-outline flex size-11 shrink-0 items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default";
  return <dialog ref={dialog} onClose={() => { if (!dialog.current?.open) onClose(); }} aria-labelledby={title} aria-describedby={hint} onKeyDown={(event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); navigate(index + (event.key === "ArrowRight" ? 1 : -1)); }
    if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); setZoomed(event.key !== "-"); setOffset({ x: 0, y: 0 }); }
  }} className="product-image-viewer fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[#f7f4ee] p-0 text-[#244536] backdrop:bg-black/70">
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d3c5af] bg-white px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <div className="min-w-0"><h2 id={title} className="truncate text-sm font-bold sm:text-lg">{name}</h2><p aria-live="polite" className="mt-1 text-xs text-[#526356]">{index + 1} / {images.length}</p></div>
        <div className="flex gap-2"><button type="button" onClick={toggleZoom} aria-label={zoomed ? "Zoom out" : "Zoom in"} aria-pressed={zoomed} className={control}>{zoomed ? <LuZoomOut aria-hidden="true" size={22} /> : <LuZoomIn aria-hidden="true" size={22} />}</button><button autoFocus type="button" onClick={() => dialog.current?.close()} aria-label="Close image viewer" className="button-primary flex size-11 shrink-0 items-center justify-center"><IoCloseOutline aria-hidden="true" size={24} /></button></div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div ref={canvas} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { gesture.current = null; }} onDoubleClick={() => { if (pointerType.current === "mouse") toggleZoom(); }} className={`absolute inset-0 touch-none overflow-hidden select-none ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}>
          {index === initialIndex && previewSrc && readyImage !== images[index] && <Image src={previewSrc} alt="" fill unoptimized loading="eager" className="pointer-events-none object-contain" />}
          <Image onLoad={(event) => { photo.current = event.currentTarget; setReadyImage(images[index]); }} key={images[index]} src={images[index]} alt={`${name}, enlarged photograph ${index + 1}`} fill loading="eager" sizes="100vw" draggable={false} className={`pointer-events-none object-contain transition-opacity duration-150 motion-reduce:transition-none ${readyImage === images[index] ? "opacity-100" : "opacity-0"}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomed ? 2.5 : 1})` }} />
        </div>
        {images.length > 1 && <><button type="button" aria-label="Previous product image" disabled={index === 0} onClick={() => navigate(index - 1)} className={`${control} absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow-sm`}><IoChevronBackOutline aria-hidden="true" size={22} /></button><button type="button" aria-label="Next product image" disabled={index === images.length - 1} onClick={() => navigate(index + 1)} className={`${control} absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow-sm`}><IoChevronForwardOutline aria-hidden="true" size={22} /></button></>}
      </div>
      <footer className="shrink-0 border-t border-[#d3c5af] bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"><p id={hint} className="text-center text-xs leading-5 text-[#526356]">Double-click or double-tap to zoom in and out. Drag to move when zoomed. Swipe or use arrows to change images.</p></footer>
    </div>
  </dialog>;
}
