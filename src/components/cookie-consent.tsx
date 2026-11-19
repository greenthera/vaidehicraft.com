"use client";

import { useEffect } from "react";
import { initCookieConsent, showCookiePreferences } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  useEffect(() => { void initCookieConsent(); }, []);
  return <div id="cookie-consent-root" />;
}

export function CookieSettings({ className = "inline-flex min-h-11 cursor-pointer items-center text-xs normal-case sm:text-sm hover:text-[#244536]" }: { className?: string }) {
  return <button type="button" onClick={() => { void showCookiePreferences(); }} className={className}>Cookie settings</button>;
}
