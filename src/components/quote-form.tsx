"use client";

import Link from "next/link";
import { productDisplayName } from "@/lib/product-display-name";
import { enquiryWhatsAppStorageKey, whatsappEnquiryLink } from "@/lib/whatsapp";
import { assetPath } from "@/lib/site-path";
import { renderSendingEnquiryTab } from "@/lib/sending-enquiry-tab";
import { useState } from "react";
import products from "@/data/product-index.json";
import { buildEnquiry, formResponseUrl, enquiryConsentText } from "@/lib/enquiry";
import { productCategories as categories } from "@/lib/product-categories";

export function QuoteForm({ productSlug, appearance = "classic" }: { productSlug?: string; appearance?: "classic" | "inquiry" }) {
  const inquiry = appearance === "inquiry";
  const [sending, setSending] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState("");
  const initial = products.find((product) => product.slug === productSlug);
  const [selected, setSelected] = useState<string[]>(productSlug ? [productSlug] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initial ? [initial.category] : []);
  const product = products.find((item) => item.slug === selected[0]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !consentAccepted) return;
    if (productSlug && (!selected.length || selectedCategories.some((category) => !products.some((item) => selected.includes(item.slug) && item.category === category)))) {
      setError("Please select at least one product in each chosen category.");
      return;
    }
    const data = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    let whatsappTab: Window | null = null;
    let submitted = false;
    try {
      const payload = { name: data.get("name"), email: data.get("email"), phone: data.get("phone"), message: data.get("message"), website: data.get("website"), contactConsent: data.get("confirm") === "on", products: selected, categories: selectedCategories, path: window.location.pathname };
      const whatsappUrl = whatsappEnquiryLink(String(payload.name || ""), products.filter((item) => selected.includes(item.slug)), selectedCategories);
      const enquiry = buildEnquiry(payload, window.location.origin);
      if ("error" in enquiry) {
        setError(enquiry.error);
        return;
      }
      // Reserve the tab during the click, before awaiting the submission request.
      // Opening a new tab only after fetch is commonly blocked by browsers.
      if (!payload.website) {
        try {
          whatsappTab = window.open("about:blank", "_blank");
          if (whatsappTab) {
            whatsappTab.opener = null;
            renderSendingEnquiryTab(whatsappTab);
          }
        } catch { /* The confirmation page also provides a WhatsApp link. */ }
      }
      if (process.env.NEXT_PUBLIC_ENQUIRY_DIRECT === "true") {
        // GitHub Pages has no server, so the browser posts to Google. Google hides its reply from
        // cross-site pages: this catches validation and network failures, not a closed form.
        if (!payload.website) await fetch(formResponseUrl, { method: "POST", mode: "no-cors", credentials: "omit", body: enquiry.fields, signal: AbortSignal.timeout(15_000) });
      } else {
        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          setError(result?.error ?? "We could not save your enquiry.");
          return;
        }
      }
      submitted = true;
      try { window.sessionStorage.setItem(enquiryWhatsAppStorageKey, whatsappUrl); } catch { /* Storage can be disabled; the confirmation still works. */ }
      try { if (whatsappTab && !whatsappTab.closed) whatsappTab.location.replace(whatsappUrl); } catch { /* Keep the manual confirmation-page link available. */ }
      window.location.assign(assetPath(process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "/thank-you/" : "/thank-you"));
    } catch {
      setError("We could not send your enquiry. Please check your connection.");
    } finally {
      if (!submitted) {
        try { whatsappTab?.close(); } catch { /* A user may already have closed the tab. */ }
        setSending(false);
      }
    }
  }
  const field = `mt-2 min-h-12 w-full border bg-white px-3 py-3 type-form-value outline-offset-4 ${inquiry ? "rounded-none border-[#b8b9ab] text-[#244536] placeholder:text-[#68726a] focus:border-[#244536]" : "rounded-none border-black/65 text-black"}`;
  return <form method="post" onSubmit={submit} className={`space-y-5 type-form-copy ${inquiry ? "text-[#244536]" : "text-black"}`}>
    <h2 className={inquiry ? "text-2xl leading-snug [font-family:var(--font-reference-heading)]" : "mb-7 type-form-title"}>{inquiry ? "Your enquiry" : "Contact us"}</h2>
    {inquiry && <p className="text-sm leading-6 text-[#526356]">Fields marked * are required.</p>}
    <noscript><p>Enable JavaScript to send your request, or <a href="tel:+919824177913" className="underline">call us directly</a>.</p></noscript>
    <div aria-hidden="true" className="absolute -left-[9999px]"><label>Leave this field empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className={inquiry ? "grid gap-5 min-[640px]:grid-cols-2" : "space-y-5"}>
    <label className="block">First name <span aria-hidden="true">*</span><input required name="name" autoComplete="given-name" placeholder="First name" maxLength={120} className={field} /></label>
    <label className="block">Email <span aria-hidden="true">*</span><input required type="email" name="email" autoComplete="email" placeholder="Email" maxLength={200} className={field} /></label>
    <label className={inquiry ? "block min-[640px]:col-span-2" : "block"}>Phone <span aria-hidden="true">*</span><input required type="tel" inputMode="tel" name="phone" autoComplete="tel" placeholder="Phone" maxLength={30} pattern="\+?[0-9 \(\)\-]{7,30}" title="Enter a valid phone number" className={field} /></label>
    </div>
    <fieldset><legend className="mb-2">Product categories {productSlug ? <span aria-hidden="true">*</span> : <span className="text-[#526356]">(optional)</span>}</legend>
      {!productSlug && <p className="mb-3 text-sm leading-6 text-[#526356]">If you have a design in mind, choose its category and select the products you are interested in. You can also send a general enquiry without selecting anything.</p>}
      <div className="flex flex-wrap gap-x-5 gap-y-2">{categories.map((item) => <label key={item.value} className={inquiry ? "flex min-h-12 cursor-pointer items-center gap-2 rounded-none border border-[#b8b9ab] bg-white px-3 has-checked:border-[#244536] has-checked:bg-[#e8ede5]" : "flex min-h-11 cursor-pointer items-center gap-2"}><input type="checkbox" name="category" value={item.value} checked={selectedCategories.includes(item.value)} disabled={Boolean(productSlug)} onChange={(event) => {
        const checked = event.target.checked;
        setSelectedCategories((current) => checked ? [...current, item.value] : current.filter((value) => value !== item.value));
        if (!checked) setSelected((current) => current.filter((slug) => products.find((product) => product.slug === slug)?.category !== item.value));
        setError("");
      }} className="size-4 shrink-0 accent-[#244536]" />{item.label}</label>)}</div>
    </fieldset>
    {productSlug ? <label className="block">Product name <span aria-hidden="true">*</span><input name="product" readOnly value={product ? productDisplayName(product.name) : ""} className={field} /></label> : <fieldset>
      <legend className="mb-2">Products <span className="text-[#526356]">(optional)</span></legend>
      <p aria-live="polite" className="mb-3 text-sm leading-6 text-[#526356]">{selectedCategories.length ? `${selected.length} product${selected.length === 1 ? "" : "s"} selected. Select as many as you need.` : "Select a category to see its products."}</p>
      {selectedCategories.length > 0 && <div className="max-h-80 space-y-5 overflow-y-auto overscroll-contain rounded-none border border-[#b8b9ab] bg-white p-4">{categories.filter((category) => selectedCategories.includes(category.value)).map((category) => <fieldset key={category.value}><legend className="mb-2 text-sm font-bold text-[#244536]">{category.label}</legend><div className="space-y-1">{products.filter((item) => item.category === category.value).map((item) => <label key={item.slug} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-6"><input type="checkbox" name="products" value={item.slug} checked={selected.includes(item.slug)} onChange={(event) => {
        const checked = event.target.checked;
        setSelected((current) => checked ? [...current, item.slug] : current.filter((slug) => slug !== item.slug));
        setError("");
      }} className="mt-1 size-4 shrink-0 accent-[#244536]" /><span>{productDisplayName(item.name)}</span></label>)}</div></fieldset>)}</div>}
    </fieldset>}
    {inquiry && <label className="block">Tell us about your space <span className="text-[#526356]">(optional)</span><textarea name="message" maxLength={1000} rows={4} placeholder="Preferred size, finish, quantity, or anything you would like us to know." className={`${field} resize-y leading-6`} /></label>}
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2"><input required type="checkbox" name="confirm" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} aria-describedby="quote-privacy-notice" className="mt-1 size-4 shrink-0 accent-[#244536]" /><span>{enquiryConsentText} <span aria-hidden="true">*</span></span></label>
      <p id="quote-privacy-notice" className="mt-1 text-xs leading-5 text-neutral-600">Read our <Link href="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>.</p>
    </div>
    {error && <p role="alert" className="text-sm leading-6 text-[#9a2c14]">{error} Please try again, or <a href="tel:+919824177913" className="underline">call us directly</a>.</p>}
    <button type="submit" disabled={sending || !consentAccepted} className={`min-h-12 w-full cursor-pointer border px-7 py-3 type-form-value text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 button-primary`}>{sending ? "Sending…" : inquiry ? "Submit enquiry" : "Submit request"}</button>
  </form>;
}
