import { readFileSync } from "node:fs";
import { join } from "node:path";
import company from "@/data/company.json";
import people from "@/data/people.json";
import products from "@/data/products.json";
import { SITE } from "@/lib/i18n";

export const LANDING_STYLES = [
  "organization-scene.css", "c.css", "media-page.css", "social-work.css",
  "commerce-work.css", "memory-work.css", "foundation-work.css",
];

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Trusted, committed HTML, shared by the production page and design preview.
 * This is never user-supplied HTML. The demos progressively enhance its text.
 */
export function renderLandingHtml() {
  let html = readFileSync(join(process.cwd(), "content/en/landing.html"), "utf8");
  function fact(attribute: string, value: string) {
    const pattern = new RegExp(`(<p\\b[^>]*${attribute}[^>]*>)[\\s\\S]*?(</p>)`);
    if (!pattern.test(html)) throw new Error(`Missing landing-page fact: ${attribute}`);
    html = html.replace(pattern, (_, open: string, close: string) => `${open}${escape(value)}${close}`);
  }
  fact("data-company-identity", company.identity);
  fact("data-company-business", company.business);
  fact("data-team-work-scope", company.teamWorkScope);
  for (const id of products.featured) {
    const product = products.products.find(p => p.id === id);
    if (!product) throw new Error(`Missing featured product: ${id}`);
    fact(`data-product-scope="${id}"`, product.scope);
    if (product.relationship) fact(`data-product-relationship="${id}"`, product.relationship);
  }
  const founders = /(<ul\b[^>]*data-founders[^>]*>)[\s\S]*?(<\/ul>)/;
  if (!founders.test(html)) throw new Error("Missing landing-page founders");
  html = html.replace(founders, (_, open: string, close: string) => `${open}${people.people.map(p =>
    `<li><a href="${escape(p.linkedin)}" target="_blank" rel="noopener noreferrer">${escape(p.name)} <span aria-hidden="true">↗</span></a><span>Co-founder · ${escape(p.role)}</span></li>`
  ).join("\n")}${close}`);
  return html;
}

/** Preserve the actual page narrative in the AI mirror, including scopes. */
export function renderLandingMarkdown() {
  const readable = renderLandingHtml().match(/<main\b[\s\S]*?<\/footer>/)?.[0];
  if (!readable) throw new Error("Landing page has no main-to-footer narrative");
  const text = (value: string) => value
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href: string, label: string) =>
      `[${label.replace(/<[^>]*>/g, "")}](${new URL(href, SITE).href})`)
    .replace(/<br\s*\/?>|<\/span>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
  return [...readable.matchAll(/<(h[1-3]|p)\b[^>]*>([\s\S]*?)<\/\1>/g)].map(([, tag, inner]) =>
    `${tag!.startsWith("h") ? "#".repeat(Number(tag![1])) + " " : ""}${text(inner!)}`
  ).join("\n\n");
}
