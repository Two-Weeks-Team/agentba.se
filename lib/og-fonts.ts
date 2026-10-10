import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Fonts for the social card.
 *
 * Newsreader 400 matches the landing display face; Inter 400 carries the
 * supporting copy. Both are static instances of official Google Fonts
 * releases. Source pins, generation steps and OFL licenses live beside
 * the font files in assets/fonts. Satori cannot read the browser's WOFF2.
 *
 * These are read at build time: the OG routes are prerendered, so nothing
 * here runs on a request.
 */
function load(filename: string): ArrayBuffer {
  const buf = readFileSync(
    join(process.cwd(), "assets", "fonts", filename),
  );
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export const ogFonts = [
  { name: "Newsreader", data: load("Newsreader-Regular.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: load("Inter-Regular.ttf"), weight: 400 as const, style: "normal" as const },
];
