import { describe, expect, it } from "vitest";
import { renderLandingHtml } from "../lib/landing";
import { translateText, translateHtml, korean } from "../assets/landing/locale-core.mjs";

const structure = (html: string) => [...html.matchAll(/<[^>]+>/g)].map(([tag]) => tag
  .replace(/\b(?:aria-label|alt|title)="[^"]*"/g, "")
  .replace('href="/ko/index.md"', 'href="/index.md"'));

function missingCopy(html: string) {
  const allowed = new Set(['AgentBase', 'Social Seeding ↗', 'Memex ↗', 'kbeauty.market ↗',
    'Google Gemini', 'OpenAI', 'Run', 'Build', 'Prove', 'Run · Build · Prove',
    'Sangguen Chang', 'Sejun Kim', 'contact@agentba.se', 'llms.txt', 'Markdown']);
  const text = [...html.matchAll(/>([^<>]+)</g)].map(match => match[1]!)
    .concat([...html.matchAll(/(?:aria-label|alt|title)="([^"]*)"/g)].map(match => match[1]!));
  return text.map(value => value.replace(/\s+/g,' ').trim())
    .filter(value => /[A-Za-z]{3}/.test(value) && !/[가-힣]/.test(value) && !allowed.has(value));
}

describe("one landing presentation in two languages", () => {
  it("keeps every element, state identifier, link, image and style shared", () => {
    expect(structure(renderLandingHtml("ko"))).toEqual(structure(renderLandingHtml("en")));
    expect(renderLandingHtml("ko")).toContain('href="/ko/index.md"');
  });

  it("provides translated prose and preserves deliberate technical identifiers", () => {
    expect(Object.keys(korean).length).toBeGreaterThan(600);
    expect(translateText("  Build a company.\n", "ko")).toBe("  회사를 세우세요.\n");
    expect(translateText("cargo build --release", "ko")).toBe("cargo build --release");
    expect(translateText("Build a company.", "en")).toBe("Build a company.");
  });

  it("changes human copy without changing URL or data attributes", () => {
    const html = '<a href="/Build a company." data-label="Build a company." aria-label="Build a company.">Build a company.</a>';
    expect(translateHtml(html,"ko")).toBe('<a href="/Build a company." data-label="Build a company." aria-label="회사를 세우세요.">회사를 세우세요.</a>');
  });

  it("rejects old Korean markup instead of treating language alone as parity", () => {
    expect(structure('<main><h1>이 회사는 에이전트로 돌아갑니다.</h1></main>')).not.toEqual(structure(renderLandingHtml("en")));
    expect(renderLandingHtml("ko")).not.toContain("Build a company.");
  });

  it("requires translated copy throughout the server-rendered page", () => {
    expect(missingCopy(renderLandingHtml("ko"))).toEqual([]);
    expect(missingCopy('<p>A newly added untranslated sentence.</p>')).toEqual(['A newly added untranslated sentence.']);
  });
});
