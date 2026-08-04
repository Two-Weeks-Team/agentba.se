import { getContent, type Locale } from "@/lib/i18n";

const REPO = "https://github.com/Two-Weeks-Team/agentba.se";

/**
 * No navigation menu — this is one page. The locale switch is two plain
 * anchors rather than a dropdown, because a crawler has to be able to follow
 * it, and because switching locale is a full page load by design.
 */
export function Header({ locale }: { locale: Locale }) {
  const t = getContent(locale).nav;

  return (
    <>
      <a href="#fleet" className="skip">
        {t.skip}
      </a>
      <nav className="topbar" aria-label="Site">
        <a href={locale === "ko" ? "/ko" : "/"} className="topbar__mark">
          agentba<span className="topbar__dot">.</span>se
        </a>
        <div className="topbar__right">
          <a href={REPO} rel="noopener">
            {t.repo}
          </a>
          <a
            href={t.localeHref}
            hrefLang={locale === "ko" ? "en" : "ko"}
            rel="alternate"
          >
            {t.localeLabel}
          </a>
        </div>
      </nav>
    </>
  );
}
