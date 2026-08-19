import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { home as en } from "../content/en/home";
import { home as ko } from "../content/ko/home";

const fleet = JSON.parse(readFileSync("data/fleet.json", "utf8"));
const replacements = JSON.parse(readFileSync("data/replacements.json", "utf8"));
const geo = JSON.parse(readFileSync("data/geo.json", "utf8"));
const people = JSON.parse(readFileSync("data/people.json", "utf8"));
const products = JSON.parse(readFileSync("data/products.json", "utf8"));
const competitions = JSON.parse(readFileSync("data/competitions.json", "utf8"));
const portfolio = JSON.parse(readFileSync("data/portfolio.json", "utf8"));

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

describe("geo", () => {
  it("coordinates are on Earth", () => {
    for (const p of geo.operating) {
      expect(Math.abs(p.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(p.lon)).toBeLessThanOrEqual(180);
    }
  });

  it("exactly one HQ", () => {
    expect(geo.operating.filter((p: { hq?: boolean }) => p.hq).length).toBe(1);
  });

  it("claims only places where work has run — no reachable-market tier", () => {
    // Market sizing is a product's argument, and mixing it into a list titled
    // "where we operate" would turn reach into a claim of work already done.
    expect(geo.market).toBeUndefined();
  });
});

describe("people", () => {
  it("everyone has a role, both names, and an agentba.se address", () => {
    for (const p of people.people) {
      expect(p.role).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.nameKo).toBeTruthy();
      expect(p.email).toMatch(/@agentba\.se$/);
    }
  });

  it("the headline people count matches the roster", () => {
    const stat = en.hero.stats.find((s) => s.label === "people");
    expect(stat?.value).toBe(String(people.people.length));
  });
});

describe("products", () => {
  it("links out rather than arguing here", () => {
    for (const p of products.products) {
      expect(p.url).toMatch(/^https:\/\//);
      expect(p.one.en.length).toBeGreaterThan(20);
      expect(p.one.ko.length).toBeGreaterThan(10);
    }
  });
});

describe("competitions", () => {
  /** The five outcomes the ledger knows how to render. */
  const RESULTS = ["won", "hm", "selected", "entered", "pending"];

  type Link = { label: string; url: string };
  type Entry = {
    id: string;
    date: string;
    result: string;
    prize?: { en: string; ko: string };
    note?: { en: string; ko: string };
    announceOn?: string;
    links: Link[];
  };
  const entries: Entry[] = competitions.entries;

  it("entry ids are unique", () => {
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every row carries a result the ledger knows", () => {
    // A misspelled result drops the row out of every filter below — including
    // the ones that decide which rows have to show their evidence.
    for (const e of entries) {
      expect(RESULTS, `${e.id} has an unknown result "${e.result}"`).toContain(e.result);
    }
  });

  it("dates are YYYY-MM and never go backwards", () => {
    // The ledger is read top to bottom as a chronology; a row out of order
    // reads as a gap in the record rather than as a sorting mistake.
    let previous = "";
    for (const e of entries) {
      expect(e.date, `${e.id} has a malformed date`).toMatch(/^\d{4}-\d{2}$/);
      expect(e.date >= previous, `${e.id} (${e.date}) sorts before ${previous}`).toBe(true);
      previous = e.date;
    }
  });

  it("a win or an honorable mention shows the prize and the official announcement", () => {
    // A ribbon claimed without the organizer's own winners page is exactly the
    // kind of claim this site refuses to publish, and a prize written in only
    // one locale is a prize half the readers cannot check.
    for (const e of entries.filter((x) => x.result === "won" || x.result === "hm")) {
      expect(e.prize?.en, `${e.id} claims ${e.result} with no English prize`).toBeTruthy();
      expect(e.prize?.ko, `${e.id} claims ${e.result} with no Korean prize`).toBeTruthy();
      const winners = e.links.filter((l) => l.label === "winners");
      expect(
        winners.length,
        `${e.id} claims ${e.result} with no "winners" link to the announcement`,
      ).toBeGreaterThan(0);
    }
  });

  it("a selected row discloses that it rests on our own records", () => {
    // Selection with no public roster is self-attribution. It may be published,
    // but only alongside the sentence that says so — in both locales.
    for (const e of entries.filter((x) => x.result === "selected")) {
      expect(e.note?.en, `${e.id} is self-attributed with no English note`).toBeTruthy();
      expect(e.note?.ko, `${e.id} is self-attributed with no Korean note`).toBeTruthy();
    }
  });

  it("a pending row names the date it gets settled", () => {
    // Without a date, "pending" never expires, and an entry that was never
    // judged keeps reading like a result still on its way.
    for (const e of entries.filter((x) => x.result === "pending")) {
      expect(e.announceOn, `${e.id} is pending with no announcement date`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
    }
  });

  it("every link is https and none points at the source repository", () => {
    // The mirrors ban github.com; the data must not smuggle it back in.
    for (const e of entries) {
      for (const l of e.links) {
        expect(l.url, `${e.id} → ${l.label} is not https`).toMatch(/^https:\/\//);
        expect(l.url, `${e.id} → ${l.label} links the repository`).not.toMatch(/github\.com/i);
      }
    }
  });

  it("the asides are written in both locales", () => {
    for (const key of ["judge", "hosted"] as const) {
      expect(competitions.aside[key]?.en, `aside.${key} has no English`).toBeTruthy();
      expect(competitions.aside[key]?.ko, `aside.${key} has no Korean`).toBeTruthy();
    }
  });
});

describe("portfolio", () => {
  type Link = { label: string; url: string };
  type Row = { id: string; one: { en: string; ko: string }; links?: Link[] };
  const entries: Row[] = portfolio.entries;
  const mentions: Row[] = portfolio.mentions;
  const rows = [...entries, ...mentions];

  it("ids are unique across entries and mentions", () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry can be checked without taking our word for it", () => {
    // The section states that rule in its own copy. An entry with nothing to
    // click asks for exactly the trust the rule refuses to ask for.
    for (const e of entries) {
      expect(e.links?.length ?? 0, `${e.id} has no link a reader can follow`).toBeGreaterThan(0);
    }
  });

  it("every line exists in both locales", () => {
    for (const r of rows) {
      expect(r.one?.en?.trim(), `${r.id} is missing its English line`).toBeTruthy();
      expect(r.one?.ko?.trim(), `${r.id} is missing its Korean line`).toBeTruthy();
    }
  });

  it("every entry names a platform the grid can be scanned by", () => {
    // A free-text platform would drift into twelve one-off spellings, which
    // reads as noise rather than as an axis. New values are welcome; they just
    // have to be added here first, deliberately.
    const KNOWN = ["web", "macOS", "iOS", "Claude Code", "GitLab", "Reddit"];
    for (const e of entries as Array<Row & { platform?: string }>) {
      expect(KNOWN, `${e.id} has an unknown platform: ${e.platform}`).toContain(e.platform);
    }
  });

  it("every link is https and none points at the source repository", () => {
    for (const r of rows) {
      for (const l of r.links ?? []) {
        expect(l.url, `${r.id} → ${l.label} is not https`).toMatch(/^https:\/\//);
        expect(l.url, `${r.id} → ${l.label} links the repository`).not.toMatch(/github\.com/i);
      }
    }
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
        // Proper nouns and identifiers are meant to match. "Honorable Mention"
        // is the award's name in both locales, and an email placeholder is not
        // prose in either.
        const allow = [
          "footer.wordmark",
          "footer.product",
          "nav.repo",
          "fleet.groups",
          "record.results.hm",
          "intake.emailPlaceholder",
        ];
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
