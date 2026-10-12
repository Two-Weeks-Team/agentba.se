import { describe, expect, it } from "vitest";
import { home as en } from "../content/en/home";
import { home as ko } from "../content/ko/home";
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

describe("machine-readable mirrors", () => {
  for (const locale of ["en", "ko"] as const) {
    it(`the ${locale} mirror covers the actual production narrative`, () => {
      const html = renderLandingHtml(locale);
      const headings = [...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)].map(match =>
        match[1]!.replace(/<br\s*\/?>|<\/span>/g, " ").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
      expect(headings.length).toBeGreaterThanOrEqual(12);
      const md = renderMarkdown(locale);
      for (const heading of headings) expect(md).toContain(heading);
      expect(md).not.toContain(en.staffing.h2);
      expect(md).not.toContain(ko.staffing.h2);
      expect(md).toContain("Google Gemini");
      expect(md).toContain("OpenAI");
    });
  }

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
