# agentba.se

The AgentBase company site. One page, English at `/` and Korean at `/ko`.

Its only job is to show how the company operates. This is a company page, not
a product page — customer names, campaign results and category metrics belong
on each product's own site, and `tests/no-banned-claims.test.ts` fails the
build if they turn up here.

## Why the repository is public

The site argues that this company's operating work is done by agents. A commit
history is the cheapest form of evidence for that claim, and a private one
proves nothing.

## Stack

Next.js 16 (App Router, all routes static) · React 19 · Tailwind CSS 4 ·
TypeScript · deployed on Vercel, `icn1`.

There is no `app/layout.tsx`. Each locale is its own root layout under
`app/(en)` and `app/(ko)`, so `<html lang>` is correct without a middleware
negotiating locale on every request.

## The hero

A world map rendered as a dot matrix, where each square is a unit of campaign
work. Move the cursor and scattered work falls into formation.

- `lib/swarm/layout.ts` — deterministic seat generation, shared by the server
  (which renders a static SVG) and the browser (which renders the canvas), so
  the cross-fade between them is invisible.
- `lib/swarm/step.ts` — one physics tick. No neighbour queries: fluidity comes
  from per-dot phase noise and cohesion from the cursor field, so the loop is
  O(n) and needs no spatial index.
- `lib/swarm/draw.ts` — two batched Canvas 2D passes.
- `lib/swarm/constants.ts` — every tuning constant, in one file.

Four things keep this reading as a control display rather than a particle
background, and dropping any one of them undoes it: squares instead of
circles, integer-snapped coordinates, a grid that stays legible with no cursor
on it, and monospace labels that are always visible.

Without JavaScript the hero is still a finished picture — the server renders
the whole world as a single `<path>`, about 1 kB gzipped.

## Figures

Every number on the page comes from `data/*.json`, committed to this
repository and rendered on the server. Nothing is fetched after load, so a
crawler, a social preview, and a person all read the same figures.

| File | Maintained by |
| --- | --- |
| `fleet.json` | CI, from the source repo's agent modules |
| `quality.json` | CI, from the source repo's test run |
| `economics.json` | by hand; `scopeNote` is a required field |
| `replacements.json` | by hand, quoted verbatim from the source roster |
| `products.json` | by hand — names and links only |
| `people.json` | by hand |
| `partners.json` | by hand |
| `geo.json` | by hand — where work has run, not reachable market |

`tests/no-banned-claims.test.ts` fails the build on figures this company
cannot evidence, and `tests/ssr-numbers.test.ts` fails it if a headline figure
is missing from the built HTML.

## Analytics

PostHog, US cloud, in the `AgentBase` organisation — its own project, separate
from the product ones, because a company page and a product share no funnel.

`instrumentation-client.ts` boots it, matching kbeauty.market. It earns the
spot twice over here: there is no `app/layout.tsx` to hang a component off, and
mounting one in each of the two locale layouts would be two chances to forget.

The import is dynamic, which is where this departs from kbeauty.market.
posthog-js is about 240 kB, and importing it statically puts all of it in the
chunk the document loads eagerly, next to the hero that waits two animation
frames precisely so it cannot delay the `<h1>`. Measuring the page must not be
the thing that slows it down.

The browser talks to `/ingest` on this origin, rewritten to PostHog in
`next.config.ts` — a request to a posthog.com host is on every ad blocker's
list, and this site's audience runs them. Two things about that are easy to
break silently, so `tests/analytics-proxy.test.ts` holds them: the
`/ingest/static/*` rule has to be matched before the `/ingest/*` catch-all, and
`skipTrailingSlashRedirect` has to stay on, because PostHog posts to `/e/` and
`/flags/` and Next would otherwise answer each event with a 308 first.

Visitors are never identified — there is no sign-in, so `person_profiles` is
`identified_only` and every event bills at the anonymous rate. Persistence is
PostHog's default cookie, which is what makes returning visitors countable;
there is no consent banner, so if EU traffic ever matters, that is the decision
to revisit.

Everything runs on the PostHog for Startups credits, which expire around August
2027. That is a reason to raise the data resolution now — replay retention,
network payloads — on settings that cash alone would not justify later, and not
a reason to spend for its own sake.

Set `NEXT_PUBLIC_POSTHOG_KEY` (see `.env.example`) in Vercel for Production and
Preview. It is inlined at build time, so changing it needs a redeploy. A local
checkout has no key and loads no analytics at all.

## Commands

```bash
pnpm dev        # http://localhost:3000
pnpm verify     # lint · typecheck · test · build
pnpm build && pnpm start
```

Regenerating the land mask (rarely needed — the source data is static):

```bash
pnpm tsx scripts/generate-landmask.ts   # → data/landmask.json
pnpm tsx scripts/measure-svg.ts         # size check for the SVG fallback
```

## Machine-readable

- `/llms.txt`
- `/index.md`, `/ko/index.md` — rendered from the same content modules as the
  HTML, so the two cannot drift apart
- `/data/*.json` — the raw snapshots

## Contact

CEO Sanggen Chang — sangguen@agentba.se
CTO Sejun Kim — sejun@agentba.se
