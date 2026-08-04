import geo from "@/data/geo.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/** The legend for the hero markers, and the accessible version of them. */
export function Geo({ locale }: { locale: Locale }) {
  const t = getContent(locale).geo;

  return (
    <Section id="where" eyebrow={t.eyebrow} h2={t.h2}>
      <ul className="geo__list">
        {geo.operating.map((p) => (
          <li key={p.id} className="geo__item">
            <span className="geo__key" aria-hidden="true" />
            {locale === "ko" ? p.cityKo : p.city}
            <span className="geo__cc">{p.country}</span>
            {"hq" in p && p.hq ? <span className="geo__hq">{t.hqTag}</span> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
