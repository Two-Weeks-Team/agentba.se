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

  // Two traps, one answer. A filled honeypot or an instant submit is dropped
  // with a success, so the sender cannot tell which field gave it away.
  if (text(body.website)) return silent();
  const elapsed = text(body.t);
  if (elapsed && Number(elapsed) < MIN_FILL_MS) return silent();

  // Without the key nothing can be sent, and claiming otherwise would lose the
  // line. The 503 is what makes the client show the founders' addresses — the
  // same degradation the site takes when the analytics key is absent.
  const key = process.env.RESEND_API_KEY;
  if (!key) return fail(503);

  let sent: Response;
  try {
    sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
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
