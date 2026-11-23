"use client";

import { useRef, useState } from "react";
import { IoCalendarOutline, IoLocationOutline, IoShareSocialOutline } from "react-icons/io5";
import { assetPath } from "@/lib/site-path";

const venue = "146/B, Althan - Sarsana Rd, near Khajod Chowkdi, Sarsana, Surat, Gujarat 395007";
const buttonClass = "inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm uppercase transition-colors";

export function EventInviteActions() {
  const sharing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  async function shareEvent() {
    if (sharing.current) return;
    sharing.current = true;
    setBusy(true);
    setMessage("");
    setManualUrl("");
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "Vaidehi Craft at Infinity 4",
            text: "Join Vaidehi Craft at Infinity 4, 26–28 December 2026. Find us at stall F-06, Sarsana, Surat.",
            url,
          });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Event link copied");
      } catch {
        setManualUrl(url);
        setMessage("Select and copy the event link");
      }
    } finally {
      sharing.current = false;
      setBusy(false);
    }
  }

  return <div className="mb-9 sm:mb-12">
    <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`} target="_blank" rel="noopener noreferrer" aria-label="View event venue on Maps (opens in a new tab)" className={`button-primary ${buttonClass}`}>
        <IoLocationOutline aria-hidden="true" size={20} className="shrink-0" />View on Maps
      </a>
      <a href={assetPath("/events/infinity-4/vaidehi-craft-infinity-4.ics")} download="vaidehi-craft-infinity-4.ics" className={`button-primary ${buttonClass}`}>
        <IoCalendarOutline aria-hidden="true" size={20} className="shrink-0" />Add to Calendar
      </a>
      <button type="button" onClick={() => { void shareEvent(); }} disabled={busy} aria-busy={busy} className={`button-outline ${buttonClass} cursor-pointer disabled:cursor-wait`}>
        <IoShareSocialOutline aria-hidden="true" size={20} className="shrink-0" />Share Event
      </button>
    </div>
    <p role="status" aria-live="polite" className={message ? "mt-3 text-sm text-[#244536]" : "sr-only"}>{message}</p>
    {manualUrl && <label className="mt-3 block text-sm">Event link<input readOnly value={manualUrl} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full border border-[#244536]/30 bg-white p-3 text-sm text-[#244536]" /></label>}
  </div>;
}
