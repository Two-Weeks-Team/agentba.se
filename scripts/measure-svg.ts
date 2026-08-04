/** Size check for the static hero fallback. Run: pnpm tsx scripts/measure-svg.ts */
import { brotliCompressSync, gzipSync } from "node:zlib";
import { VIEW_APAC, VIEW_WORLD } from "../lib/swarm/constants";
import { buildSeats } from "../lib/swarm/layout";
import { seatsToPath } from "../lib/swarm/path";

for (const view of [VIEW_WORLD, VIEW_APAC]) {
  const seats = buildSeats(view);
  const d = seatsToPath(seats, view);
  const raw = Buffer.byteLength(d);
  console.log(
    `${view.id.padEnd(6)} seats ${String(seats.length).padStart(5)} · ` +
      `path raw ${(raw / 1024).toFixed(1)} kB · ` +
      `gzip ${(gzipSync(d).byteLength / 1024).toFixed(1)} kB · ` +
      `brotli ${(brotliCompressSync(d).byteLength / 1024).toFixed(1)} kB`,
  );
}
