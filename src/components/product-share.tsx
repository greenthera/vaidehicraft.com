"use client";

import { useRef, useState } from "react";
import { IoShareSocialOutline } from "react-icons/io5";

/** Opens the device's own share sheet directly from the user's click. */
export function ProductShare({ name, description }: { name: string; description: string }) {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  async function share() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage("");
    setManualUrl("");
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: `${name} | Vaidehi Craft`, text: description, url });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Product link copied");
      } catch {
        setManualUrl(url);
        setMessage("Select and copy the product link");
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return <div className="product-share absolute right-3 top-3 z-10 flex max-w-[calc(100%-24px)] flex-col items-end gap-2">
    <button type="button" onClick={() => { void share(); }} disabled={busy} aria-busy={busy} aria-label={`Share ${name}`} className="flex size-11 cursor-pointer items-center justify-center border border-[#244536]/20 bg-white text-[#244536] shadow-sm transition-colors hover:bg-[#ede7df] focus-visible:bg-[#ede7df] disabled:cursor-wait">
      <IoShareSocialOutline aria-hidden="true" size={21} />
    </button>
    <p role="status" aria-live="polite" aria-atomic="true" className={message ? "max-w-64 bg-white px-3 py-2 text-xs text-[#244536] shadow-sm" : "sr-only"}>{message}</p>
    {manualUrl && <label className="max-w-full bg-white p-3 text-xs text-[#244536]">Product link<input readOnly value={manualUrl} onFocus={(event) => event.currentTarget.select()} className="mt-2 block w-56 max-w-full border border-[#d3c5af] p-2 text-base focus:bg-[#ede7df]" /></label>}
  </div>;
}
