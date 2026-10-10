# agentba.se

AgentBase LLC's company site. The selected C redesign is the production English
homepage at `/`. The existing Korean page remains at `/ko`, with updated company
facts and discovery metadata.

## Production page

Next.js 16 and React 19 on Vercel (`2weeks-team/agentbase`). The page narrative is
server-rendered from `content/en/landing.html` through `lib/landing.ts`; it is not
an iframe or a client-only preview. Company identity, two founder profiles, and
product scopes come from `data/*.json`.

The approved design includes the large shared-background Three.js organization,
Social Seeding AI role cards and outreach walkthrough, kbeauty discovery,
Memex recall, Glasshat review, PreviewForge decision handoff, four organization
scopes, capabilities, Run / Build / Prove, and the company footer.

`assets/landing/` contains the selected design's scripts, styles, referenced
media, vendored Three.js and local fonts. `prebuild` copies that complete set to
`public/landing/`. Read its README for asset provenance and demo limitations.
No archived alternatives or QA screenshots are deployed.

The two locale groups have separate root layouts. Keep the English landing CSS
separate from the legacy Korean styles. The English demo modules load after
hydration and preserve readable text when JavaScript or WebGL is unavailable.

## Public facts and machine-readable documents

- `data/company.json`: legal entity, founding month, mission and business model.
- `data/people.json`: both founders' names, roles and LinkedIn URLs.
- `data/products.json` and `data/portfolio.json`: product relationships, public
  links, current scope and historical context.
- `/llms.txt`: company introduction and curated reading index.
- `/index.md`: the production English narrative and featured-work links.
- `/ko/index.md`: the existing Korean page's text mirror.
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

The new landing page uses the shared contact email. The existing Korean intake
form posts to `/api/intake`, which uses the server-only `RESEND_API_KEY` to reach
both founders. Missing delivery configuration returns 503 with the shared email
fallback. Tests mock delivery and never send messages.

## Contact

[contact@agentba.se](mailto:contact@agentba.se)

- [Sangguen Chang](https://www.linkedin.com/in/sgwannabe) — Co-founder · CEO
- [Sejun Kim](https://www.linkedin.com/in/combba) — Co-founder · CTO
