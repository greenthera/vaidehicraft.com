import products from "@/data/product-index.json";
import { productCategories } from "@/lib/product-categories";
import { basePath } from "@/lib/site-path";

// Shared by the Vercel route and the GitHub Pages form, so both validate alike and write identical rows.
// These IDs come from the Google Form's public page and are not secrets.
export const formResponseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdbfNmV9uF-_Z6ATwDzFutH7uBRuX6BnEmTP2OMPstXvplz2A/formResponse";
export const enquiryConsentText = "I agree to Vaidehi Craft using my contact details for marketing and calls.";
const entries = {
  source: "entry.245284422",
  pageUrl: "entry.2120949635",
  name: "entry.367155242",
  email: "entry.776111767",
  phone: "entry.186914743",
  category: "entry.1668257143",
  product: "entry.198186147",
  message: "entry.305889692",
};

// Strips leading characters that a spreadsheet would run as a formula if opened in Excel.
function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/^[=+\-@\s]+/, "").slice(0, maxLength) : "";
}

export function buildEnquiry(body: Record<string, unknown>, origin: string): { fields: URLSearchParams } | { error: string } {
  const sourcePath = typeof body.path === "string" ? body.path : "";
  const path = (basePath && sourcePath.startsWith(`${basePath}/`) ? sourcePath.slice(basePath.length) : sourcePath).replace(/\/$/, "").replace(/^\/request-quote(?=\/|$)/, "/make-an-inquiry");
  const generalQuote = path === "/make-an-inquiry";
  // Keep accepting single-product requests from previously loaded pages.
  const slugs: unknown = body.products ?? (typeof body.product === "string" ? [body.product] : generalQuote ? [] : undefined);
  if (!Array.isArray(slugs) || (!generalQuote && !slugs.length) || slugs.length > products.length || slugs.some((slug) => typeof slug !== "string")) return { error: "Please select a design." };
  const selected = [...new Set(slugs as string[])].map((slug) => products.find((item) => item.slug === slug));
  if (selected.some((item) => !item)) return { error: "Please select valid designs." };
  const chosen = selected.filter((item): item is typeof products[number] => Boolean(item));
  const requestedCategories = body.categories ?? [...new Set(chosen.map((item) => item.category))];
  if (!Array.isArray(requestedCategories) || requestedCategories.length > productCategories.length || new Set(requestedCategories).size !== requestedCategories.length || requestedCategories.some((value) => !productCategories.some((category) => category.value === value))) return { error: "Please select valid categories." };
  if (chosen.some((item) => !requestedCategories.includes(item.category))) return { error: "Please select the matching category for each product." };
  const chosenCategories = productCategories.filter((category) => requestedCategories.includes(category.value));
  if (path !== "/make-an-inquiry" && (chosen.length !== 1 || path !== chosen[0].quotePath)) return { error: "This request could not be accepted." };
  if (!generalQuote && chosenCategories.length !== 1) return { error: "Please select the matching product category." };
  if (body.contactConsent !== true) return { error: "Please confirm your consent to marketing contact and calls." };

  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  const phoneDigits = phone.replace(/\D/g, "").length;
  if (!name) return { error: "Please enter your first name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (!/^\+?[\d\s()-]+$/.test(phone) || phoneDigits < 7 || phoneDigits > 15) return { error: "Please enter a valid phone number." };

  return { fields: new URLSearchParams({
    [entries.source]: generalQuote ? "Request a Quote Page" : "Product Quote Page",
    [entries.pageUrl]: `${origin}${sourcePath}`,
    [entries.name]: name,
    [entries.email]: email,
    [entries.phone]: phone,
    [entries.category]: chosenCategories.map((category) => category.label).join(", "),
    [entries.product]: chosen.map((product) => product.name).join("; "),
    // Record only the confirmation actually shown on this form.
    [entries.message]: [text(body.message, 1000), `Contact consent: ${enquiryConsentText} Recorded at ${new Date().toISOString()}.`].filter(Boolean).join("\n\n"),
  }) };
}
