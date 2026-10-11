import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MARK_ASPECT, MARK_PATH, MARK_VIEWBOX, markDataUri } from "../lib/brand";

describe("mark", () => {
  it("carries a real traced path", () => {
    expect(MARK_PATH.length).toBeGreaterThan(1000);
    expect(MARK_PATH.startsWith("M")).toBe(true);
  });

  it("is a single line, because a TS string literal cannot span lines", () => {
    // scripts/trace-mark.sh collapses potrace's line wrapping. If that ever
    // regresses the file will not parse, so this fails first and says why.
    expect(MARK_PATH).not.toContain("\n");
  });

  it("keeps the viewBox and the aspect in agreement", () => {
    const [, , w, h] = MARK_VIEWBOX.split(/\s+/).map(Number);
    expect(MARK_ASPECT).toBeCloseTo(w! / h!, 5);
  });
});

describe("markDataUri", () => {
  const decode = (uri: string) =>
    Buffer.from(uri.replace("data:image/svg+xml;base64,", ""), "base64").toString();

  it("declares intrinsic width and height", () => {
    // Satori drops an <img> whose SVG has no intrinsic size, without an error.
    // That is how the social card once shipped with a blank space where the
    // mark should be, so it is asserted rather than remembered.
    const svg = decode(markDataUri("#f2efe6", 120));
    expect(svg).toMatch(/width="\d+"/);
    expect(svg).toMatch(/height="120"/);
  });

  it("applies the requested fill", () => {
    expect(decode(markDataUri("#0e0e0c"))).toContain('fill="#0e0e0c"');
  });
});

describe("icon set", () => {
  const files = [
    ["app/icon.svg", 1000],
    ["app/favicon.ico", 1000],
    ["app/apple-icon.png", 1000],
    ["public/logo-512.png", 1000],
    ["assets/brand/agentbase-logo-source.png", 10000],
  ] as const;

  for (const [file, minBytes] of files) {
    it(`ships ${file}`, () => {
      expect(existsSync(file), `${file} is missing — run node scripts/generate-icons.mjs`).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(minBytes);
    });
  }

  it("the generated icon really contains the mark", () => {
    const svg = readFileSync("app/icon.svg", "utf8");
    // A truncated path would still be valid SVG and would still render *something*.
    expect(svg).toContain(MARK_PATH.slice(0, 80));
  });

  it("keeps the original dark mark on a transparent browser icon", () => {
    const svg = readFileSync("app/icon.svg", "utf8");
    expect(svg).toContain('fill="#101113"');
    expect(svg).not.toContain("<rect");
    // Nested SVG offsets were ignored by the ICO rasterizer.
    expect(svg.match(/<svg\b/g)).toHaveLength(1);
  });

  it("centers dark artwork on transparency in every ICO size", () => {
    const ico = readFileSync("app/favicon.ico");
    expect(ico.readUInt16LE(4)).toBe(3);
    for (const [index, size] of [16, 32, 48].entries()) {
      const entry = 6 + index * 16;
      expect(ico[entry]).toBe(size);
      expect(ico[entry + 1]).toBe(size);
      const bitmap = ico.readUInt32LE(entry + 12);
      expect(ico.readUInt32LE(bitmap)).toBe(40); // BITMAPINFOHEADER
      expect(ico.readUInt16LE(bitmap + 14)).toBe(32); // BGRA
      const ink: { x: number; y: number }[] = [];
      let transparent = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const pixel = bitmap + 40 + ((size - 1 - y) * size + x) * 4;
          const alpha = ico[pixel + 3]!;
          if (alpha === 0) transparent++;
          if (alpha > 128) {
            expect(Math.max(...ico.subarray(pixel, pixel + 3))).toBeLessThan(40);
            ink.push({ x, y });
          }
        }
      }
      expect(transparent / (size * size)).toBeGreaterThan(0.4);
      expect(ink.length).toBeGreaterThan(size * size * 0.2);
      for (const axis of ["x", "y"] as const) {
        const min = Math.min(...ink.map(point => point[axis]));
        const max = Math.max(...ink.map(point => point[axis]));
        expect(Math.abs((min + max) / 2 - (size - 1) / 2)).toBeLessThanOrEqual(1);
      }
    }
  });
});
