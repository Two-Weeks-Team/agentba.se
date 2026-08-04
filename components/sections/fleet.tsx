import fleet from "@/data/fleet.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

type Tier = "domain" | "meta" | "watchdog";
const TIERS: Tier[] = ["domain", "meta", "watchdog"];

/**
 * The full roster, in the DOM. This is also the keyboard and screen-reader
 * path to everything the hero canvas expresses visually — the canvas itself is
 * decorative and hidden from assistive technology.
 */
export function Fleet({ locale }: { locale: Locale }) {
  const t = getContent(locale).fleet;

  return (
    <Section id="fleet" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <div className="fleet">
        {TIERS.map((tier) => {
          const members = fleet.agents.filter((a) => a.tier === tier);
          return (
            <div key={tier} className="fleet__group" data-tier={tier}>
              <h3 className="fleet__group-title">
                <span className="fleet__dot" data-tier={tier} aria-hidden="true" />
                {t.groups[tier]}
                <span className="num fleet__count">{members.length}</span>
              </h3>
              <p className="fleet__group-note">{t.groupNotes[tier]}</p>
              <ul className="fleet__list">
                {members.map((a) => (
                  <li key={a.id} className="fleet__item">
                    <code className="fleet__id">{a.id}</code>
                    <span className="fleet__role">{a.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
