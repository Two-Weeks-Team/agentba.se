import pilot from "@/data/pilot.json";
import { fmt, getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * Funnel bars are server-rendered divs whose widths are proportional to the
 * counts. No client chart library, and the numbers are in the initial HTML —
 * a crawler, an OG preview, and a person all read the same figures.
 */
export function Pilot({ locale }: { locale: Locale }) {
  const t = getContent(locale).pilot;
  const h = pilot.headline;
  const max = Math.max(...pilot.funnel.map((f) => f.count));

  return (
    <Section id="ran" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <div className="pilot">
        <div className="pilot__funnel">
          <h3 className="wf__title">{t.funnelTitle}</h3>
          <ol className="funnel">
            {pilot.funnel.map((f) => (
              <li key={f.id} className="funnel__row">
                <span className="funnel__label">{f.label}</span>
                <span
                  className="funnel__bar"
                  style={{ inlineSize: `${(f.count / max) * 100}%` }}
                  aria-hidden="true"
                />
                <span className="num funnel__count">{f.count}</span>
              </li>
            ))}
          </ol>
        </div>

        <dl className="pilot__stats">
          <div className="pilot__stat">
            <dt className="num pilot__value">{h.verifiedPosts}</dt>
            <dd className="pilot__label">
              {t.stats.verified}
              <span className="pilot__note">{t.stats.verifiedNote}</span>
            </dd>
          </div>
          <div className="pilot__stat">
            <dt className="num pilot__value">{fmt(locale, h.views)}</dt>
            <dd className="pilot__label">{t.stats.views}</dd>
          </div>
          <div className="pilot__stat">
            {/* One string, not two children: React would otherwise split the
                figure with a comment node, so raw HTML readers see "7.9<!-- -->%". */}
            <dt className="num pilot__value">{`${h.engagementRatePct}%`}</dt>
            <dd className="pilot__label">{t.stats.engagement}</dd>
          </div>
          <div className="pilot__stat">
            <dt className="num pilot__value">{h.unapprovedSends}</dt>
            <dd className="pilot__label">{t.stats.unapproved}</dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
