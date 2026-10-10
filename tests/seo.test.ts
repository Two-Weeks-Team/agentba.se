import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import company from "../data/company.json";
import people from "../data/people.json";
import sitemap from "../app/sitemap";
import { renderLlmsTxt, renderMarkdown } from "../lib/machine";
import { serializeJsonLd } from "../lib/seo";

const sources = [
  { name: "English application", file: ".next/server/app/index.html", canonical: "https://agentba.se/" },
  { name: "Korean application", file: ".next/server/app/ko.html", canonical: "https://agentba.se/ko" },
  { name: "C redesign", file: "design-previews/2026-10-10/vision/c.html", canonical: "https://agentba.se/" },
];
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
function attr(tag: string, key: string) {
  return decode(tag.match(new RegExp(`\\b${key}="([^"]*)"`, "i"))?.[1] ?? "");
}
function meta(html: string, key: string) {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  return tags.filter(tag => attr(tag, "name") === key || attr(tag, "property") === key).map(tag => attr(tag, "content"));
}
function links(html: string, rel: string) {
  return (html.match(/<link\b[^>]*>/g) ?? []).filter(tag => attr(tag, "rel") === rel);
}
function validateHead(html: string, canonical: string) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1];
  expect(head, "missing document head").toBeTruthy();
  expect((head!.match(/<title>/g) ?? []).length).toBe(1);
  expect(meta(head!, "description")).toHaveLength(1);
  expect(meta(head!, "description")[0]).toContain("AgentBase LLC");
  expect(links(head!, "canonical").map(tag => new URL(attr(tag, "href")).href)).toEqual([canonical]);
  expect(meta(head!, "og:url").map(url => new URL(url).href)).toEqual([canonical]);
  expect(meta(head!, "og:type")).toEqual(["website"]);
  expect(meta(head!, "og:title")[0]).toContain("Deploy its workforce");
  expect(meta(head!, "og:image")).toHaveLength(1);
  expect(meta(head!, "og:image")[0]).toMatch(/^https:\/\/agentba\.se\//);
  expect(meta(head!, "og:image:width")).toEqual(["1200"]);
  expect(meta(head!, "og:image:height")).toEqual(["630"]);
  expect(meta(head!, "og:image:alt")[0]).toContain("agent departments");
  expect(meta(head!, "twitter:card")).toEqual(["summary_large_image"]);
  expect(meta(head!, "twitter:image")[0]).toMatch(/^https:\/\/agentba\.se\//);
  expect(meta(head!, "robots")[0]).toContain("max-image-preview:large");
  expect(meta(head!, "robots")[0]).not.toContain("noindex");
  const alternates = links(head!, "alternate");
  for (const language of ["en", "ko", "x-default"]) {
    expect(alternates.filter(tag => attr(tag, "hreflang") === language)).toHaveLength(1);
  }
  expect(alternates.some(tag => attr(tag, "type") === "text/markdown")).toBe(true);
  expect(links(head!, "describedby").some(tag => attr(tag, "href").endsWith("/llms.txt"))).toBe(true);
}
function validateCompany(html: string) {
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  expect(scripts.length, "missing JSON-LD").toBeGreaterThan(0);
  const graph = scripts.flatMap(match => JSON.parse(match[1]!)["@graph"]);
  const organizations = graph.filter(node => node["@type"] === "Organization");
  expect(organizations).toHaveLength(1);
  const organization = organizations[0];
  expect(organization.legalName).toBe("AgentBase LLC");
  expect(organization.email).toBe("contact@agentba.se");
  expect(organization.description).toContain("August 2026");
  expect(organization.location.identifier).toBe("US");
  expect(organization.foundingLocation).toBeUndefined();
  expect(organization.sameAs).toBeUndefined(); // Product domains are not company profiles.
  expect(organization.founder).toHaveLength(2);
  for (const person of people.people) {
    const founder = organization.founder.find((p: { name: string }) => p.name === person.name);
    expect(founder?.sameAs).toContain(person.linkedin);
    expect(html).toContain(`href="${person.linkedin}"`);
  }
  expect(html).toContain('href="mailto:contact@agentba.se"');
  expect(html).toContain(company.identity);
  expect(html).toContain(company.business);
  expect(html).not.toContain("applying to build our next fleet generation on Claude");
}
function imageDimensions(path: string) {
  const png = readFileSync(path);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

describe("public SEO and company identity", () => {
  for (const source of sources) {
    it(`${source.name} exposes share metadata and verified company facts without JavaScript`, () => {
      // Missing build/preview files fail; this must never silently skip a target.
      const html = readFileSync(source.file, "utf8");
      validateHead(html, source.canonical);
      validateCompany(html);
    });
  }

  it("rejects missing social artwork, a lost founder, and stale company locations", () => {
    const html = readFileSync(sources[2]!.file, "utf8");
    expect(() => validateHead(html.replace(/<meta property="og:image"[^>]*>/, ""), sources[2]!.canonical)).toThrow();
    expect(() => validateCompany(html.replace('"name":"Sejun Kim"', '"name":"Unknown"'))).toThrow();
    expect(() => validateCompany(html.replace('"identifier":"US"', '"identifier":"KR"'))).toThrow();
  });

  it("serves one 1200×630 artwork in the application and preview", () => {
    const publicPath = "public/og/agentbase.png";
    const previewPath = "design-previews/2026-10-10/vision/assets/og/agentbase.png";
    expect(imageDimensions(publicPath)).toEqual([1200, 630]);
    expect(imageDimensions(previewPath)).toEqual([1200, 630]);
    expect(readFileSync(publicPath).equals(readFileSync(previewPath))).toBe(true);
  });

  it("identifies the company and both founders in every AI document", () => {
    const documents = [renderLlmsTxt(), renderMarkdown("en"), renderMarkdown("ko"), readFileSync("design-previews/2026-10-10/vision/index.md", "utf8")];
    for (const text of documents) {
      expect(text).toContain("AgentBase LLC");
      expect(text).toContain("contact@agentba.se");
      for (const person of people.people) {
        expect(text).toContain(person.name);
        expect(text).toContain(person.linkedin);
      }
      expect(text).not.toContain("applying to build our next fleet generation on Claude");
    }
  });

  it("does not let editable content terminate its JSON-LD element", () => {
    const unsafe = "</script><script>alert(1)</script>";
    const json = serializeJsonLd([{ name: unsafe }]);
    expect(json).not.toContain("<");
    expect(JSON.parse(json)["@graph"][0].name).toBe(unsafe);
  });

  it("uses a committed content date and reciprocal language URLs in the sitemap", () => {
    const entries = sitemap();
    expect(entries.map(entry => entry.url)).toEqual(["https://agentba.se/", "https://agentba.se/ko"]);
    for (const entry of entries) {
      expect(new Date(entry.lastModified!).getTime()).toBeGreaterThanOrEqual(new Date(company.contentUpdatedAt).getTime());
      expect(entry.alternates?.languages).toEqual({ en: "https://agentba.se/", ko: "https://agentba.se/ko", "x-default": "https://agentba.se/" });
    }
  });
});
