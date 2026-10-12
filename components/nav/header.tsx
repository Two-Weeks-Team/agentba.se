import { Logo } from "@/components/brand/logo";
import { getContent, type Locale } from "@/lib/i18n";

/**
 * Mark, wordmark, a contact anchor, and a locale switch. The contact anchor is
 * the one deliberate exception to "nothing else": it points down the page to
 * intake, not out of it — a link that leaves the page still belongs at the
 * bottom.
 *
 * The complete CI lockup includes the official wordmark and its accessible name.
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
          <Logo className="topbar__logo" variant="white" />
        </a>
        <div className="topbar__right">
          <a className="topbar__contact" href="#intake">
            {t.contact}
          </a>
          <a
            className="topbar__locale"
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
