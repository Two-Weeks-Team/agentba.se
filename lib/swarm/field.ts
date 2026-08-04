import type { Seat } from "./layout";
import type { Tier } from "./constants";

/**
 * Swarm state as parallel typed arrays. Allocated once at init; the frame
 * loop never allocates, because a GC pause is a dropped frame.
 */
export interface Field {
  n: number;
  /** Seat position in CSS px, recomputed on resize. */
  homeX: Float32Array;
  homeY: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  phase: Float32Array;
  amp: Float32Array;
  /** 0 = scattered crowd, 1 = in formation. The whole narrative is here. */
  order: Float32Array;
  tier: Uint8Array;
  /** Reusable draw buckets, sized to n so they never reallocate. */
  buckets: [Uint32Array, Uint32Array, Uint32Array];
  bucketLen: [number, number, number];
}

export const TIER_INDEX: Record<Tier, 0 | 1 | 2> = {
  domain: 0,
  meta: 1,
  watchdog: 2,
};

export function createField(seats: readonly Seat[]): Field {
  const n = seats.length;
  const f: Field = {
    n,
    homeX: new Float32Array(n),
    homeY: new Float32Array(n),
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    phase: new Float32Array(n),
    amp: new Float32Array(n),
    order: new Float32Array(n),
    tier: new Uint8Array(n),
    buckets: [new Uint32Array(n), new Uint32Array(n), new Uint32Array(n)],
    bucketLen: [0, 0, 0],
  };

  for (let i = 0; i < n; i++) {
    const s = seats[i]!;
    f.phase[i] = s.phase;
    f.amp[i] = s.amp;
    f.tier[i] = TIER_INDEX[s.tier];
  }
  return f;
}

/**
 * Map normalised seats onto the current canvas size. Called on init and on
 * every resize; particle identity and count never change, so a resize does
 * not reshuffle the picture.
 */
export function layoutField(
  f: Field,
  seats: readonly Seat[],
  width: number,
  height: number,
  firstRun: boolean,
): void {
  for (let i = 0; i < f.n; i++) {
    const s = seats[i]!;
    const hx = s.nx * width;
    const hy = s.ny * height;
    f.homeX[i] = hx;
    f.homeY[i] = hy;
    if (firstRun) {
      f.x[i] = hx;
      f.y[i] = hy;
    } else {
      // Keep relative displacement so a resize does not snap everything.
      f.x[i] = hx + (f.x[i]! - f.homeX[i]!);
      f.y[i] = hy + (f.y[i]! - f.homeY[i]!);
    }
  }
}
