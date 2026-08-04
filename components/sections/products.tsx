import products from "@/data/products.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * Names, one line, and a link. Each product argues its own case on its own
 * site; repeating that argument here would turn a company page into a
 * product page.
 */
export function Products({ locale }: { locale: Locale }) {
  const t = getContent(locale).products;

  return (
    <Section id="products" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <ul className="prod">
        {products.products.map((p) => (
          <li key={p.id} className="prod__item">
            <a className="prod__link" href={p.url} rel="noopener">
              <span className="prod__name">{p.name}</span>
              <span className="prod__domain">{p.domain}</span>
            </a>
            <p className="prod__one">{p.one[locale]}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
