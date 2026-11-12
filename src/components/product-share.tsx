"use client";

import Image from "@/components/site-image";
import { useId, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { IoChatbubbleEllipsesOutline, IoCloseOutline, IoEllipsisHorizontal, IoLinkOutline, IoMailOutline, IoShareSocialOutline } from "react-icons/io5";

/** Shares the current deployment URL, including a GitHub Pages base path. */
export function ProductShare({ name, image, description }: { name: string; image: string; description: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [smsSeparator, setSmsSeparator] = useState("?");

  function open() {
    setUrl(`${window.location.origin}${window.location.pathname}`);
    setMessage("");
    setSmsSeparator(/iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?");
    setNativeAvailable(typeof navigator.share === "function");
    dialog.current?.showModal();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Product link copied");
    } catch {
      setMessage("Select and copy the product link below");
      const input = dialog.current?.querySelector("input");
      input?.focus();
      input?.select();
    }
  }

  async function share() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage("");
    try {
      await navigator.share({ title: `${name} | Vaidehi Craft`, text: description, url });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setMessage("Sharing is unavailable. Choose WhatsApp or copy the link instead.");
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const optionClass = "flex min-w-0 flex-col items-center gap-2.5 text-[11px] leading-4 text-[#244536] sm:text-xs";
  const iconClass = "flex size-12 items-center justify-center border border-[#d3c5af] bg-[#f7f4ee] transition-colors hover:bg-[#ede7df]";
  return <div className="absolute right-3 top-3 z-10">
    <button ref={trigger} type="button" onClick={open} aria-label={`Share ${name}`} aria-haspopup="dialog" className="flex size-11 cursor-pointer items-center justify-center border border-[#244536]/20 bg-white text-[#244536] shadow-sm transition-colors hover:bg-[#ede7df]">
      <IoShareSocialOutline aria-hidden="true" size={21} />
    </button>
    <dialog ref={dialog} aria-labelledby={headingId} onClose={() => trigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-none overflow-y-auto border-0 bg-transparent p-0 text-[#14212a] backdrop:bg-black/60 min-[751px]:inset-0 min-[751px]:m-auto min-[751px]:w-[440px] min-[751px]:max-w-[calc(100vw-48px)]">
      <div className="bg-white pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center justify-between gap-3 px-4">
          <h2 id={headingId} className="text-lg font-bold leading-snug">Share product</h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close sharing options" className="button-primary flex size-11 shrink-0 cursor-pointer items-center justify-center"><IoCloseOutline aria-hidden="true" size={24} /></button>
        </div>
        <figure className="mx-4 mb-5 mt-4 flex items-center gap-4 overflow-hidden border border-[#e5dfd5] bg-[#f7f4ee] p-3">
          <div className="relative h-28 w-24 shrink-0 bg-[#ede7df]"><Image src={image} alt={name} fill sizes="96px" className="object-contain" /></div>
          <figcaption className="min-w-0 py-2 text-sm font-bold leading-6 text-[#244536]">{name}<span className="mt-1 block text-xs font-normal text-[#526356]">Vaidehi Craft</span><span className="mt-2 block text-xs font-normal leading-5 text-[#526356]">{description}</span></figcaption>
        </figure>
        <div className={`grid gap-1 border-t border-[#e4e4e4] px-3 pt-4 ${nativeAvailable ? "grid-cols-5" : "grid-cols-4"}`}>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${name} — Vaidehi Craft\n${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${name} on WhatsApp (opens in a new tab)`} className={optionClass}><span className="flex size-12 items-center justify-center border border-[#25d366] bg-[#25d366] text-white"><FaWhatsapp aria-hidden="true" size={29} /></span>WhatsApp</a>
          <a href={`sms:${smsSeparator}body=${encodeURIComponent(`${name} — Vaidehi Craft\n${description}\n${url}`)}`} className={optionClass}><span className="flex size-12 items-center justify-center border border-[#25d366] bg-[#25d366] text-white"><IoChatbubbleEllipsesOutline aria-hidden="true" size={27} /></span>Messages</a>
          <button type="button" onClick={() => { void copyLink(); }} className={`${optionClass} normal-case`}><span className={iconClass}><IoLinkOutline aria-hidden="true" size={29} /></span>Copy</button>
          <a href={`mailto:?subject=${encodeURIComponent(`${name} | Vaidehi Craft`)}&body=${encodeURIComponent(`${name} — Vaidehi Craft\n${description}\n${url}`)}`} className={optionClass}><span className={iconClass}><IoMailOutline aria-hidden="true" size={29} /></span>Email</a>
          {nativeAvailable && <button type="button" onClick={() => { void share(); }} disabled={busy} aria-busy={busy} className={`${optionClass} normal-case disabled:opacity-60`}><span className={iconClass}><IoEllipsisHorizontal aria-hidden="true" size={29} /></span>More</button>}
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className={message ? "px-4 pt-3 text-xs text-[#244536]" : "sr-only"}>{message}</p>
        <label className="sr-only focus-within:not-sr-only focus-within:mx-4 focus-within:mt-3 focus-within:block focus-within:text-xs">Product link<input readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full min-w-0 border border-[#d3c5af] bg-white p-3 text-base text-[#526356]" /></label>
      </div>
    </dialog>
  </div>;
}
