import type { MetadataRoute } from "next";
import { SITE } from "@/lib/i18n";

/**
 * AI crawlers are named and allowed explicitly.
 *
 * These access rules apply to HTML, Markdown and llms.txt alike. Allowing a
 * crawler does not establish that it visits the site or reviews applications.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Google-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
