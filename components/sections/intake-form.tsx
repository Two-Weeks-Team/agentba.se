"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import people from "@/data/people.json";
import { getContent, type Locale } from "@/lib/i18n";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The form posts to /api/intake with or without JavaScript: the `action` and
 * `method` are real, and the endpoint answers a native submit with a redirect
 * back to this section. The handler below only takes over to keep the reader
 * on the page and to say what happened without a reload.
 */
export function IntakeForm({ locale }: { locale: Locale }) {
  const t = getContent(locale).intake;
  const [status, setStatus] = useState<Status>("idle");
  const openedAt = useRef(0);
  // State and the button's disabled attribute both settle a render later, so a
  // fast double-submit can pass a guard that reads them. A ref changes now.
  const sending = useRef(false);

  // The endpoint drops anything typed faster than a person can type it, so it
  // has to be told how long the form was open. Left at 0 the elapsed time
  // reads as enormous, which passes — the trap must never catch a real reader.
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;

    const data = new FormData(event.currentTarget);
    setStatus("sending");

    let ok = false;
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          line: String(data.get("line") ?? ""),
          website: String(data.get("website") ?? ""),
          t: Date.now() - openedAt.current,
          locale,
        }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    } finally {
      sending.current = false;
    }

    if (ok) {
      setStatus("sent");
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        const { default: posthog } = await import("posthog-js");
        posthog.capture("intake_submitted");
      }
    } else {
      setStatus("error");
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        const { default: posthog } = await import("posthog-js");
        posthog.capture("intake_failed");
      }
    }
  }

  return (
    <div className="intake">
      {status === "sent" ? null : (
        <form className="intake__form" action="/api/intake" method="post" onSubmit={onSubmit}>
          {/* Read by the endpoint so a submit without JavaScript lands back on
              the page it was sent from. */}
          <input type="hidden" name="locale" value={locale} />

          <div className="intake__field">
            <label className="intake__label" htmlFor="intake-email">
              {t.emailLabel}
            </label>
            <input
              className="intake__input"
              id="intake-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder={t.emailPlaceholder}
            />
          </div>

          <div className="intake__field">
            <label className="intake__label" htmlFor="intake-line">
              {t.lineLabel}
            </label>
            <textarea
              className="intake__textarea"
              id="intake-line"
              name="line"
              required
              maxLength={1000}
              rows={2}
              placeholder={t.linePlaceholder}
            />
          </div>

          {/* Positioned off-screen rather than display:none — a bot skips what
              is not rendered, and a filled `website` is the whole signal. */}
          <div className="intake__trap" aria-hidden="true">
            <input id="intake-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button className="intake__submit" type="submit" disabled={status === "sending"}>
            {t.submit}
          </button>
        </form>
      )}

      {/* In the DOM from the first render, so the result is announced when it
          arrives rather than appearing beside a reader who never hears it. */}
      <p className="intake__status" data-state={status} role="status" aria-live="polite">
        {status === "sent" ? t.sent : null}
        {status === "error" ? (
          <>
            {t.error}{" "}
            {people.people.map((p, i) => (
              <Fragment key={p.id}>
                {i > 0 ? " · " : null}
                <a className="intake__mail" href={`mailto:${p.email}`}>
                  {p.email}
                </a>
              </Fragment>
            ))}
          </>
        ) : null}
      </p>
    </div>
  );
}
