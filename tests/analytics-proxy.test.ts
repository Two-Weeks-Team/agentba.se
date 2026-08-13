import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

/**
 * The analytics proxy fails silently, which is why it is worth a test.
 *
 * Every request PostHog makes goes to `/ingest` on this origin, so that an ad
 * blocker cannot quietly decide the company may not count its own visitors.
 * Nothing on the page changes if that path stops resolving — no error, no
 * missing pixel, just a dashboard that flattens to zero and a fortnight before
 * anyone notices. The two ways it breaks are both invisible in review: the
 * rewrite rules get reordered, or `api_host` in instrumentation-client.ts
 * drifts away from the prefix the rules serve.
 */

/** The rewrite rules, in the order Next will try to match them. */
async function rules() {
  const rewrites = await nextConfig.rewrites!();
  // The array form is what this config returns; the object form would mean
  // someone restructured it into beforeFiles/afterFiles and the assumptions
  // about ordering below need re-reading.
  expect(Array.isArray(rewrites), "rewrites() no longer returns a flat array").toBe(true);
  return rewrites as { source: string; destination: string }[];
}

describe("the PostHog proxy", () => {
  it("routes the static bundle before the catch-all", async () => {
    const sources = (await rules()).map((r) => r.source);
    const staticRule = sources.indexOf("/ingest/static/:path*");
    const catchAll = sources.indexOf("/ingest/:path*");

    expect(staticRule, "the /ingest/static rule is gone").toBeGreaterThanOrEqual(0);
    expect(catchAll, "the /ingest catch-all is gone").toBeGreaterThanOrEqual(0);
    expect(
      staticRule,
      "/ingest/:path* now shadows /ingest/static/:path*, so posthog-js loads from the ingestion host and never boots",
    ).toBeLessThan(catchAll);
  });

  it("sends the bundle and the events to their separate hosts", async () => {
    const bySource = new Map((await rules()).map((r) => [r.source, r.destination]));
    expect(bySource.get("/ingest/static/:path*")).toBe(
      "https://us-assets.i.posthog.com/static/:path*",
    );
    expect(bySource.get("/ingest/:path*")).toBe("https://us.i.posthog.com/:path*");
  });

  it("keeps the .md mirrors ahead of the catch-all", async () => {
    // `/ingest/:path*` is broad. If it ever moves above these, the mirrors
    // start proxying to PostHog instead of rendering.
    const sources = (await rules()).map((r) => r.source);
    const catchAll = sources.indexOf("/ingest/:path*");
    for (const mirror of ["/index.md", "/ko/index.md"]) {
      expect(sources.indexOf(mirror), `${mirror} is gone`).toBeGreaterThanOrEqual(0);
      expect(sources.indexOf(mirror)).toBeLessThan(catchAll);
    }
  });

  it("does not redirect the trailing-slash ingestion paths", () => {
    // PostHog posts to `/e/` and `/flags/`. Without this, Next answers each
    // one with a 308 and every event pays for a redirect first.
    expect(nextConfig.skipTrailingSlashRedirect).toBe(true);
  });

  it("asks for the same prefix the rules serve", () => {
    // Read as text rather than imported: the module boots posthog-js on import,
    // which expects a browser and would not survive a node environment.
    const src = readFileSync(new URL("../instrumentation-client.ts", import.meta.url), "utf8");
    expect(src, "instrumentation-client.ts no longer points api_host at /ingest").toContain(
      'api_host: "/ingest"',
    );
    expect(src, "the ui_host must name the real PostHog host, not the proxy").toContain(
      'ui_host: "https://us.posthog.com"',
    );
  });

  it("keeps posthog-js off the critical path", () => {
    // A static import puts ~240 kB in the chunk the document loads eagerly,
    // beside the hero that defers itself two frames to protect the `<h1>`.
    const src = readFileSync(new URL("../instrumentation-client.ts", import.meta.url), "utf8");
    expect(src, "posthog-js is imported statically again").not.toMatch(
      /^\s*import\s+.*\bfrom\s+["']posthog-js["']/m,
    );
    expect(src).toContain('import("posthog-js")');
  });
});
