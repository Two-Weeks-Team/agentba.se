import { isLand } from "./mask";
import {
  DRIFT_AMP_MAX,
  DRIFT_AMP_MIN,
  type SwarmView,
  type Tier,
} from "./constants";

/**
 * Deterministic seat generation, shared by the server (which renders the
 * static SVG) and the browser (which renders the canvas). Same view in, same
 * seats out — so the crossfade between the two is invisible.
 *
 * Seats are normalised to [0,1] and multiplied by the real canvas size at
 * draw time, which keeps the particle count independent of viewport width.
 *
 * This module is pure TypeScript with no React and no DOM, so it can move
 * into a worker unchanged if measurement ever calls for it.
 */

export interface Seat {
  /** Normalised seat position, [0,1]. */
  readonly nx: number;
  readonly ny: number;
  /** Drift phase and amplitude, so no two dots wander in step. */
  readonly phase: number;
  readonly amp: number;
  readonly tier: Tier;
}

/** Deterministic hash → [0,1). Same output on both sides of the wire. */
function hash01(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Colour mix mirrors the fleet composition — 16 domain, 3 meta, 3 watchdog.
 * It is a stated design mapping, not a claim that a given dot is a given
 * agent, and the legend under the hero says so.
 */
function tierFor(r: number): Tier {
  if (r < 16 / 22) return "domain";
  if (r < 19 / 22) return "meta";
  return "watchdog";
}

/** Project a coordinate into normalised view space. Off-view returns null. */
export function project(
  lon: number,
  lat: number,
  view: SwarmView,
): { nx: number; ny: number } | null {
  const nx = (lon - view.lonMin) / (view.lonMax - view.lonMin);
  const ny = (view.latMax - lat) / (view.latMax - view.latMin);
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
  return { nx, ny };
}

let cache: { key: string; seats: Seat[] } | null = null;

/** Every land cell in the view becomes one seat. Memoised per view. */
export function buildSeats(view: SwarmView): Seat[] {
  const key = `${view.id}:${view.cols}x${view.rows}`;
  if (cache?.key === key) return cache.seats;

  const seats: Seat[] = [];
  const lonSpan = view.lonMax - view.lonMin;
  const latSpan = view.latMax - view.latMin;

  for (let row = 0; row < view.rows; row++) {
    const ny = (row + 0.5) / view.rows;
    const lat = view.latMax - ny * latSpan;
    for (let col = 0; col < view.cols; col++) {
      const nx = (col + 0.5) / view.cols;
      const lon = view.lonMin + nx * lonSpan;
      if (!isLand(lon, lat)) continue;

      const i = row * view.cols + col;
      const a = hash01(i);
      const b = hash01(i * 2654435761);
      seats.push({
        nx,
        ny,
        phase: a * Math.PI * 2,
        amp: DRIFT_AMP_MIN + b * (DRIFT_AMP_MAX - DRIFT_AMP_MIN),
        tier: tierFor(hash01(i * 40503)),
      });
    }
  }

  cache = { key, seats };
  return seats;
}
