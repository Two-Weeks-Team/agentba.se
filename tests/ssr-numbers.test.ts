import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Every headline figure must be present in the built HTML.
 *
 * The failure mode this guards against is common enough to have a name in the
 * research: a page whose numbers count up in the browser renders as `0` — or
 * as nothing at all — to a crawler, an OG preview, or an agent. The whole
 * argument of this site is its figures, so they cannot live only in the DOM
 * after hydration.
 */
const BUILD = ".next/server/app";

const MUST_APPEAR_EN = [
  "This company runs on agents",
  "59,498",
  "7.9%",
  "the human clicking Search + Step 2",
  "AI 작성", // present in both locales: quoted verbatim from the source
  "approveBudget",
  "3,000",
  "Wooliliwoo",
  "Seoul",
  "Ulaanbaatar",
];

const MUST_APPEAR_KO = ["이 회사는 에이전트로 돌아갑니다", "59,498", "AI 작성", "approveBudget"];

function html(file: string): string {
  const path = `${BUILD}/${file}`;
  if (!existsSync(path)) {
    throw new Error(`${path} not found — run \`pnpm build\` before this test`);
  }
  return readFileSync(path, "utf8");
}

// Deliberately not skipped when the build is missing. A test that silently
// disappears is worse than one that fails loudly, and this is the check that
// keeps the whole argument of the page out of client-only rendering.
describe("server-rendered figures", () => {
  it("the English page carries every headline figure in its HTML", () => {
    const doc = html("index.html");
    const missing = MUST_APPEAR_EN.filter((s) => !doc.includes(s));
    expect(missing, `missing from server-rendered HTML: ${missing.join(", ")}`).toEqual([]);
  });

  it("the Korean page carries its figures too", () => {
    const doc = html("ko.html");
    const missing = MUST_APPEAR_KO.filter((s) => !doc.includes(s));
    expect(missing, `missing from server-rendered HTML: ${missing.join(", ")}`).toEqual([]);
  });

  it("renders a map without JavaScript", () => {
    const doc = html("index.html");
    // The static SVG carries the whole world as one path.
    expect(doc).toContain("viz-static");
    expect(doc).toMatch(/<path d="m[-\d]/);
  });

  it("declares the right language per locale", () => {
    expect(html("index.html")).toContain('lang="en"');
    expect(html("ko.html")).toContain('lang="ko"');
  });

  it("does not mark agents up as people", () => {
    const doc = html("index.html");
    expect(doc).toContain("SoftwareApplication");
    expect(doc).not.toContain('"@type":"Person"');
  });
});
