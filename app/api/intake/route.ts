import people from "@/data/people.json";

/**
 * The intake endpoint. It keeps nothing: a valid line becomes one email to the
 * two founders and is then forgotten — no store, and no log of what was
 * written, which is the only reason a stranger's first message can be trusted
 * to this address at all.
 *
 * Both encodings are accepted because the form is real without JavaScript:
 * the native submit arrives form-encoded and is answered with a redirect, the
 * scripted one arrives as JSON and is answered with JSON.
 */

/** Loose on purpose. An address only has to be mailable; the reply proves it. */
const EMAIL = /^\S+@\S+\.\S+$/;
const MAX_EMAIL = 254;
const MAX_LINE = 1000;

/** A parser fills a form the instant it reads it. Nobody types a line this fast. */
const MIN_FILL_MS = 2500;

/**
 * A speed bump, and only that. Module scope lives as long as one warm instance,
 * so this slows a loop coming from a single address on a single instance; it
 * cannot promise a limit across instances. A promise would need an edge rule,
 * and the thing being protected is two inboxes, not a database.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const seen = new Map<string, number[]>();

function overLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  seen.set(ip, recent);
  if (seen.size > 500) {
    for (const [key, at] of seen) {
      if (!at.some((t) => now - t < WINDOW_MS)) seen.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function fail(status: number): Response {
  return Response.json({ ok: false }, { status });
}

/** Indistinguishable from a delivered line, so a bot learns nothing to tune. */
function silent(): Response {
  return new Response(null, { status: 204 });
}

export async function POST(req: Request): Promise<Response> {
  const isJson = (req.headers.get("content-type") ?? "").includes("application/json");

  let body: Record<string, unknown>;
  try {
    body = isJson
      ? ((await req.json()) as Record<string, unknown>)
      : Object.fromEntries(await req.formData());
  } catch {
    return fail(400);
  }
  if (!body || typeof body !== "object") return fail(400);

  const email = text(body.email);
  const line = text(body.line);
  const locale = text(body.locale) === "ko" ? "ko" : "en";

  if (!email || email.length > MAX_EMAIL || !EMAIL.test(email)) return fail(400);
  if (!line || line.length > MAX_LINE) return fail(400);

  // Three traps, one answer. A filled honeypot, a missing one, or an instant
  // submit is dropped with a success, so the sender cannot tell which field
  // gave it away.
  //
  // Absence is as suspicious as a filled trap: both paths through the real form
  // send `website` — empty from a person, filled by whatever crawls it — so a
  // request without the field at all was not sent by this form.
  if (!("website" in body) || text(body.website)) return silent();

  // `t` is only sent by the scripted path; the native submit has no clock to
  // read, so its absence is normal and allowed. What is not allowed is a value
  // that is present and not a real number — NaN fails every comparison, which
  // would turn the trap into a way through it.
  if ("t" in body) {
    const elapsed = Number(text(body.t));
    if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return silent();
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (overLimit(ip)) return fail(429);

  // Without the key nothing can be sent, and claiming otherwise would lose the
  // line. The 503 is what makes the client show the founders' addresses — the
  // same degradation the site takes when the analytics key is absent.
  const key = process.env.RESEND_API_KEY;
  if (!key) return fail(503);

  let sent: Response;
  try {
    sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      // Without a bound, a silent Resend holds the function open to its own
      // limit and leaves the form saying "sending" the whole time. An abort
      // lands in the catch below and answers 502, which the form can act on.
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "AgentBase Intake <intake@agentba.se>",
        to: people.people.map((p) => p.email),
        reply_to: email,
        // A textarea line may hold newlines; a subject must not.
        subject: `brief: ${line.replace(/\s+/g, " ").slice(0, 80)}`,
        text: `${line}\n\nreply-to: ${email}\nlocale: ${locale}`,
      }),
    });
  } catch {
    return fail(502);
  }
  if (!sent.ok) return fail(502);

  if (isJson) return Response.json({ ok: true });

  // The native path posted a form and must land back on the section rather
  // than on a JSON body. The Location is relative so a preview deployment
  // redirects to itself and not to production.
  return new Response(null, {
    status: 303,
    headers: { Location: locale === "ko" ? "/ko#intake" : "/#intake" },
  });
}
