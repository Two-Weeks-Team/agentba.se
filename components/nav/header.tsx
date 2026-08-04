import { getContent, type Locale } from "@/lib/i18n";

/**
 * Wordmark and a locale switch. Nothing else — this is one page, and a link
 * out of it belongs at the bottom, not the top.
 *
 * The switch is two plain anchors rather than a dropdown: a crawler has to be
 * able to follow it, and changing locale is a full document load by design.
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
        <a
          className="topbar__locale"
          href={t.localeHref}
          hrefLang={locale === "ko" ? "en" : "ko"}
          rel="alternate"
        >
          {t.localeLabel}
        </a>
      </nav>
    </>
  );
}
