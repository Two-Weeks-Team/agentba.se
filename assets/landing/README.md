# Selected landing page assets

These are the runtime assets for the approved C redesign, now rendered at `/`.
`content/en/landing.html` is the committed page narrative. Company and product
facts are synchronized by `lib/landing.ts`. The generated local preview reads
that same source; production never depends on an untracked preview directory.

- `organization-scene.js` and `organization-blueprint.mjs`: interactive conceptual
  task, role, department and company diagrams; not live business telemetry.
- `social-work.js`: illustrative workflows and AI persona portraits from the
  team's social-seeding-v2 interface. Drafts are unsent examples. Role buttons
  do not invoke agents or send outreach.
- `commerce-work.js`: clip-first discovery illustrated with the kbeauty.market
  repository's generated sample stills. The code records the source commit and
  component paths. The demo makes no checkout or real-video-playback claim.
- `memory-work.js`: synthetic Memex session and source-turn walkthrough. The
  linked replay capture is a product interface reference.
- `foundation-work.js`: Glasshat review and PreviewForge decision-to-brief
  interactions, with links to public demonstrations in the page.

Only referenced runtime media is published. Alternative designs, working
captures and research notes remain local under `design-previews` and `docs`.
Three.js and font licenses are included beside their assets. Fonts and runtime
modules are served from the company domain; there is no CDN requirement.
