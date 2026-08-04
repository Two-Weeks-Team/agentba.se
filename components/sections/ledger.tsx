import replacements from "@/data/replacements.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * The payload of this site.
 *
 * Not a table: the left-hand values are sentences, and a table cell makes a
 * sentence look like a datum. Not an interactive widget either — the copy *is*
 * the argument, and hiding it behind an interaction hides it from crawlers,
 * from agents, and from anyone who does not hover.
 *
 * The Korean inside `"AI 작성" button + the human reviewing` is left in place
 * in both locales. It is in the source document because a Seoul team wrote it,
 * and translating it away would delete the evidence.
 */
export function Ledger({ locale }: { locale: Locale }) {
  const t = getContent(locale).ledger;

  return (
    <Section id="ledger" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <ol className="ledger">
        {replacements.rows.map((row) => (
          <li key={row.agent} className="ledger__row">
            <div className="ledger__was">
              <span className="ledger__label">{t.wasLabel}</span>
              <s className="ledger__quote">{row.was}</s>
            </div>

            <div className="ledger__arrow" aria-hidden="true">
              <span className="ledger__stage">{row.stage}</span>
              <span className="ledger__line" />
            </div>

            <div className="ledger__now">
              <span className="ledger__label">{t.nowLabel}</span>
              <code className="ledger__agent">{row.agent}</code>
              <span className="ledger__desc">{row.now}</span>
            </div>
          </li>
        ))}
      </ol>

      <p className="ledger__footnote">{t.footnote}</p>
      <p className="ledger__source">{t.sourceNote}</p>
    </Section>
  );
}
