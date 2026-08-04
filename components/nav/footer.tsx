import fleet from "@/data/fleet.json";
import people from "@/data/people.json";
import { getContent, type Locale } from "@/lib/i18n";

const REPO = "https://github.com/Two-Weeks-Team/agentba.se";

/**
 * Two named people with working addresses, rather than a shared inbox. A
 * company that says it runs on agents should still be reachable by a person.
 */
export function Footer({ locale }: { locale: Locale }) {
  const t = getContent(locale).footer;
  const year = 2026;

  return (
    <footer className="foot">
      <hr className="rule" />
      <div className="foot__grid">
        <div>
          <p className="foot__mark">{t.wordmark}</p>
          <p className="foot__line">{t.line}</p>
        </div>

        <ul className="foot__people">
          {people.people.map((p) => (
            <li key={p.id} className="foot__person">
              <span className="foot__role">{p.role}</span>
              <span className="foot__name">{locale === "ko" ? p.nameKo : p.name}</span>
              <a className="foot__email" href={`mailto:${p.email}`}>
                {p.email}
              </a>
            </li>
          ))}
        </ul>

        <div className="foot__links">
          <p>
            <a href={REPO} rel="noopener">
              {t.repoLabel}
            </a>
          </p>
          <p>
            <a href="/llms.txt">/llms.txt</a>
            {" · "}
            <a href={locale === "ko" ? "/ko/index.md" : "/index.md"}>.md</a>
          </p>
        </div>
      </div>

      <p className="foot__snapshot">
        {t.snapshot} <time dateTime={fleet.capturedAt}>{fleet.capturedAt}</time>.
      </p>
      <p className="foot__rights">
        © {year} {t.rights}
      </p>
    </footer>
  );
}
