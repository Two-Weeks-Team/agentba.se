/**
 * Build the favicon set from lib/brand.ts.
 *
 * Browser icons keep the original dark mark on transparency. A square viewBox
 * centers the original artwork without nested SVG viewports, whose offsets
 * were lost by the rasterizer in the previous ICO and PNG files.
 *
 * Run: node scripts/generate-icons.mjs   (needs imagemagick for the raster sizes)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const INK = "#101113";
const PAPER = "#f2efe6";
const SIZE = 512;

const brand = readFileSync("lib/brand.ts", "utf8");
const path = /export const MARK_PATH =\s*\n\s*"([\s\S]*?)";/.exec(brand)?.[1];
const viewBox = /export const MARK_VIEWBOX = "([^"]+)"/.exec(brand)?.[1];
const transform = /export const MARK_TRANSFORM = "([^"]+)"/.exec(brand)?.[1];
if (!path || !viewBox || !transform) throw new Error("could not read the mark from lib/brand.ts");

const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

function icon(background) {
  const side = Math.max(vbW, vbH);
  const x = (vbW - side) / 2;
  const y = (vbH - side) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${side} ${side}" width="${SIZE}" height="${SIZE}">
${background ? `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${background}"/>\n` : ""}<g transform="${transform}" fill="${INK}"><path d="${path}"/></g>
</svg>
`;
}

const svg = icon();
writeFileSync("app/icon.svg", svg);
console.log(`app/icon.svg — ${svg.length} bytes`);

// Home-screen icons require an opaque surface; retain the same dark mark.
writeFileSync("/tmp/agentbase-apple.svg", icon(PAPER));
execFileSync("magick", [
  "-background", "none", "/tmp/agentbase-apple.svg",
  "-resize", "180x180", "-strip", "app/apple-icon.png",
]);
console.log("app/apple-icon.png — 180x180");

execFileSync("magick", [
  "-background", "none", "app/icon.svg",
  "-strip",
  "-define", "icon:auto-resize=16,32,48",
  "app/favicon.ico",
]);
console.log("app/favicon.ico — 16/32/48 (transparent, centered original mark)");

// Give Safari native PNG candidates at new paths, independent of the old
// /favicon.ico cache and Next's query-string versions.
mkdirSync("public/icons", { recursive: true });
for (const size of [32, 64]) {
  const output = `public/icons/agentbase-mark-v2-${size}.png`;
  execFileSync("magick", [
    "-background", "none", "app/icon.svg",
    "-resize", `${size}x${size}`, "-strip", output,
  ]);
  console.log(`${output} — transparent ${size}x${size}`);
}

// schema.org Organization.logo wants a stable raster URL, and Next.js serves
// app/icon.svg from a hashed path — so the structured-data copy lives in public/.
execFileSync("magick", [
  "-background", "none", "app/icon.svg",
  "-resize", "512x512", "-strip", "public/logo-512.png",
]);
console.log("public/logo-512.png — 512x512");
