import Script from "next/script";
import { renderLandingHtml } from "@/lib/landing";
import { companyGraph, serializeJsonLd } from "@/lib/seo";

export function LandingPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(companyGraph()) }} />
    <div dangerouslySetInnerHTML={{ __html: renderLandingHtml() }} />
    <Script src="/landing/init.js" type="module" strategy="afterInteractive" />
  </>;
}
