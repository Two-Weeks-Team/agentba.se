import people from "@/data/people.json";
import { CONTACT_EMAIL, getContent, type Locale } from "@/lib/i18n";
import { NEWEST_SNAPSHOT } from "@/lib/snapshot";

/**
 * Company verification lives in the footer, alongside the two founders and
 * the shared contact address. The same facts feed metadata and AI documents.
 */
export function Footer({ locale }: { locale: Locale }) {
  const t = getContent(locale).footer;
  const about = getContent(locale).about;
  const year = 2026;

  return (
    <footer className="foot">
      <hr className="rule" />
      <div className="foot__grid">
        <div>
          <p className="foot__mark">{t.wordmark}</p>
          <p className="foot__line" lang="en">{about.identity}</p>
          <p className="foot__line" lang="en">{about.business}</p>
        </div>

        <ul className="foot__people">
          {people.people.map((p) => (
            <li key={p.id} className="foot__person">
              <span className="foot__role">Co-founder · {p.role}</span>
              <a className="foot__name" href={p.linkedin} target="_blank" rel="noopener noreferrer">
                {p.name} ↗
              </a>
            </li>
          ))}
        </ul>

        <div className="foot__links">
          <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          <p>
            <a href="/llms.txt">/llms.txt</a>
            {" · "}
            <a href={locale === "ko" ? "/ko/index.md" : "/index.md"}>.md</a>
          </p>
        </div>
      </div>

      <p className="foot__snapshot">
        {t.snapshot} <time dateTime={NEWEST_SNAPSHOT}>{NEWEST_SNAPSHOT}</time>.
      </p>
      <p className="foot__rights" lang="en">
        © {year} {t.rights}{" · "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </footer>
  );
}
