import { productDisplayName } from "@/lib/product-display-name";

const businessPhone = "+919824177913";

export function whatsappLink(phone: string, message = "Hi, I would like to know more about Vaidehi Craft.") {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
export const whatsappUrl = whatsappLink(businessPhone);

export function whatsappEnquiryLink(name: string, products: readonly { name: string; category: string }[]) {
  const categories: Record<string, string> = { chairs: "Chair", sofas: "Sofa", tables: "Table", swings: "Swing" };
  const items = products.map((product) => `${categories[product.category] || product.category} - ${productDisplayName(product.name)}`);
  const greeting = `Hi, I am ${name.trim()}.`;
  const message = items.length === 1
    ? `${greeting} I would like to know more about ${items[0]}.`
    : `${greeting} I would like to know more about the following furniture:\n${items.map((item) => `- ${item}`).join("\n")}`;
  return whatsappLink(businessPhone, message);
}
