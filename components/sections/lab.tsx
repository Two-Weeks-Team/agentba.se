import portfolio from "@/data/portfolio.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * Every entry carries at least one link a visitor can open and check without
 * trusting us — a live site, a public listing, a demo video, a judged result.
 * A build with nothing to open does not belong on this grid.
 *
 * The platform sits beside the name because it is the one axis a reader scans
 * this grid on: twelve builds are a list, but four that run on a phone or in
 * someone else's editor are a range. It is not translated — every value is a
 * platform's own name.
 */
export function Lab({ locale }: { locale: Locale }) {
  const t = getContent(locale).lab;

  return (
    <Section id="lab" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <ul className="lab">
        {portfolio.entries.map((e) => (
          <li key={e.id} className="lab__entry">
            <div className="lab__head">
              <h3 className="lab__name">{e.name}</h3>
              <span className="lab__platform">{e.platform}</span>
            </div>
            <p className="lab__one">{e.one[locale]}</p>
            <ul className="lab__links">
              {e.links.map((l) => (
                <li key={l.url}>
                  <a className="lab__link" href={l.url} rel="noopener">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="lab__mentions">
        <h3 className="wf__title">{t.mentionsLabel}</h3>
        <ul className="lab__mention-list">
          {portfolio.mentions.map((m) => (
            <li key={m.id} className="lab__mention">
              <span className="lab__mention-name">{m.name}</span>
              <span className="lab__mention-one">{m.one[locale]}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
