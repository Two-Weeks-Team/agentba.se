import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import company from "../data/company.json";
import people from "../data/people.json";
import products from "../data/products.json";
import { renderLlmsTxt, renderMarkdown } from "../lib/machine";

const preview = "design-previews/2026-10-10/vision";
const built = ".next/server/app";

function publicContacts(text: string) {
  // RSC serializes HTML delimiters as Unicode escapes; decode them before
  // matching addresses so `\u003econtact` is not treated as a mailbox name.
  const decoded = text.replace(/\\u([\da-f]{4})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  const addresses = decoded.match(/[\w.+-]+@agentba\.se/gi) ?? [];
  const unexpected = addresses.filter(address => address.toLowerCase() !== company.email);
  if (unexpected.length) throw new Error(`Individual address in public content: ${unexpected.join(", ")}`);
}

function companyIdentity(text: string) {
  const data = JSON.parse(text);
  expect(data.legalName).toBe("AgentBase LLC");
  expect(data.founded).toBe("August 2026");
  expect(data.countryCode).toBe("US");
  expect(data.email).toBe("contact@agentba.se");
  expect(data.models).toEqual(["Google Gemini", "OpenAI"]);
}

function internalPaths(index: string) {
  return [...new Set([...index.matchAll(/\]\((https:\/\/agentba\.se[^)]*)\)/g)]
    .map(match => new URL(match[1]!).pathname))];
}

function resource(path: string, target: "application" | "preview") {
  if (path.startsWith("/data/")) return readFileSync(`${target === "application" ? "public" : preview}${path}`, "utf8");
  const documents: Record<string, string> = target === "application" ? {
    "/": `${built}/index.html`,
    "/index.md": `${built}/api/md/en/home.body`,
    "/ko/index.md": `${built}/api/md/ko/home.body`,
  } : {
    "/": `${preview}/c.html`,
    "/index.md": `${preview}/index.md`,
    "/ko/index.md": `${preview}/ko/index.md`,
  };
  if (!documents[path]) throw new Error(`Unverified internal document: ${path}`);
  return readFileSync(documents[path], "utf8");
}

describe("AI discovery across every published reading path", () => {
  const index = renderLlmsTxt();

  it("publishes the reviewed index in both built targets", () => {
    expect(readFileSync(`${built}/llms.txt.body`, "utf8")).toBe(index);
    expect(readFileSync(`${preview}/llms.txt`, "utf8")).toBe(index);
    for (const [locale, path] of [["en", "/index.md"], ["ko", "/ko/index.md"]] as const) {
      expect(resource(path, "application")).toBe(renderMarkdown(locale));
    }
  });

  it("lets a reader identify the company, founders, contact and work from the index alone", () => {
    expect(index).toContain(company.identity);
    expect(index).toContain(company.business);
    expect(index).toContain(company.mission);
    expect(index).toContain(company.missionScope);
    for (const founder of people.people) {
      expect(index).toContain(`[${founder.name}](${founder.linkedin})`);
    }
    expect(index).toContain("Google Gemini and OpenAI");
    expect(index).toContain("MCP and session hooks");
    expect(index).toContain("before AgentBase LLC was founded");
    expect(index.indexOf("## Products and operations")).toBeLessThan(index.indexOf("## Core technology"));
    expect(index.indexOf("## Core technology")).toBeLessThan(index.indexOf("## Long-term direction"));
    expect(index).not.toMatch(/applying to|startup application|approve our|22 agents|144 agents/i);
  });

  for (const target of ["application", "preview"] as const) {
    it(`${target}: checks every linked company document and every published JSON file`, () => {
      const paths = internalPaths(index);
      // A broken parser or an omitted section must not turn this into a pass.
      expect(paths).toHaveLength(14);
      const dataFiles = readdirSync("data").sort();
      expect(readdirSync(`${target === "application" ? "public" : preview}/data`).sort()).toEqual(dataFiles);
      publicContacts(index);
      for (const path of paths) {
        const text = resource(path, target);
        expect(text.trim().length, `${target}${path} is empty`).toBeGreaterThan(30);
        publicContacts(text);
      }
      for (const file of readdirSync("data").filter(file => file.endsWith(".json"))) {
        const text = resource(`/data/${file}`, target);
        publicContacts(text);
        expect(JSON.parse(text), `${target}: stale ${file}`).toEqual(JSON.parse(readFileSync(`data/${file}`, "utf8")));
      }
      companyIdentity(resource("/data/company.json", target));
      const profiles = JSON.parse(resource("/data/people.json", target));
      expect(profiles.people).toHaveLength(2);
      for (const person of profiles.people) {
        expect(Object.keys(person).sort()).toEqual(["id", "linkedin", "name", "nameKo", "role"]);
      }
    });

    it(`${target}: carries product evidence and scope into the text mirrors`, () => {
      for (const path of ["/index.md", "/ko/index.md"]) {
        const text = resource(path, target);
        for (const url of ["https://socialseed.ing", "https://kbeauty.market", "https://memex.quest", "https://two-weeks-team.github.io/PreviewForgeForClaudeCode/"]) {
          expect(text, `${target}${path} lacks ${url}`).toContain(url);
        }
        for (const id of products.featured) {
          const product = products.products.find(p => p.id === id)!;
          expect(text).toContain(product.scope);
          if (product.relationship) expect(text).toContain(product.relationship);
        }
        expect(text).toContain("before AgentBase LLC");
      }
    });
  }

  it("labels source definitions and modeled costs without inventing a newer measurement", () => {
    const fleet = JSON.parse(resource("/data/fleet.json", "application"));
    expect(fleet.evidenceType).toBe("source-definition-snapshot");
    expect(fleet.capturedAt).toBe("2026-08-04");
    const costs = JSON.parse(resource("/data/economics.json", "application"));
    expect(costs.evidenceType).toBe("modeled-scenario");
    expect(costs.modeledAt).toBe("2026-06-01");
    expect(costs.measuredAt).toBeUndefined();
    expect(costs.agentbase.costNote.en).not.toMatch(/metered|measured/i);
    const social = products.products.find(p => p.id === "social-seeding")!;
    expect(social.parentCompany).toBe(company.legalName);
    expect(social.operator).toBe("E Corp.");
    expect(social.status).toBe("closed-beta");
    expect(products.products.find(p => p.id === "kbeauty")!.status).toBe("storefront-preview");
  });

  it("keeps founder delivery addresses out of all client bundles, including error states", () => {
    const root = ".next/static";
    const chunks = readdirSync(root, { recursive: true }).filter(file => typeof file === "string" && file.endsWith(".js")) as string[];
    expect(chunks.length).toBeGreaterThan(0);
    for (const file of chunks) publicContacts(readFileSync(join(root, file), "utf8"));
  });

  it("keeps the reusable redesign content free of the retired application pitch", () => {
    const source = readFileSync("content/en/landing.html", "utf8");
    publicContacts(source);
    expect(source).not.toContain("applying to build our next fleet generation on Claude");
    for (const person of people.people) expect(source).toContain(person.name);
    expect(source).toContain(company.identity);
  });

  it("rejects a leaked address, an unverified link and a subsidiary used as the parent entity", () => {
    expect(() => publicContacts(`${index}\nsangguen@agentba.se`)).toThrow("Individual address");
    expect(() => publicContacts('{"email":"sejun@agentba.se"}')).toThrow("Individual address");
    expect(() => publicContacts('\\u003esejun@agentba.se')).toThrow("Individual address");
    expect(() => publicContacts('\\u003econtact@agentba.se')).not.toThrow();
    expect(() => resource("/unlisted.md", "application")).toThrow("Unverified internal document");
    expect(() => resource("/data/missing.json", "preview")).toThrow();
    expect(() => companyIdentity(JSON.stringify({ ...company, legalName: "E Corp." }))).toThrow();
  });
});
