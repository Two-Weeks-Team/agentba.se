import type { Metadata, Viewport } from "next";
import { metadataFor } from "@/lib/seo";
import { LANDING_STYLES, landingStylesheetHref } from "@/lib/landing";

/**
 * There is no `app/layout.tsx`. Each locale group is its own root layout, so
 * `<html lang>` is correct without a middleware doing locale negotiation on
 * every request. The cost is that switching locale is a full page load, which
 * is the behaviour we want anyway.
 */
export const metadata: Metadata = metadataFor("en");

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  colorScheme: "light",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="describedby" href="/llms.txt" type="text/plain" />
        {LANDING_STYLES.map(file => <link key={file} rel="stylesheet" href={landingStylesheetHref(file)} />)}
        <link rel="preload" href="/landing/fonts/Newsreader-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/landing/media-proposal/social-badges/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
