import fleet from "@/data/fleet.json";
import { SITE, getContent, type Locale } from "@/lib/i18n";
import { companyGraph, serializeJsonLd } from "@/lib/seo";

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

  const [organization, website] = companyGraph();
  const graph = [
    // The historical team competition record includes work before the LLC.
    // It must not be attributed to the legal entity as Organization.award.
    organization,
    website,
    {
      "@type": "ItemList",
      "@id": `${SITE}/#fleet`,
      name: `AgentBase — ${t.fleet.eyebrow} (${fleet.capturedAt})`,
      description: fleet.scope,
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
        __html: serializeJsonLd(graph),
      }}
    />
  );
}
