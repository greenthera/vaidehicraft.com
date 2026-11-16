import { assetPath } from "@/lib/site-path";

/** Style the reserved tab immediately, without another page request or React root. */
export function renderSendingEnquiryTab(tab: Window) {
  const doc = tab.document;
  const element = <T extends keyof HTMLElementTagNameMap>(tag: T, className = "", text?: string) => {
    const node = doc.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const resource = (path: string) => new URL(assetPath(path), window.location.origin).href;

  doc.documentElement.lang = "en";
  doc.documentElement.className = document.documentElement.className;
  doc.title = "Sending your enquiry | Vaidehi Craft";
  const viewport = element("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  doc.head.append(viewport);

  // Reuse the site's cached Tailwind styles and local fonts in the blank tab.
  for (const stylesheet of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
    const copy = stylesheet.cloneNode(true) as HTMLLinkElement;
    copy.href = stylesheet.href;
    doc.head.append(copy);
  }
  for (const style of document.querySelectorAll("style")) doc.head.append(style.cloneNode(true));
  doc.body.className = "m-0";

  const main = element("main", "flex min-h-dvh items-center justify-center bg-[#f7f4ee] p-4 text-[#244536] sm:p-8");
  const panel = element("section", "w-full max-w-lg border border-[#d3c5af] bg-white px-6 py-9 text-center shadow-[0_16px_60px_-30px_#24453640] sm:px-10 sm:py-12");
  panel.setAttribute("aria-labelledby", "sending-title");
  const logo = element("img", "mx-auto h-auto w-48 sm:w-56");
  logo.src = resource("/images/vaidehi-craft-green-logo.avif");
  logo.alt = "Vaidehi Craft";
  panel.append(logo, element("div", "my-7 h-px bg-[#ded5c8]"));

  const icon = element("div", "mx-auto mb-5 flex size-16 items-center justify-center bg-[#244536]");
  const whatsapp = element("img", "size-9");
  whatsapp.src = resource("/images/social/whatsapp.svg");
  whatsapp.alt = "WhatsApp";
  whatsapp.width = 36;
  whatsapp.height = 36;
  icon.append(whatsapp);
  const heading = element("h1", "text-2xl font-bold leading-tight sm:text-3xl", "Sending your enquiry");
  heading.id = "sending-title";
  panel.append(icon, element("p", "mb-3 text-[10px] uppercase tracking-[0.18em] text-[#a55330]", "A conversation with Vaidehi Craft"), heading);
  panel.append(element("p", "mt-4 text-sm leading-7 text-[#526356]", "We’re sending your enquiry to our team. WhatsApp will open here with your message ready once it finishes."));

  const progress = element("progress", "mt-7 h-1 w-full accent-[#244536]");
  progress.setAttribute("aria-label", "Sending your enquiry");
  panel.append(progress, element("p", "mt-3 text-xs leading-6 text-[#617066]", "Please keep this tab open. Your website tab will show a confirmation after submission."));
  panel.append(element("p", "mt-7 border-t border-[#ded5c8] pt-5 text-xs leading-6 text-[#617066]", "You choose when to send the prepared message on WhatsApp."));
  main.append(panel);
  doc.body.replaceChildren(main);
}
