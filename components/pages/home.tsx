import { Hero } from "@/components/hero/hero";
import { Header } from "@/components/nav/header";
import { Footer } from "@/components/nav/footer";
import { Company } from "@/components/sections/company";
import { Economics } from "@/components/sections/economics";
import { Fleet } from "@/components/sections/fleet";
import { Geo } from "@/components/sections/geo";
import { Ledger } from "@/components/sections/ledger";
import { Pilot } from "@/components/sections/pilot";
import { Workflow } from "@/components/sections/workflow";
import { JsonLd } from "@/components/jsonld";
import type { Locale } from "@/lib/i18n";

/** One page, seven sections, both locales. */
export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd locale={locale} />
      <Header locale={locale} />
      <Hero locale={locale} />
      <main className="wrap">
        <Fleet locale={locale} />
        <Ledger locale={locale} />
        <Workflow locale={locale} />
        <Pilot locale={locale} />
        <Economics locale={locale} />
        <Company locale={locale} />
        <Geo locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
