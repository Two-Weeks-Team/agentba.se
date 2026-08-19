import competitions from "@/data/competitions.json";
import fleet from "@/data/fleet.json";
import people from "@/data/people.json";
import products from "@/data/products.json";
import { SITE, getContent, type Locale } from "@/lib/i18n";

/**
 * Agents are marked up as SoftwareApplication, never as Person.
 *
 * They are software. Marking them as people would encode, in structured data,
 * exactly the confusion this site exists to clear up — and search engines
 * treat fabricated Person entities as a spam signal. The only Person entries
 * here are the two actual people.
 */
export function JsonLd({ locale }: { locale: Locale }) {
  const t = getContent(locale);

  const graph = [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "AgentBase",
      url: SITE,
      // Google wants a stable raster here, and Next serves app/icon.svg from a
      // hashed path — so this points at the copy in public/.
      logo: `${SITE}/logo-512.png`,
      description: t.meta.description,
      foundingLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: "Seoul", addressCountry: "KR" },
      },
      founder: people.people.map((p) => ({
        "@type": "Person",
        name: p.name,
        jobTitle: p.role,
        email: p.email,
      })),
      sameAs: products.products.map((p) => p.url),
      // Read off the same record the page publishes, so structured data cannot
      // claim a result the table does not. Only placed rows appear, and
      // data-integrity holds each of those to a public winners link.
      award: competitions.entries
        .filter((e) => e.result === "won" || e.result === "hm")
        .map(
          (e) =>
            `${t.record.results[e.result as keyof typeof t.record.results]} — ${e.event} (${e.organizer}, ${e.date.slice(0, 4)})`,
        ),
      knowsAbout: ["autonomous agents", "agent orchestration", "operations automation"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#site`,
      url: SITE,
      name: "AgentBase",
      publisher: { "@id": `${SITE}/#org` },
      inLanguage: locale === "ko" ? "ko-KR" : "en",
    },
    {
      "@type": "ItemList",
      "@id": `${SITE}/#fleet`,
      name: "AgentBase agent fleet",
      numberOfItems: fleet.counts.total,
      itemListElement: fleet.agents.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: a.id,
          description: a.role,
          applicationCategory: "BusinessApplication",
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Server-rendered constant; no user input reaches this string.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
