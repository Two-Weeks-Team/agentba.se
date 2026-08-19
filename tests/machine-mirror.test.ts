import { describe, expect, it } from "vitest";
import { home as en } from "../content/en/home";
import { home as ko } from "../content/ko/home";
import { LOCALES, type Locale } from "../lib/i18n";
import { renderLlmsTxt, renderMarkdown } from "../lib/machine";

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

  for (const locale of LOCALES) {
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

  it("llms.txt points at every published data file", () => {
    const txt = renderLlmsTxt();
    for (const file of [
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
