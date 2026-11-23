"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setCookieConsentBannerSuppressed, showCookiePreferences } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const pathname = usePathname();
  const invitePage = pathname.replace(/\/+$/, "") === "/events/infinity-4/invite";
  useEffect(() => { void setCookieConsentBannerSuppressed(invitePage); }, [invitePage]);
  return <div id="cookie-consent-root" />;
}

export function CookieSettings({ className = "inline-flex min-h-11 cursor-pointer items-center text-xs normal-case sm:text-sm hover:text-[#244536]" }: { className?: string }) {
  return <button type="button" onClick={() => { void showCookiePreferences(); }} className={className}>Cookie settings</button>;
}
