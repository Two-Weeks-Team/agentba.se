import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The requirements this site was built under, enforced as a test rather than
 * documented as a convention. A rule that only lives in a design doc gets
 * broken by whoever edits the copy six months from now.
 */

/**
 * Figures that appeared in earlier marketing copy with nothing behind them,
 * and which contradict what this company can actually evidence.
 */
const BANNED_CLAIMS: Array<[RegExp, string]> = [
  [/\b500\+?\s*(active\s+)?users?\b/i, "unsourced user count from earlier landing copy"],
  [/\b10\s?K\+?\s*(emails?|sent)\b/i, "unsourced email volume from earlier landing copy"],
  [/\b85\s?%\s*(response|reply)\b/i, "unsourced response rate from earlier landing copy"],
  [/\b4\.9\s?\/\s?5\b/, "unsourced satisfaction score"],
  [/\b68\s?%\s*reply\b/i, "reply rate with no source"],
  [/\bSpanner\b/i, "architecture that is not an approved deployment path"],
  [/\b99\.99\s?%\b/, "SLO we do not operate against"],
  [/\bmulti[-\s]region\b/i, "architecture that is not an approved deployment path"],
];

/** The company presents as AgentBase. The prior legal styling is retired. */
const RETIRED_ENTITY: Array<[RegExp, string]> = [
  [/\bE[\s-]?Corp\b/i, "retired entity styling"],
  [/이\s*주식회사/, "retired entity styling"],
];

/**
 * This is a company page, not a product page.
 *
 * Customer names and campaign results are a product's argument to make on its
 * own site. Publishing one campaign's numbers here invites the reader to size
 * the company by that campaign, which is not what the page is for.
 */
const PRODUCT_SPECIFICS: Array<[RegExp, string]> = [
  [/wooliliwoo/i, "customer/campaign codename"],
  [/\b59[,.]?498\b/, "campaign view count"],
  [/\b7\.9\s?%/, "campaign engagement rate"],
  // The count, not the phrase: "final sign-off on a verified post" is a gate
  // description and belongs here.
  [/\b\d+\s+verified posts?\b/i, "campaign outcome metric"],
  [/검증된 포스팅\s*\d|\d\s*건의? 검증된 포스팅/, "campaign outcome metric"],
  [/\bK-?beauty\b/i, "product vertical"],
  [/tiktokUsersM/, "reachable-market sizing — that argument belongs to the product"],
];

/** The economics comparison is meaningless without its scope. */
const SCOPE_HARDCODES = ["2,400", "2400"];

const ROOTS = ["app", "components", "content", "data", "lib"];
const EXT = /\.(ts|tsx|json|css|md)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.test(entry)) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(r)).filter(
  // This file names the patterns it bans, and the mask is generated binary.
  (f) => !f.includes("no-banned-claims") && !f.endsWith("landmask.json"),
);

describe("no banned claims", () => {
  it("scans a non-trivial number of files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const [pattern, why] of [...BANNED_CLAIMS, ...RETIRED_ENTITY, ...PRODUCT_SPECIFICS]) {
    it(`never says ${pattern} — ${why}`, () => {
      const hits: string[] = [];
      for (const file of files) {
        const lines = readFileSync(file, "utf8").split("\n");
        lines.forEach((line, i) => {
          if (pattern.test(line)) hits.push(`${file}:${i + 1}  ${line.trim()}`);
        });
      }
      expect(hits, `banned on a company page:\n${hits.join("\n")}`).toEqual([]);
    });
  }
});

describe("economics scope note", () => {
  const economics = JSON.parse(readFileSync("data/economics.json", "utf8"));

  it("carries a scope note in both locales", () => {
    expect(economics.scopeNote?.en?.length).toBeGreaterThan(40);
    expect(economics.scopeNote?.ko?.length).toBeGreaterThan(20);
  });

  it("states what is excluded", () => {
    expect(economics.scopeNote.en.toLowerCase()).toContain("pass");
    expect(economics.excluded?.passThroughUsd).toBeGreaterThan(0);
  });

  it("never hardcodes the figure away from its scope note", () => {
    const section = readFileSync("components/sections/economics.tsx", "utf8");
    expect(section).toContain("scopeNote");
    for (const figure of SCOPE_HARDCODES) {
      if (section.includes(figure)) {
        throw new Error(
          `components/sections/economics.tsx hardcodes ${figure}; render it from data/economics.json so the scope note cannot be separated from it`,
        );
      }
    }
  });
});
