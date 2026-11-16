import { productDisplayName } from "@/lib/product-display-name";

const businessPhone = "+919824177913";

export function whatsappLink(phone: string, message = "Hi, I would like to know more about Vaidehi Craft.") {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
export const whatsappUrl = whatsappLink(businessPhone);
export const enquiryWhatsAppStorageKey = "vaidehi-craft:enquiry-whatsapp";

export function whatsappEnquiryLink(name: string, products: readonly { name: string; category: string }[], selectedCategories: readonly string[] = []) {
  const categories: Record<string, string> = { chairs: "Chairs", sofas: "Sofas", tables: "Tables", swings: "Swings" };
  const groups = new Map<string, string[]>();
  for (const product of products) {
    const items = groups.get(product.category) || [];
    items.push(productDisplayName(product.name));
    groups.set(product.category, items);
  }
  const sections = [...groups].map(([category, items]) => `*${categories[category] || category}*\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}`);
  const greeting = `Hi, I am ${name.trim()}.`;
  if (!products.length) {
    const interests = selectedCategories.map((category) => categories[category] || category).join(", ");
    return whatsappLink(businessPhone, `${greeting} I would like to know more about ${interests || "Vaidehi Craft"}.`);
  }
  const message = products.length === 1
    ? `${greeting} I would like to know more about ${productDisplayName(products[0].name)}.`
    : `${greeting}\n\nI would like to know more about:\n\n${sections.join("\n\n")}`;
  return whatsappLink(businessPhone, message);
}
