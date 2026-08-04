import { Hero } from "@/components/hero/hero";
import { Header } from "@/components/nav/header";
import { Footer } from "@/components/nav/footer";
import { Partners } from "@/components/nav/partners";
import { Company } from "@/components/sections/company";
import { Economics } from "@/components/sections/economics";
import { Fleet } from "@/components/sections/fleet";
import { Geo } from "@/components/sections/geo";
import { Ledger } from "@/components/sections/ledger";
import { Products } from "@/components/sections/products";
import { Staffing } from "@/components/sections/staffing";
import { Workflow } from "@/components/sections/workflow";
import { JsonLd } from "@/components/jsonld";
import type { Locale } from "@/lib/i18n";

/** One page, both locales. A company page — the products link out. */
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
        <Economics locale={locale} />
        <Staffing locale={locale} />
        <Company locale={locale} />
        <Products locale={locale} />
        <Geo locale={locale} />
        <Partners locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
