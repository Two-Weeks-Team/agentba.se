import Script from "next/script";
import { renderLandingHtml } from "@/lib/landing";
import { companyGraph, serializeJsonLd } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

export function LandingPage({ locale = "en" }: { locale?: Locale }) {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(companyGraph()) }} />
    <div dangerouslySetInnerHTML={{ __html: renderLandingHtml(locale) }} />
    <Script src="/landing/init.js" type="module" strategy="afterInteractive" />
  </>;
}
