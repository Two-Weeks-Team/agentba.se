# agentba.se

The AgentBase company site. One page, English at `/` and Korean at `/ko`.

Its only job is to show how the company operates. Products are sold on their
own sites.

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
| `pilot.json` | frozen — a completed campaign is a historical record |
| `economics.json` | by hand; `scopeNote` is a required field |
| `replacements.json` | by hand, quoted verbatim from the source roster |
| `geo.json` | by hand |

`tests/no-banned-claims.test.ts` fails the build on figures this company
cannot evidence, and `tests/ssr-numbers.test.ts` fails it if a headline figure
is missing from the built HTML.

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

sejun@2weeks.co
