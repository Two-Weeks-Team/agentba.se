# agentba.se

AgentBase LLC's company site. The English landing page is served at `/`.
The same landing is served in Korean at `/ko`; both languages share the structure,
styles, media and interactive demonstrations.

## Production page

Next.js 16 and React 19 on Vercel (`2weeks-team/agentbase`). The page narrative is
server-rendered from `content/en/landing.html` through `lib/landing.ts`; it is not
an iframe or a client-only preview. Company identity, two founder profiles, and
product scopes come from `data/*.json`.

The approved design includes the large shared-background Three.js organization,
Social Seeding AI role cards and outreach walkthrough, kbeauty discovery,
Memex recall, Glasshat review, PreviewForge decision handoff, four organization
scopes, capabilities, Run / Build / Prove, and the company footer.

The shared visual system uses a warm paper background, Newsreader display
headings, Inter reading text, and softly framed product demonstrations. Shared
tokens live in `assets/landing/c.css`; the organization and all five demos use
the same palette. Keep monospace type for code and actual technical values.

`assets/landing/` contains the selected design's scripts, styles, referenced
media, vendored Three.js and local fonts. `prebuild` copies that complete set to
`public/landing/`. Read its README for asset provenance and demo limitations.
No archived alternatives or QA screenshots are deployed.

The two locale groups use `components/pages/landing-layout.tsx` and the same
`LandingPage` with a locale. `assets/landing/locales/ko-*.mjs` translate both
server-rendered content and every demo state. Do not restore the legacy Korean
`HomePage` route. The shared demo modules preserve readable text when JavaScript
or WebGL is unavailable.

Korean copy is adapted for Korean readers, not translated sentence by sentence.
Use concrete work, actions and results: AI 팀, 캠페인 요청서, 담당 업무, 담당자 승인.
Keep the English facts and product limitations, but write headings and calls to
action in natural Korean. Read the page and all demo states without the English
beside them; language coverage and layout tests cannot judge comprehension.
`scripts/check-localization.mjs` catches previously rejected literal wording as
well as untranslated UI. The Markdown's featured descriptions need the same review.

## Public facts and machine-readable documents

- `data/company.json`: legal entity, founding month, mission and business model.
- `data/people.json`: both founders' names, roles and LinkedIn URLs.
- `data/products.json` and `data/portfolio.json`: product relationships, public
  links, current scope and historical context.
- `/llms.txt`: company introduction and curated reading index.
- `/index.md`: the production English narrative and featured-work links.
- `/ko/index.md`: the same production narrative translated into Korean.
- `/data/*.json`: dated evidence and explicit scope; historical definitions and
  modeled costs are not claims about live deployments or measured savings.

Only `contact@agentba.se` appears in public contact information. Current fleet
models are Google Gemini and OpenAI. Claude Code integrations in developer tools
are described separately; the page does not claim that Claude powers the fleet.

SEO, company JSON-LD and OG images share `lib/seo.ts`. The 1200 × 630 artwork is
served at `/og/agentbase.png`. See `docs/seo-and-social-cards.md` for maintenance.

## Development and verification

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm verify        # lint, typecheck, production build, then tests
pnpm build && pnpm start
pnpm seo:preview   # regenerate the local C review page from production source
```

Builds generate the local review export under `design-previews/2026-10-10/vision`.
That directory is ignored by Git and is never a production input. Tests require
the built HTML, all runtime assets and generated AI documents; missing targets
fail. A dedicated regression check rejects the previous homepage or a missing
redesign entry module, preventing a preview-only change from being reported as
a deployed redesign.

## Analytics and intake

PostHog is initialized by `instrumentation-client.ts` when
`NEXT_PUBLIC_POSTHOG_KEY` is configured. The `/ingest/static/*` proxy must precede
`/ingest/*`; keep `skipTrailingSlashRedirect` for ingestion POSTs. A build without
the key loads no analytics.

Both landing pages use the shared contact email. The retained `/api/intake`
endpoint uses the server-only `RESEND_API_KEY` to reach both founders; the current
landing pages do not expose its legacy form. Missing delivery configuration returns 503 with the shared email
fallback. Tests mock delivery and never send messages.

## Contact

[contact@agentba.se](mailto:contact@agentba.se)

- [Sangguen Chang](https://www.linkedin.com/in/sgwannabe) — Co-founder · CEO
- [Sejun Kim](https://www.linkedin.com/in/combba) — Co-founder · CTO
