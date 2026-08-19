import products from "@/data/products.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * Offer shapes, not promises — each body points at the section of the page
 * that backs it, and the copy lives in the content modules. Only the shape
 * with something already running behind it gets a link and a lit marker.
 */
export function Services({ locale }: { locale: Locale }) {
  const t = getContent(locale).services;
  // By id, not by position: the products file is ordered for the page it feeds,
  // and reordering it must not quietly point this link at another product.
  const liveUrl = products.products.find((p) => p.id === "social-seeding")?.url;

  return (
    <Section id="services" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <ul className="svc">
        {t.items.map((item) => {
          const href = item.id === "run" ? liveUrl : undefined;
          return (
            <li key={item.id} className="svc__item">
              <h3 className="svc__head">
                <span className="svc__mark" data-live={Boolean(href)} aria-hidden="true" />
                {href ? (
                  <a className="svc__link" href={href} rel="noopener">
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </h3>
              <p className="svc__body">{item.body}</p>
            </li>
          );
        })}
      </ul>

      <p className="svc__cta">
        <a href="#intake">{t.cta}</a>
      </p>
    </Section>
  );
}
