# Company discovery and social previews

The Next.js application and the selected C redesign share the verified facts in
`data/company.json` and `data/people.json`, and the metadata/schema helpers in
`lib/seo.ts`. Keep visible company information, the JSON-LD and AI documents in
agreement. Founding month is known; a day or street address is not.

The selected C design is the production English homepage. Its source is
`content/en/landing.html`, with company facts rendered by `lib/landing.ts` and
runtime assets in `assets/landing`. The C review page under `design-previews`
is a generated export, never a production input. The Korean route retains its
existing layout and its updated company facts.

## Social artwork

- `components/og-card.tsx` renders the English artwork for both locales.
- `public/og/agentbase.png` is the 1200 × 630 PNG used by explicit metadata.
- Next.js also generates locale-specific Open Graph image routes from the same
  component. All three image responses should be identical.
- Fonts are local. Newsreader 400 and Inter 400 use pinned official Google Fonts
  sources, with OFL licenses and reproducible conversion notes in `assets/fonts`.
  The landing page preloads its Newsreader WOFF2 and existing Inter WOFF2. The OG
  renderer uses static TTF instances of those families.
- The static diagram uses the interactive hero's geometry. If geometry changes,
  run `node scripts/render-og-organization.mjs` before regenerating the card.
  Keep its olive/stone palette and wordmark aligned with the English page.

```sh
pnpm og:generate
pnpm seo:preview
pnpm verify
```

The first two commands are also run automatically before development and
production builds. The second exports the production page, runtime assets,
image and public data, writes the shared Markdown mirrors, and generates
`vision/og-preview.html`. It is safe to repeat. The preview is a simulation of a
large image link card, not a claim about a particular platform's cached result.

## Machine-readable information

`/llms.txt` introduces the legal entity, both founders and the shared business
contact, then links directly to the two featured products, Memex and Preview
Forge. The long-term mission follows the current work. Google Gemini and
OpenAI remain the stated operating-fleet models; Claude Code integrations are
described as developer tools. Do not add application-pitch text or imply that
Anthropic requires this file or uses it to decide program admission.

The index links to fourteen internal resources: the homepage, two Markdown
pages and eleven company/data documents. `landmask.json` is drawing geometry,
not an AI reading reference. The English page and C preview share the same Markdown narrative and
featured-work links. Its Korean mirror
still represents the existing Korean application, not a translated C layout.

`data/people.json` contains public names, roles and LinkedIn profiles only.
Individual intake delivery addresses live in the server-side API route;
public pages, error states, Markdown, JSON and browser bundles expose only
`contact@agentba.se`. Both export scripts replace their generated data
directories so deleted source files cannot remain publicly available.

Product scope and the AgentBase LLC/E Corp. relationship are recorded in
`data/products.json`. The production page and C preview synchronize corresponding visible
paragraphs from that data. E Corp. is a separate subsidiary, not a retired
name for AgentBase. Source-defined agent roles are not live deployment counts.
Economics is a dated model, and pre-incorporation projects and competitions
belong to the team's history. Do not attach those earlier awards to the LLC
in organization schema. Preserve original capture dates when clarifying copy;
only a new measurement or evidence check justifies a new evidence date.

Company content's update date is committed explicitly, so rebuilding alone
does not change sitemap dates. The current Anthropic crawler names are
explicitly allowed in `robots.txt`; access permission does not establish that
a crawler visits, indexes or reviews the company.

## Verification scope

Regression tests require the built English/Korean pages and the C preview;
missing artifacts fail instead of skipping a target. They check canonical and
language links, metadata, both founders, contact details, company JSON-LD,
Markdown identity and PNG dimensions. Negative cases remove the image, replace
a founder and corrupt the country code to confirm that invalid output fails.

The AI-discovery suite checks all linked documents, every exported JSON file,
both generated indexes, client bundles and the reusable redesign content.
Negative cases inject individual emails, remove a resource and swap a
subsidiary into the parent legal-name field. A mocked intake test confirms
that the existing two delivery recipients are preserved without sending mail.

The production migration adds a regression check requiring the approved C
markup, all seven stylesheets, the runtime entry module and every selected
media/font/script file in the built output. Negative cases reject the old
homepage and a missing entry module. Public contact checks also decode RSC
Unicode escapes before inspecting serialized HTML.

Before each release, run `pnpm verify`, inspect desktop/mobile screenshots of
the built homepage and exercise every demonstration. After deployment, check
the actual domain, linked AI documents, runtime assets and social images.
Search Console indexing and external social-platform caches are separate from
successful HTTP responses; neither is implied by these checks.
