/* eslint-disable @next/next/no-head-element -- Shared App Router root document, not a Pages Router component. */
import { LANDING_STYLES, landingStylesheetHref } from "@/lib/landing";
import type { Locale } from "@/lib/i18n";

/** Both locale roots share one presentation; only the language changes. */
export function LandingLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <html lang={locale}>
    <head>
      <link rel="describedby" href="/llms.txt" type="text/plain" />
      {LANDING_STYLES.map(file => <link key={file} rel="stylesheet" href={landingStylesheetHref(file)} />)}
      <link rel="preload" href="/landing/fonts/Newsreader-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      {locale === "ko" && <link rel="preload" href="/landing/fonts/NotoSerifKR-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
      <link rel="preload" href="/landing/media-proposal/social-badges/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </head>
    <body>{children}</body>
  </html>;
}
