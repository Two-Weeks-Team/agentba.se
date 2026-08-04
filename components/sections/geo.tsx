import geo from "@/data/geo.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * The legend for the hero markers, and the accessible version of them.
 *
 * Two tiers, kept distinct on purpose: `operating` is where campaign work has
 * run; `market` is audience scale we can reach. Collapsing them would turn a
 * reach figure into a claim of past work.
 */
export function Geo({ locale }: { locale: Locale }) {
  const t = getContent(locale).geo;
  const name = (p: { city: string; cityKo: string }) =>
    locale === "ko" ? p.cityKo : p.city;

  return (
    <Section id="where" eyebrow={t.eyebrow} h2={t.h2}>
      <div className="geo">
        <div className="geo__col">
          <h3 className="wf__title">
            <span className="geo__key geo__key--op" aria-hidden="true" />
            {t.operatingTitle}
            <span className="num company__count">{geo.operating.length}</span>
          </h3>
          <ul className="geo__list">
            {geo.operating.map((p) => (
              <li key={p.id} className="geo__item">
                {name(p)}
                <span className="geo__cc">{p.country}</span>
                {"hq" in p && p.hq ? (
                  <span className="geo__hq">{t.hqTag}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="geo__col">
          <h3 className="wf__title">
            <span className="geo__key geo__key--mk" aria-hidden="true" />
            {t.marketTitle}
          </h3>
          <p className="geo__note">{t.marketNote}</p>
          <ul className="geo__list">
            {geo.market.map((p) => (
              <li key={p.id} className="geo__item">
                {name(p)}
                <span className="geo__cc">{p.country}</span>
                <span className="num geo__users">{p.tiktokUsersM}M</span>
              </li>
            ))}
          </ul>
          <p className="geo__source">
            <a href={geo.marketSource.url} rel="nofollow noopener">
              {geo.marketSource.label}
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}
