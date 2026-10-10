// Project the actual landing-page blueprint. Run when its geometry changes.
// The checked-in SVG is sufficient for production builds.
import { mkdirSync, writeFileSync } from "node:fs";
import * as THREE from "../assets/landing/vendor/three/three.module.js";
import { blueprint } from "../assets/landing/organization-blueprint.mjs";

const width = 600, height = 450;
// Keep the same organization geometry and warm olive/stone palette as the hero.
const palette = {
  ink: { side: "#363931", top: "#41453b", front: "#363931", stroke: "#676c60" },
  paper: { side: "#e2dfd5", top: "#fdfcf8", front: "#edeae1", stroke: "#99978c" },
  grid: "#e9e6dc",
  wires: "#aaa596",
};
const model = blueprint("company");
const camera = new THREE.OrthographicCamera();
camera.position.set(9, 6.8, 11);
camera.lookAt(0, .45, 0);
camera.updateMatrixWorld(true);
const view = (p) => new THREE.Vector3(...p).applyMatrix4(camera.matrixWorldInverse);
const vertices = (b) => [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z =>
  [b.p[0] + x * b.s[0] / 2, b.p[1] + y * b.s[1] / 2, b.p[2] + z * b.s[2] / 2])));
const points = model.blocks.flatMap(vertices).map(view);
const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
const minY = Math.min(...points.map(p => -p.y)), maxY = Math.max(...points.map(p => -p.y));
const scale = Math.min((width - 110) / (maxX - minX), (height - 105) / (maxY - minY));
const point = p => {
  const v = view(p);
  return [width / 2 + (v.x - (minX + maxX) / 2) * scale,
    height / 2 + (-v.y - (minY + maxY) / 2) * scale, v.z];
};
const xy = p => point(p).slice(0, 2).map(n => n.toFixed(2)).join(",");
const paths = [];
for (let n = -5.5; n <= 5.5; n += .5) {
  paths.push(`<path d="M${xy([n, -2.4, -5.5])} L${xy([n, -2.4, 5.5])}"/>`);
  paths.push(`<path d="M${xy([-5.5, -2.4, n])} L${xy([5.5, -2.4, n])}"/>`);
}
const wires = model.links.map(path => `<polyline points="${path.map(xy).join(" ")}"/>`);
// Paint each architectural tier before the blocks it supports. A global
// face-centroid sort lets the large floor incorrectly cover rear departments.
const blocks = [...model.blocks].sort((a, b) =>
  a.p[1] - b.p[1] || view(a.p).z - view(b.p).z);
const faces = [];
for (const block of blocks) {
  const v = vertices(block);
  const paint = block.ink ? palette.ink : palette.paper;
  const blockFaces = [];
  for (const [indices, color] of [
    [[4, 5, 7, 6], paint.side],
    [[2, 6, 7, 3], paint.top],
    [[1, 3, 7, 5], paint.front],
  ]) {
    const polygon = indices.map(i => v[i]);
    blockFaces.push({ depth: polygon.reduce((sum, p) => sum + point(p)[2], 0) / 4,
      svg: `<polygon points="${polygon.map(xy).join(" ")}" fill="${color}" stroke="${paint.stroke}" stroke-width=".8" stroke-linejoin="round"/>` });
  }
  faces.push(...blockFaces.sort((a, b) => a.depth - b.depth));
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<g fill="none" stroke="${palette.grid}" stroke-width=".7">${paths.join("")}</g>
<g fill="none" stroke="${palette.wires}" stroke-width="1">${wires.join("")}</g>
${faces.map(f => f.svg).join("")}
</svg>`;
mkdirSync("assets/brand", { recursive: true });
writeFileSync("assets/brand/og-organization.svg", svg);
console.log("Projected the landing-page company model for the OG card.");
