import fleet from "@/data/fleet.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

/**
 * The company's staffing position, and the boundary that makes it safe to
 * hold. Autonomy is a setting an operator chooses, not a claim about how
 * clever the models are.
 */
export function Staffing({ locale }: { locale: Locale }) {
  const t = getContent(locale).staffing;
  const required = fleet.gates.filter((g) => g.requiredHitl);

  return (
    <Section id="staffing" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <div className="staff">
        <div className="staff__col">
          <h3 className="wf__title">{t.humanTitle}</h3>
          <ul className="staff__list">
            {t.human.map((line) => (
              <li key={line} className="staff__item">
                {line}
              </li>
            ))}
          </ul>
          <p className="staff__note">
            {t.requiredNote}
            {required.map((g) => (
              <code key={g.id} className="staff__gate">
                {g.id}
              </code>
            ))}
          </p>
        </div>

        <div className="staff__col">
          <h3 className="wf__title">{t.agentTitle}</h3>
          <ul className="staff__list">
            {t.agent.map((line) => (
              <li key={line} className="staff__item">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
