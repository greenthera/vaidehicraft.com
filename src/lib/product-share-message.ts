/** Keep marketing calls to action out of product descriptions used for sharing. */
export function productShareMessage(description: string, url: string) {
  const summary = description
    .replace(/\s*(?:Request a quote\.|Ask about dimensions, finishes and a quote\.|View product photos and ask our team about dimensions, available options and a tailored quote\.)\s*$/i, "")
    .trim();
  return `${summary ? `${summary}\n\n` : ""}Checkout now: ${url}`;
}
