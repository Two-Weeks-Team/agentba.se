/**
 * PostHog boots here, per the Next.js instrumentation-client convention and to
 * match the sibling repos. Without a key it does nothing at all, so a local
 * checkout builds and runs clean and never writes into the production project.
 *
 * This file is the only sensible home for it here: there is no `app/layout.tsx`
 * to hang a component off, and mounting one in each of the two locale layouts
 * would be two chances to forget.
 *
 * The import is dynamic, which is where this departs from kbeauty.market.
 * posthog-js is about 240 kB, and importing it statically puts every byte of it
 * on the initial path — measured, that is 922 kB of eager JavaScript against
 * 684 kB here. Lighthouse survives either way, so this is not a rescue; it is
 * that the hero already waits two animation frames to keep the `<h1>` first,
 * and a page making that trade should not hand a quarter of a megabyte back to
 * the thing merely watching it.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      // Same-origin path, proxied to PostHog in next.config.ts, so that an ad
      // blocker does not get to decide whether the company can count its own
      // visitors. `ui_host` still names the real host — that is what the
      // toolbar builds its links from, and the proxy would send it nowhere.
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",

      // Nothing here ever calls `identify` — there is no sign-in. Profiles for
      // anonymous visitors would bill at the identified rate and buy nothing;
      // distinct_id still gives unique visitors and funnels.
      person_profiles: "identified_only",
    });
  });
}
