import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Fonts for the social card.
 *
 * Subset to the glyphs the card can actually print — 6.5 kB per weight
 * instead of 274 kB. Regenerate with `scripts/subset-og-font.sh` if the card
 * copy ever gains a character outside that set.
 *
 * These are read at build time: the OG routes are prerendered, so nothing
 * here runs on a request.
 */
function load(weightName: string): ArrayBuffer {
  const buf = readFileSync(
    join(process.cwd(), "assets", "fonts", `JetBrainsMono-${weightName}.subset.ttf`),
  );
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export const ogFonts = [
  { name: "JetBrains Mono", data: load("Regular"), weight: 400 as const, style: "normal" as const },
  { name: "JetBrains Mono", data: load("Bold"), weight: 700 as const, style: "normal" as const },
];
