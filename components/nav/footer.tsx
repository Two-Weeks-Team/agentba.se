import fleet from "@/data/fleet.json";
import { getContent, type Locale } from "@/lib/i18n";

const REPO = "https://github.com/Two-Weeks-Team/agentba.se";
const CONTACT = "sejun@2weeks.co";

/**
 * No job titles. The repository documents conflict on who holds which, and a
 * title with no source behind it is exactly the kind of claim this site is
 * built to avoid.
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
          <p>
            <a href="https://socialseed.ing" rel="noopener">
              {t.product}
            </a>
          </p>
        </div>

        <div className="foot__links">
          <p>
            <span className="foot__label">{t.repoLabel}</span>
            <a href={REPO} rel="noopener">
              Two-Weeks-Team/agentba.se
            </a>
          </p>
          <p>
            <span className="foot__label">{t.contactLabel}</span>
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </p>
          <p>
            <span className="foot__label">{t.machineLabel}</span>
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
