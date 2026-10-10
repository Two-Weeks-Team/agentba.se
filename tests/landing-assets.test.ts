import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANDING_STYLES, renderLandingHtml } from "../lib/landing";

function files(root: string) {
  return (readdirSync(root, { recursive: true }) as string[]).filter(file => /\.(js|mjs|css|webp|png|svg|ttf|woff2|txt)$/.test(file)).sort();
}

function validateProduction(html: string) {
  for (const style of LANDING_STYLES) expect(html).toContain(`href="/landing/${style}"`);
  expect(html).toContain("/landing/init.js");
  expect(html).toContain(renderLandingHtml());
  expect(html).not.toContain("design-previews/");
  const sourceFiles = files("assets/landing");
  expect(sourceFiles.length).toBeGreaterThan(30);
  expect(files("public/landing")).toEqual(sourceFiles);
  for (const file of sourceFiles) {
    expect(readFileSync(join("public/landing", file)).equals(readFileSync(join("assets/landing", file))), `Missing or stale runtime asset: ${file}`).toBe(true);
  }
  for (const path of [...html.matchAll(/(?:src|href)="(\/landing\/[^"#]+)"/g)].map(match => match[1]!)) {
    expect(readFileSync(`public${path}`).length, path).toBeGreaterThan(0);
  }
}

describe("selected redesign is the deployed homepage", () => {
  it("ships the complete selected HTML, styles, modules, media, and local fonts", () => {
    validateProduction(readFileSync(".next/server/app/index.html", "utf8"));
  });

  it("rejects an old homepage or a missing entry module", () => {
    const html = readFileSync(".next/server/app/index.html", "utf8");
    expect(() => validateProduction('<html><h1>This company runs on agents</h1></html>')).toThrow();
    expect(() => validateProduction(html.replaceAll("/landing/init.js", "/missing.js"))).toThrow();
  });
});
