import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Fonts for the social card.
 *
 * Bebas Neue matches the redesign's display type. JetBrains Mono is subset
 * to the card's glyphs; regenerate with `scripts/subset-og-font.sh` if the
 * copy gains a character outside that set. All font files are local.
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
  { name: "Bebas Neue", data: load("BebasNeue-Regular.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "JetBrains Mono", data: load("JetBrainsMono-Regular.subset.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "JetBrains Mono", data: load("JetBrainsMono-Bold.subset.ttf"), weight: 700 as const, style: "normal" as const },
];
