import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Copy the approved CI artwork byte-for-byte. Do not rasterize, retrace,
// recolor or crop these files: even the smallest favicon has its own master.
const root = "assets/brand/ci-v1";
const { assets } = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
let count = 0;
for (const { source, outputs } of assets) {
  for (const target of outputs) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(root, source), target);
    count++;
  }
}
console.log(`Synced ${count} logo, favicon, app and social assets from AgentBase CI Kit v1.0.`);
