import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "../assets/brand/ci-v1/manifest.json";
import { BRAND_APPLE_ICON, BRAND_FAVICON, BRAND_ICON_ROOT, BRAND_LOGOS, BRAND_LOGO_SIZE, BRAND_MANIFEST, BRAND_SCHEMA_LOGO } from "../lib/brand";

function approved(bytes: Buffer, sha256: string) {
  if (createHash("sha256").update(bytes).digest("hex") !== sha256) throw new Error("Artwork differs from the approved CI kit");
}
const root = "assets/brand/ci-v1";

describe("approved CI Kit v1.0", () => {
  for (const asset of manifest.assets) {
    it(`preserves ${asset.source} and every published copy`, () => {
      approved(readFileSync(`${root}/${asset.source}`), asset.sha256);
      for (const output of asset.outputs) approved(readFileSync(output), asset.sha256);
    });
  }

  it("rejects corrupted or substituted artwork", () => {
    const asset = manifest.assets[0]!;
    const bytes = readFileSync(`${root}/${asset.source}`);
    expect(() => approved(bytes.subarray(0, -1), asset.sha256)).toThrow("Artwork differs");
    expect(() => approved(Buffer.from("old triangle mark"), asset.sha256)).toThrow("Artwork differs");
  });

  it("keeps the official outlined wordmark and its aspect ratio", () => {
    for (const [color, path] of Object.entries(BRAND_LOGOS)) {
      const svg = readFileSync(`assets${path}`, "utf8");
      expect(svg).toContain(`viewBox="0 0 ${BRAND_LOGO_SIZE.width} ${BRAND_LOGO_SIZE.height}"`);
      expect(svg).not.toContain("<text");
      expect(svg).toContain(color === "black" ? '#111111' : '#FFFFFF');
    }
  });

  it("uses the complete logo in both headers and footers", () => {
    for (const [file, logo] of [[".next/server/app/index.html", BRAND_LOGOS.black], [".next/server/app/ko.html", BRAND_LOGOS.white]]) {
      const html = readFileSync(file!, "utf8");
      expect((html.match(/<img\b[^>]*>/g) ?? []).filter(tag => tag.includes(`src="${logo}"`))).toHaveLength(2);
      expect(html).not.toContain('src="/landing/mark-dark.svg"');
      expect(html).not.toContain('class="brand-name"');
    }
  });

  it("uses new URLs for SVG, Apple, schema and manifest in both locale heads", () => {
    for (const file of [".next/server/app/index.html", ".next/server/app/ko.html"]) {
      const html = readFileSync(file, "utf8");
      const head = html.split("</head>")[0]!;
      for (const path of [BRAND_FAVICON, BRAND_APPLE_ICON, BRAND_MANIFEST, BRAND_SCHEMA_LOGO]) expect(html).toContain(path);
      expect(head).not.toContain("agentbase-mark-v2-");
    }
  });

  it("serves valid PNG dimensions for all manifest icon purposes", () => {
    const pwa = JSON.parse(readFileSync(`public${BRAND_MANIFEST}`, "utf8"));
    expect(pwa.icons).toHaveLength(3);
    expect(pwa.icons.some((icon: {purpose: string}) => icon.purpose === "maskable")).toBe(true);
    for (const icon of pwa.icons) {
      const png = readFileSync(`public${BRAND_ICON_ROOT}/${icon.src}`);
      expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(icon.sizes);
    }
  });

  it("preserves the supplied multi-resolution ICO", () => {
    const ico = readFileSync("app/favicon.ico");
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    const sizes = Array.from({length:ico.readUInt16LE(4)}, (_, i) => ico[6 + i * 16]);
    expect(sizes).toEqual([16, 32, 48]);
  });
});
