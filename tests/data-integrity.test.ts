import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { home as en } from "../content/en/home";
import { home as ko } from "../content/ko/home";

const fleet = JSON.parse(readFileSync("data/fleet.json", "utf8"));
const replacements = JSON.parse(readFileSync("data/replacements.json", "utf8"));
const pilot = JSON.parse(readFileSync("data/pilot.json", "utf8"));
const geo = JSON.parse(readFileSync("data/geo.json", "utf8"));

describe("fleet", () => {
  it("the roster length matches the published count", () => {
    expect(fleet.agents.length).toBe(fleet.counts.total);
  });

  it("the tier split adds up", () => {
    const by = (t: string) => fleet.agents.filter((a: { tier: string }) => a.tier === t).length;
    expect(by("domain")).toBe(fleet.counts.domain);
    expect(by("meta")).toBe(fleet.counts.meta);
    expect(by("watchdog")).toBe(fleet.counts.watchdog);
    expect(fleet.counts.domain + fleet.counts.meta + fleet.counts.watchdog).toBe(
      fleet.counts.total,
    );
  });

  it("agent ids are unique", () => {
    const ids = fleet.agents.map((a: { id: string }) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every replaced agent exists in the roster", () => {
    const ids = new Set(fleet.agents.map((a: { id: string }) => a.id));
    for (const row of replacements.rows) expect(ids.has(row.agent)).toBe(true);
  });

  it("every ledger row points at a real stage", () => {
    const stages = new Set(fleet.stages.map((s: { id: string }) => s.id));
    for (const row of replacements.rows) expect(stages.has(row.stage)).toBe(true);
  });
});

describe("replacement ledger", () => {
  it("the roster accounts for every agent: replaced plus net-new equals the fleet", () => {
    expect(replacements.rows.length + replacements.netNew).toBe(fleet.counts.total);
  });

  it("keeps the Korean button label from the source document", () => {
    // It is in the source because a Seoul team wrote it. Translating it away
    // would delete the evidence that this is a real internal document.
    const quotes = replacements.rows.map((r: { was: string }) => r.was);
    expect(quotes.some((q: string) => q.includes("AI 작성"))).toBe(true);
  });
});

describe("pilot", () => {
  it("the funnel never grows as it descends", () => {
    const counts = pilot.funnel.map((f: { count: number }) => f.count);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });

  it("the headline matches the last funnel step", () => {
    const last = pilot.funnel.at(-1);
    expect(pilot.headline.verifiedPosts).toBe(last.count);
  });

  it("attainment is derived, not asserted", () => {
    const derived = Math.round((pilot.headline.verifiedPosts / pilot.headline.targetPosts) * 100);
    expect(pilot.headline.attainmentPct).toBe(derived);
  });
});

describe("geo", () => {
  it("operating and market sets do not overlap", () => {
    const op = new Set(geo.operating.map((p: { id: string }) => p.id));
    for (const m of geo.market) expect(op.has(m.id)).toBe(false);
  });

  it("coordinates are on Earth", () => {
    for (const p of [...geo.operating, ...geo.market]) {
      expect(Math.abs(p.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(p.lon)).toBeLessThanOrEqual(180);
    }
  });

  it("market entries cite a user figure, since that is the claim being made", () => {
    for (const m of geo.market) expect(m.tiktokUsersM).toBeGreaterThan(0);
    expect(geo.marketSource.url).toMatch(/^https:\/\//);
  });

  it("exactly one HQ", () => {
    expect(geo.operating.filter((p: { hq?: boolean }) => p.hq).length).toBe(1);
  });
});

describe("i18n", () => {
  /** Structural parity, checked at runtime as well as by the type system. */
  function shape(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(shape);
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, val]) => [k, shape(val)]),
      );
    }
    return typeof v;
  }

  it("Korean has every key English does, and no extras", () => {
    expect(shape(ko)).toEqual(shape(en));
  });

  it("no Korean value was left in English", () => {
    const untranslated: string[] = [];
    const walk = (a: unknown, b: unknown, path: string) => {
      if (typeof a === "string" && typeof b === "string") {
        // Proper nouns and identifiers are meant to match.
        const allow = ["footer.wordmark", "footer.product", "nav.repo", "fleet.groups"];
        if (a === b && a.length > 12 && !allow.some((p) => path.startsWith(p))) {
          untranslated.push(`${path}: ${a}`);
        }
        return;
      }
      if (a && b && typeof a === "object" && typeof b === "object") {
        for (const k of Object.keys(a as object)) {
          walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}${path ? "." : ""}${k}`);
        }
      }
    };
    walk(en, ko, "");
    expect(untranslated, untranslated.join("\n")).toEqual([]);
  });
});
