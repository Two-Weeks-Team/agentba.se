import type { MetadataRoute } from "next";
import fleet from "@/data/fleet.json";
import { SITE } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(fleet.capturedAt);
  const languages = { en: `${SITE}/`, ko: `${SITE}/ko` };

  return [
    { url: `${SITE}/`, lastModified, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${SITE}/ko`, lastModified, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
