import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { alternatesFor, SITE, getContent } from "@/lib/i18n";
import "../globals.css";

/**
 * There is no `app/layout.tsx`. Each locale group is its own root layout, so
 * `<html lang>` is correct without a middleware doing locale negotiation on
 * every request. The cost is that switching locale is a full page load, which
 * is the behaviour we want anyway.
 */
const t = getContent("en");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor("en"),
  openGraph: {
    type: "website",
    siteName: "AgentBase",
    locale: "en_US",
    url: `${SITE}/`,
    title: t.meta.title,
    description: t.meta.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0c",
  colorScheme: "dark",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
