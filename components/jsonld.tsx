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
      sameAs: ["https://github.com/Two-Weeks-Team", ...products.products.map((p) => p.url)],
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
