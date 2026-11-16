"use client";

import { useEffect, useRef } from "react";
import { enquiryWhatsAppStorageKey, whatsappUrl } from "@/lib/whatsapp";

export function EnquiryWhatsAppLink() {
  const link = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(enquiryWhatsAppStorageKey);
      window.sessionStorage.removeItem(enquiryWhatsAppStorageKey);
      if (!saved) return;
      const destination = new URL(saved);
      const expected = new URL(whatsappUrl);
      if (link.current && destination.origin === expected.origin && destination.pathname === expected.pathname) link.current.href = destination.href;
    } catch { /* Use the general greeting if browser storage is unavailable. */ }
  }, []);

  return <a ref={link} href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center button-primary px-6 py-3 text-sm">Continue on WhatsApp</a>;
}
