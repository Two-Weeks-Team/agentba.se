import { Mark } from "@/components/brand/mark";
import { getContent, type Locale } from "@/lib/i18n";

/**
 * Mark, wordmark, and a locale switch. Nothing else — this is one page, and a
 * link out of it belongs at the bottom.
 *
 * The mark is decorative here: the company name sits right beside it as text,
 * so announcing it twice would only add noise for a screen reader.
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
          <Mark className="topbar__logo" />
          <span>
            agentba<span className="topbar__dot">.</span>se
          </span>
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
