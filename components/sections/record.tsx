import competitions from "@/data/competitions.json";
import { getContent, type Locale } from "@/lib/i18n";
import { Section } from "./section";

type Result = "won" | "hm" | "selected" | "entered" | "pending";

type Entry = {
  id: string;
  date: string;
  event: string;
  organizer: string;
  project: string;
  result: Result;
  prize?: { en: string; ko: string };
  note?: { en: string; ko: string };
  announceOn?: string;
  links: { label: string; url: string }[];
};

/** JSON widens `result` to `string`; the union is the thing we style on. */
const ENTRIES = competitions.entries as Entry[];

/**
 * The whole column, chronological, losses included.
 *
 * The rows that lost are the reason the two ribbons are worth anything, so a
 * row that lost may never be dropped and never be dimmed into illegibility:
 * every row carries the same rule, the same type size and the same text
 * colour, and only the result tag changes. Counts are derived from the array —
 * a hardcoded "1 win" would go stale the moment a row is appended.
 */
export function RecordSection({ locale }: { locale: Locale }) {
  const t = getContent(locale).record;
  const aside = competitions.aside;

  const count = (r: Result) => ENTRIES.filter((e) => e.result === r).length;

  const stats = [
    { key: "entries", value: ENTRIES.length, label: t.entriesLabel },
    { key: "won", value: count("won"), label: t.results.won },
    { key: "hm", value: count("hm"), label: t.results.hm },
    { key: "pending", value: count("pending"), label: t.results.pending },
  ];

  return (
    <Section id="record" eyebrow={t.eyebrow} h2={t.h2} lede={t.lede}>
      <dl className="rec__stats">
        {stats.map((s) => (
          <div key={s.key} className="rec__stat">
            <dt className="num rec__stat-value">{s.value}</dt>
            <dd className="rec__stat-label">{s.label}</dd>
          </div>
        ))}
      </dl>

      <ol className="rec">
        {ENTRIES.map((e) => (
          <li key={e.id} className="rec__row" data-result={e.result}>
            <time className="num rec__date" dateTime={e.date}>
              {e.date}
            </time>

            <div className="rec__what">
              <span className="rec__event">{e.event}</span>
              <span className="rec__org">{e.organizer}</span>
            </div>

            <span className="rec__project">{e.project}</span>

            <div className="rec__outcome">
              <span className="rec__tag" data-result={e.result}>
                {t.results[e.result]}
              </span>
              {e.prize ? (
                <span className="num rec__prize">{e.prize[locale]}</span>
              ) : null}
              {e.announceOn ? (
                <time className="num rec__announce" dateTime={e.announceOn}>
                  {e.announceOn}
                </time>
              ) : null}
            </div>

            {e.links.length > 0 ? (
              <div className="rec__links">
                {e.links.map((l) => (
                  <a
                    key={l.url}
                    className="rec__chip"
                    href={l.url}
                    rel="noopener"
                    aria-label={`${l.label} — ${e.event}`}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            ) : null}

            {e.note ? <p className="rec__note">{e.note[locale]}</p> : null}
          </li>
        ))}
      </ol>

      <p className="rec__pending">{t.pendingNote}</p>
      <p className="rec__source">{aside.judge[locale]}</p>
      <p className="rec__source">{aside.hosted[locale]}</p>
    </Section>
  );
}
