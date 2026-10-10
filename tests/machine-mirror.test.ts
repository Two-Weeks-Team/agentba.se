import { describe, expect, it } from "vitest";
import competitions from "../data/competitions.json";
import { home as en } from "../content/en/home";
import { home as ko } from "../content/ko/home";
import { type Locale } from "../lib/i18n";
import { renderLlmsTxt, renderMarkdown } from "../lib/machine";
import { renderLandingHtml } from "../lib/landing";

/**
 * The `.md` mirrors and the HTML page render from the same content modules and
 * the same JSON, so their *text* cannot drift — there is no second copy to go
 * stale.
 *
 * What can drift is coverage: add a ninth section to the page and forget to
 * wire it into `renderMarkdown`, and the mirror silently omits it. No file
 * hook can catch that — a hook fires when a file is written, and cannot know a
 * section is missing. This can, and CI already gates every pull request.
 */

/** Every section heading the page renders, per locale. */
function sectionEyebrows(content: typeof en): string[] {
  return Object.entries(content)
    .filter(([key]) => key !== "hero" && key !== "nav" && key !== "meta")
    .map(([, value]) =>
      value && typeof value === "object" && "eyebrow" in value
        ? (value as { eyebrow: string }).eyebrow
        : null,
    )
    .filter((v): v is string => typeof v === "string");
}

describe("machine-readable mirrors", () => {
  const byLocale: Record<Locale, typeof en> = { en, ko };

  it("finds the sections it is supposed to check", () => {
    // Guards the guard: if the content shape changes so that no eyebrows are
    // found, this suite would pass vacuously.
    expect(sectionEyebrows(en).length).toBeGreaterThanOrEqual(8);
  });

  it("the English mirror covers the actual production narrative", () => {
    const html = renderLandingHtml();
    const headings = [...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)].map(match =>
      match[1]!.replace(/<br\s*\/?>|<\/span>/g, " ").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
    expect(headings.length).toBeGreaterThanOrEqual(12);
    const md = renderMarkdown("en");
    for (const heading of headings) expect(md).toContain(heading);
    expect(md).not.toContain(en.staffing.h2);
    expect(md).toContain("Google Gemini");
    expect(md).toContain("OpenAI");
  });

  for (const locale of ["ko"] as const) {
    it(`the ${locale} mirror covers every section on the page`, () => {
      const md = renderMarkdown(locale);
      const missing = sectionEyebrows(byLocale[locale]).filter((e) => !md.includes(e));
      expect(
        missing,
        `these sections render on the page but not in /index.md — wire them into lib/machine.ts:\n${missing.join("\n")}`,
      ).toEqual([]);
    });

    it(`the ${locale} mirror carries the headline and the staffing claim`, () => {
      const md = renderMarkdown(locale);
      expect(md).toContain(byLocale[locale].hero.h1);
      expect(md).toContain(byLocale[locale].staffing.h2);
    });
  }

  it("carries the announcement date a judging row is waiting on", () => {
    // The page prints it beside the pending row; a mirror that drops it says
    // less than the page it mirrors, which is the one thing it may not do.
    const pending = competitions.entries.filter((e) => e.announceOn);
    expect(pending.length).toBeGreaterThan(0);
    for (const locale of ["ko"] as const) {
      const md = renderMarkdown(locale);
      for (const e of pending) {
        expect(md, `${locale} mirror omits ${e.id}'s announcement date`).toContain(e.announceOn);
      }
    }
  });

  it("llms.txt points at every published data file", () => {
    const txt = renderLlmsTxt();
    for (const file of [
      "company.json",
      "fleet.json",
      "replacements.json",
      "economics.json",
      "quality.json",
      "products.json",
      "people.json",
      "partners.json",
      "geo.json",
      "portfolio.json",
      "competitions.json",
    ]) {
      expect(txt, `llms.txt does not mention ${file}`).toContain(file);
    }
  });

  it("neither mirror links to the source repository", () => {
    for (const text of [renderLlmsTxt(), renderMarkdown("en"), renderMarkdown("ko")]) {
      expect(text).not.toMatch(/github\.com/i);
    }
  });
});
