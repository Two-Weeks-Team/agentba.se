# Selected landing page assets

These are the runtime assets for the landing page rendered at `/`. The warm
editorial design uses local Newsreader for headlines, Inter for reading and
controls, and a continuous canvas for the interactive organization models.
`content/en/landing.html` is the committed page narrative. Company and product
facts are synchronized by `lib/landing.ts`. The generated local preview reads
that same source; production never depends on an untracked preview directory.

- `organization-scene.js` and `organization-blueprint.mjs`: interactive conceptual
  task, role, department and company diagrams; not live business telemetry.
- `progression.js`: advances the four scopes every two seconds while visible.
  Hovering the tabs or using keyboard navigation pauses the sequence; leaving
  resumes with a full interval. Walkthrough playback and diagram motion have
  separate controls; reduced-motion preference stops both.
- `auto-advance.js`: shared two-second playback for all five product demos.
  Social Seeding cycles through all three steps for each persona; Glasshat
  includes all six perspectives. Kbeauty, Memex and PreviewForge show every view.
  Hovering or keyboard interaction pauses a demo; a separate pause control also
  sits above each demo, alongside a two-second progress indicator. Expanded
  detail stays open for reading. Offscreen/background demos and reduced-motion users
  do not auto-advance. Automatic changes never move focus, announce live-region
  content, follow external links, download files, or execute real work.
- `social-work.js`: illustrative workflows and AI persona portraits from the
  team's social-seeding-v2 interface. Drafts are unsent examples. Role buttons
  do not invoke agents or send outreach.
- `commerce-work.js`: clip-first discovery with an original silent 3D product
  film and the kbeauty.market repository's generated sample stills. The film
  autoplays only while visible; reduced-motion users can start it manually.
  The film keeps looping as adjacent product explanations advance. The sample is
  not customer footage or a review. Source: `scripts/commerce-film.html`.
- `memory-work.js`: synthetic Memex session and source-turn walkthrough. The
  visible replay capture is a product interface reference. Frame visibility and
  shared sizing travel with the JavaScript so older CSS cannot stack all steps.
- `reserve-space.js`: measures all content states at the current width to keep
  mobile layouts stable without clipping content. Font loading and resizing
  trigger a fresh measurement.
- `media/social/campaign-intake.png`: original NewCampaignForm UI rendered
  locally from social-seeding-v2 commit 3b22f09; unfilled example fields, no
  customer or campaign data.
- `foundation-work.js`: Glasshat review and PreviewForge decision-to-brief
  interactions, with links to public demonstrations in the page.

## Walkthrough verification

Import `scripts/check-walkthroughs.mjs` into an existing ego-browser Page session.
`checkWalkthroughStates(page)` checks all 43 states for stable height, overflow,
and top playback controls. Run it at narrow mobile, tablet, and desktop widths.
The timing, pause, expanded-detail, and film checks cover the two-second pace,
hover release, explicit controls, continuous video, and reduced-motion behavior.
`rejectFastInterval(page)` confirms that one-second playback fails the check.

`node scripts/check-deployment.mjs <base-url> <report-path>` verifies published
documents and runtime asset hashes, including video files and range responses.

Only referenced runtime media is published. Alternative designs, working
captures and research notes remain local under `design-previews` and `docs`.
Three.js and font licenses are included beside their assets. Fonts and runtime
modules are served from the company domain; there is no CDN requirement.
Newsreader's pinned source and reproducible static-font conversion are recorded
in `assets/fonts/Newsreader-SOURCE.txt`. Use the shared page color and typography
tokens when updating demos; product code samples may keep their monospace type.
