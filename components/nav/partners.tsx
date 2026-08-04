import partners from "@/data/partners.json";
import { getContent, type Locale } from "@/lib/i18n";

/** Backing and the stack the agents actually run on. Text, not logo soup. */
export function Partners({ locale }: { locale: Locale }) {
  const t = getContent(locale).partners;

  return (
    <section className="partners" aria-label={t.backedBy}>
      <hr className="rule" />
      <div className="partners__grid">
        <div>
          <p className="eyebrow">{t.backedBy}</p>
          <p className="partners__backer">
            {partners.backers.map((b) => b.name).join(" · ")}
          </p>
        </div>
        <div>
          <p className="eyebrow">{t.builtWith}</p>
          <ul className="partners__stack">
            {partners.stack.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
