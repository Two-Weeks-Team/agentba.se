import type { MetadataRoute } from "next";
import company from "@/data/company.json";
import { SITE } from "@/lib/i18n";
import { NEWEST_SNAPSHOT } from "@/lib/snapshot";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date([company.contentUpdatedAt, NEWEST_SNAPSHOT].sort().at(-1)!);
  const languages = { en: `${SITE}/`, ko: `${SITE}/ko`, "x-default": `${SITE}/` };

  return [
    { url: `${SITE}/`, lastModified, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${SITE}/ko`, lastModified, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
