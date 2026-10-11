import type { Metadata } from "next";
import company from "@/data/company.json";
import people from "@/data/people.json";
import { alternatesFor, getContent, pathFor, SITE, type Locale } from "@/lib/i18n";

export const OG_IMAGE_PATH = "/og/agentbase.png";
export const OG_SIZE = { width: 1200, height: 630 };
// Use path versions: Safari can keep the old ICO despite a new query string.
export const BROWSER_ICONS = [32, 64].map(size => ({
  url: `/icons/agentbase-mark-v2-${size}.png`,
  type: "image/png",
  sizes: `${size}x${size}`,
}));

/** Shared by both Next.js roots and the static redesign preview. */
export function metadataFor(locale: Locale): Metadata {
  const { meta } = getContent(locale);
  const image = { url: `${SITE}${OG_IMAGE_PATH}`, ...OG_SIZE, alt: meta.ogAlt, type: "image/png" };
  return {
    metadataBase: new URL(SITE),
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor(locale),
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }, ...BROWSER_ICONS],
      shortcut: BROWSER_ICONS[0]!.url,
      apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    },
    openGraph: {
      type: "website",
      siteName: company.name,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? "en_US" : "ko_KR",
      url: `${SITE}${pathFor(locale)}`,
      title: meta.ogTitle,
      description: meta.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.description,
      images: [{ url: image.url, alt: image.alt }],
    },
    robots: { index: true, follow: true, "max-image-preview": "large" },
  };
}

export function companyGraph() {
  return [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: company.name,
      legalName: company.legalName,
      url: SITE,
      logo: `${SITE}/logo-512.png`,
      description: company.identity,
      email: company.email,
      // Country-level location only: formation in Wyoming does not establish
      // a street address or city-level operating headquarters.
      location: { "@type": "Country", name: company.country, identifier: company.countryCode },
      founder: people.people.map((p) => ({
        "@type": "Person",
        "@id": `${SITE}/#${p.id}`,
        name: p.name,
        jobTitle: `Co-founder · ${p.role}`,
        url: p.linkedin,
        sameAs: [p.linkedin],
      })),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Business inquiries",
        email: company.email,
      },
      knowsAbout: ["AI agent fleets", "agent orchestration", "business operations automation"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#site`,
      url: SITE,
      name: company.name,
      publisher: { "@id": `${SITE}/#org` },
      inLanguage: ["en", "ko"],
    },
  ];
}

/** Prevent a future editable value from closing the JSON-LD script element. */
export function serializeJsonLd(graph: unknown[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
