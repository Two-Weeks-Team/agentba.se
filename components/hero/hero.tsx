import { SwarmCanvas } from "./swarm-canvas";
import { SwarmStatic } from "./swarm-static";
import { getContent, type Locale } from "@/lib/i18n";

/**
 * The LCP element is the `<h1>`, which is plain server-rendered text sitting
 * above a fixed-aspect visual container. Nothing about the swarm can delay it
 * or shift it.
 */
export function Hero({ locale }: { locale: Locale }) {
  const t = getContent(locale).hero;

  return (
    <header className="hero">
      <div className="hero__viz">
        <SwarmStatic locale={locale} />
        <SwarmCanvas locale={locale} />
        <p className="hero__hint" aria-hidden="true">
          {t.swarmHint}
        </p>
      </div>

      <div className="hero__copy">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="hero__h1">{t.h1}</h1>
        <p className="hero__sub">{t.sub}</p>

        <dl className="hero__stats">
          {t.stats.map((s) => (
            <div key={s.label} className="hero__stat">
              <dt className="num hero__stat-value">{s.value}</dt>
              <dd className="hero__stat-label">{s.label}</dd>
            </div>
          ))}
        </dl>

        <p className="hero__legend">{t.swarmLegend}</p>
      </div>
    </header>
  );
}
