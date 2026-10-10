import { getContent, type Locale } from "@/lib/i18n";

export function About({ locale }: { locale: Locale }) {
  const t = getContent(locale).about;

  return (
    <section id="about" className="about" aria-labelledby="about-heading" lang="en">
      <hr className="rule" />
      <h2 id="about-heading" className="eyebrow">{t.eyebrow}</h2>
      <p className="sec__lede">{t.identity}</p>
      <p className="sec__lede">{t.founder}</p>
      <p className="sec__lede">{t.business}</p>
    </section>
  );
}
