import fleet from "@/data/fleet.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

export function Workflow({ locale }: { locale: Locale }) {
  const t = getContent(locale).workflow;

  return (
    <Section id="workflow" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <div className="wf">
        <div className="wf__col">
          <h3 className="wf__title">{t.stagesTitle}</h3>
          <ol className="wf__stages">
            {fleet.stages.map((s) => (
              <li key={s.id} className="wf__stage">
                <span className="num wf__order">
                  {String(s.order).padStart(2, "0")}
                </span>
                <code className="wf__stage-id">{s.id}</code>
                <span className="wf__stage-label">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="wf__col">
          <h3 className="wf__title">{t.gatesTitle}</h3>
          <ul className="wf__gates">
            {fleet.gates.map((g) => (
              <li key={g.id} className="wf__gate" data-required={g.requiredHitl}>
                <code className="wf__gate-id">{g.id}</code>
                {g.requiredHitl ? (
                  <span className="wf__req">{t.hitl}</span>
                ) : null}
                <span className="wf__gate-note">{g.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="wf__col">
          <h3 className="wf__title">{t.levelsTitle}</h3>
          <ul className="wf__levels">
            {fleet.autonomyLevels.map((l) => (
              <li key={l.id} className="wf__level" data-default={l.isDefault}>
                <code className="wf__level-id">{l.id}</code>
                {l.isDefault ? (
                  <span className="wf__default">{t.defaultTag}</span>
                ) : null}
                <span className="wf__level-label">{l.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
