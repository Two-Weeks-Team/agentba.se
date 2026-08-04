import quality from "@/data/quality.json";
import { fmt, getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

export function Company({ locale }: { locale: Locale }) {
  const t = getContent(locale).company;

  return (
    <Section id="company" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <div className="company">
        <div className="company__col">
          <h3 className="wf__title">
            {t.gatesTitle}
            <span className="num company__count">{quality.ciGatesPerPr}</span>
          </h3>
          <ol className="company__gates">
            {quality.gateNames.map((g) => (
              <li key={g} className="company__gate">
                {g}
              </li>
            ))}
          </ol>
        </div>

        <div className="company__col">
          <h3 className="wf__title">{t.testsTitle}</h3>
          <dl className="company__tests">
            <div className="company__test">
              <dt className="num company__test-value">
                {fmt(locale, quality.pytestPassing)}
              </dt>
              <dd className="company__test-label">Python</dd>
            </div>
            <div className="company__test">
              <dt className="num company__test-value">
                {fmt(locale, quality.tsTests)}
              </dt>
              <dd className="company__test-label">TypeScript</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="company__site-note">{t.siteNote}</p>
    </Section>
  );
}
