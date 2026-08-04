import type { MetadataRoute } from "next";
import { SITE } from "@/lib/i18n";

/**
 * AI crawlers are named and allowed explicitly.
 *
 * A company that runs on agents blocking agents from reading it would be an
 * odd position to hold. They read the HTML, not /llms.txt, so this is the
 * file that actually decides.
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
          "Claude-Web",
          "anthropic-ai",
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
