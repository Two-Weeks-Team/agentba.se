import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";
import { IntakeForm } from "./intake-form";

/**
 * The only place on this page that asks for anything. Two fields, because the
 * headline claims one line is enough and a longer form would contradict it.
 *
 * The fallback line stays visible in every state: the form can fail, the
 * mailbox cannot.
 */
export function Intake({ locale }: { locale: Locale }) {
  const t = getContent(locale).intake;

  return (
    <Section id="intake" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <IntakeForm locale={locale} />
      <p className="intake__fallback">{t.fallback}</p>
    </Section>
  );
}
