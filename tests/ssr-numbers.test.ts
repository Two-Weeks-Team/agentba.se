import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The approved landing-page narrative must be present in production HTML.
 *
 * The failure mode this guards against is common enough to have a name in the
 * research: a page whose numbers count up in the browser renders as `0` — or
 * as nothing at all — to a crawler, an OG preview, or an agent. The whole
 * argument of this site is its work, so it cannot live only in the DOM
 * after hydration.
 */
const BUILD = ".next/server/app";

const MUST_APPEAR_EN = [
  "Build a company.",
  "its workforce.",
  "AgentBase builds and operates AI agent fleets for real business operations.",
  "Our goal is to replace human operating labor",
  "A brief goes in.",
  "The video is",
  "Not a blank slate.",
  "A judgment needs evidence.",
  "A choice becomes a brief.",
  "The ambition is",
  "Capabilities",
  "socialseed.ing",
  "Sangguen Chang",
  "Sejun Kim",
  "contact@agentba.se",
  "kbeauty.market",
  "Bring us a job",
  "memex.quest",
  "AgentBase LLC",
  "Closed beta.",
  "Own checkout is not yet enabled.",
];

const MUST_APPEAR_KO = [
  "회사의 일을 맡는", "AI 팀을 만듭니다.",
  "Social Seeding", "Memex", "kbeauty.market", "핵심 기술", "AgentBase LLC",
  "Sangguen Chang", "Sejun Kim", "contact@agentba.se", "2026년 8월", "와이오밍",
];

/** Product-side disclosure that must not reappear on the company page. */
const MUST_NOT_APPEAR = ["Wooliliwoo", "59,498", "7.9%", "sangguen@agentba.se", "sejun@agentba.se"];

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

  it("renders the approved C sections and readable diagram fallbacks without JavaScript", () => {
    for (const [file, locale] of [["index.html", "en"], ["ko.html", "ko"]]) {
    const doc = html(file!);
    for (const id of ["hero", "work", "commerce", "memory", "architecture", "scale", "capabilities", "contact", "company"]) {
      expect(doc).toContain(`id="${id}"`);
    }
    for (const id of ["hero-organization", "stage-organization", "social-demo", "commerce-demo", "memory-demo", "judgment-demo", "delivery-demo"]) {
      expect(doc).toContain(`id="${id}"`);
    }
    expect(doc).toContain(locale === "en" ? "Conceptual company structure" : "AI가 실무를 맡는 회사의 구조");
    expect(doc).toContain(locale === "en" ? "Conceptual task structure" : "한 가지 작업을 처리하는 구조");
    expect(doc).toContain("/landing/init.js");
    expect(doc).not.toContain("This company runs on agents");
    expect(doc).not.toContain("우린 사람을 뽑지 않습니다");
    }
  });

  it("declares the right language per locale", () => {
    expect(html("index.html")).toContain('lang="en"');
    expect(html("ko.html")).toContain('lang="ko"');
  });

  it("marks agents as software, and only the real people as people", () => {
    const doc = html("index.html");
    expect(doc).toContain('"@type":"Organization"');

    // Person entries are legitimate — there are two actual founders. What must
    // never happen is an agent being marked up as one, which would encode the
    // exact confusion this page exists to clear up.
    const personCount = (doc.match(/"@type":"Person"/g) ?? []).length;
    const people = JSON.parse(readFileSync("data/people.json", "utf8"));
    expect(personCount).toBe(people.people.length);
  });
});
