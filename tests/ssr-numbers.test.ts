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
  "We don&#x27;t hire people. We build agents.",
  "the human clicking Search + Step 2",
  "AI 작성", // present in both locales: quoted verbatim from the source
  "approveBudget",
  "3,000",
  "Seoul",
  "Ulaanbaatar",
  "socialseed.ing",
  "ElevenLabs Grants",
  "sangguen@agentba.se",
  "sejun@agentba.se",
  "teslam.io",
  "kbeauty.market",
  "Gradient AI Hackathon",
  "Honorable Mention",
  "One line is enough.",
  "memex.quest",
];

const MUST_APPEAR_KO = [
  "이 회사는 에이전트로 돌아갑니다",
  "우린 사람을 뽑지 않습니다",
  "AI 작성",
  "approveBudget",
  "sejun@agentba.se",
  "미수상",
  "한 줄이면 충분합니다.",
];

/** Product-side disclosure that must not reappear on the company page. */
const MUST_NOT_APPEAR = ["Wooliliwoo", "59,498", "7.9%"];

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

  it("does not leak product-side disclosure into the built page", () => {
    for (const doc of [html("index.html"), html("ko.html")]) {
      const leaked = MUST_NOT_APPEAR.filter((s) => doc.includes(s));
      expect(leaked, `product disclosure on a company page: ${leaked.join(", ")}`).toEqual([]);
    }
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

  it("marks agents as software, and only the real people as people", () => {
    const doc = html("index.html");
    expect(doc).toContain("SoftwareApplication");

    // Person entries are legitimate — there are two actual founders. What must
    // never happen is an agent being marked up as one, which would encode the
    // exact confusion this page exists to clear up.
    const personCount = (doc.match(/"@type":"Person"/g) ?? []).length;
    const people = JSON.parse(readFileSync("data/people.json", "utf8"));
    expect(personCount).toBe(people.people.length);
  });
});
