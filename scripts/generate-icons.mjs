/**
 * Build the favicon set from lib/brand.ts.
 *
 * The mark sits on a dark rounded square rather than on transparency: a
 * paper-coloured mark with no plate disappears against a light browser tab,
 * and shipping two variants means one of them eventually goes stale.
 *
 * Run: node scripts/generate-icons.mjs   (needs imagemagick for the raster sizes)
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const VOID = "#0e0e0c";
const PAPER = "#f2efe6";
const SIZE = 512;
const RADIUS = 96;
/** Fraction of the plate the mark spans. Leaves an optical margin. */
const INSET = 0.64;

/**
 * At 16 px the monogram's counters close up, so the .ico entries get a tighter
 * inset — more of the grid goes to the mark. Icon sets are tuned per size for
 * exactly this reason; one geometry cannot serve 16 px and 512 px equally.
 */
const INSET_SMALL = 0.78;

const brand = readFileSync("lib/brand.ts", "utf8");
const path = /export const MARK_PATH =\s*\n\s*"([\s\S]*?)";/.exec(brand)?.[1];
const viewBox = /export const MARK_VIEWBOX = "([^"]+)"/.exec(brand)?.[1];
const transform = /export const MARK_TRANSFORM = "([^"]+)"/.exec(brand)?.[1];
if (!path || !viewBox || !transform) throw new Error("could not read the mark from lib/brand.ts");

const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

function plate(inset, radius) {
  const w = Math.round(SIZE * inset);
  const h = Math.round((w * vbH) / vbW);
  const x = Math.round((SIZE - w) / 2);
  const y = Math.round((SIZE - h) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<rect width="${SIZE}" height="${SIZE}" rx="${radius}" fill="${VOID}"/>
<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}">
<g transform="${transform}" fill="${PAPER}"><path d="${path}"/></g>
</svg>
</svg>
`;
}

const svg = plate(INSET, RADIUS);
writeFileSync("app/icon.svg", svg);
console.log(`app/icon.svg — ${svg.length} bytes`);

// Apple applies its own mask, so the raster gets a full-bleed plate.
writeFileSync("/tmp/agentbase-apple.svg", plate(INSET, 0));
execFileSync("magick", [
  "-background", "none", "/tmp/agentbase-apple.svg",
  "-resize", "180x180", "app/apple-icon.png",
]);
console.log("app/apple-icon.png — 180x180");

writeFileSync("/tmp/agentbase-small.svg", plate(INSET_SMALL, RADIUS * 1.15));
execFileSync("magick", [
  "-background", "none", "/tmp/agentbase-small.svg",
  "-define", "icon:auto-resize=16,32,48",
  "app/favicon.ico",
]);
console.log("app/favicon.ico — 16/32/48 (tighter inset)");

// schema.org Organization.logo wants a stable raster URL, and Next.js serves
// app/icon.svg from a hashed path — so the structured-data copy lives in public/.
execFileSync("magick", [
  "-background", "none", "app/icon.svg",
  "-resize", "512x512", "public/logo-512.png",
]);
console.log("public/logo-512.png — 512x512");
