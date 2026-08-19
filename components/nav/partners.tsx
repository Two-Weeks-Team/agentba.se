import { Fragment } from "react";
import partners from "@/data/partners.json";
import { getContent, type Locale } from "@/lib/i18n";

/**
 * Grants and the stack the agents actually run on. Text, not logo soup.
 * "Grants & programs", never "Backed by" — the latter implies investors, and
 * the grant's own terms ask for the name linked to its programme page.
 */
export function Partners({ locale }: { locale: Locale }) {
  const t = getContent(locale).partners;

  return (
    <section className="partners" aria-label={t.grants}>
      <hr className="rule" />
      <div className="partners__grid">
        <div>
          <p className="eyebrow">{t.grants}</p>
          <p className="partners__backer">
            {partners.grants.map((g, i) => (
              <Fragment key={g.id}>
                {i > 0 ? " · " : null}
                <a className="partners__grant" href={g.url} rel="noopener">
                  {g.name}
                </a>
              </Fragment>
            ))}
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
