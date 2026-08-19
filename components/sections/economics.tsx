import economics from "@/data/economics.json";
import { fmt, getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * The scope note is rendered at body size directly under the headline, not as
 * a footnote. Without it these two columns assert something they do not
 * support — the pass-through spend is identical on both sides, and including
 * it would make the gap look larger than it is.
 *
 * The excluded row is shown greyed rather than deleted, so what was taken out
 * of the comparison stays visible.
 */
export function Economics({ locale }: { locale: Locale }) {
  const t = getContent(locale).economics;
  const e = economics;

  return (
    <Section id="operating-layer" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <p className="scope-note">{e.scopeNote[locale]}</p>

      <div className="econ">
        {([e.outsourced, e.agentbase] as const).map((col, i) => (
          <div key={col.label.en} className="econ__col" data-ours={i === 1}>
            <h3 className="econ__who">{col.label[locale]}</h3>

            <p className="num econ__figure">
              ${fmt(locale, col.costUsd, {
                minimumFractionDigits: col.costUsd % 1 ? 2 : 0,
              })}
            </p>
            <p className="econ__caption">{t.costLabel}</p>
            <p className="econ__detail">{col.costNote[locale]}</p>

            <p className="num econ__figure econ__figure--second">{col.humanHours}</p>
            <p className="econ__caption">{t.hoursLabel}</p>
          </div>
        ))}
      </div>

      <p className="econ__excluded">
        <span className="num">${fmt(locale, e.excluded.passThroughUsd)}</span>
        {" — "}
        {e.excluded.label[locale]}
        {" · "}
        {t.excludedLabel}
      </p>
      <p className="econ__basis">{e.basis[locale]}</p>

      <p className="sec__cta">
        <a href="#intake">{t.cta}</a>
      </p>
    </Section>
  );
}
