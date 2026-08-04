import type { Field } from "./field";
import {
  DAMPING,
  DRIFT_SPEED,
  IDLE_THRESHOLD,
  K_FALL,
  K_RISE,
  PULSE_SPEED,
  PULSE_WIDTH,
  STIFFNESS,
} from "./constants";

/** 1024-entry sine table. Removes ~6,000 Math.sin calls per frame. */
const SIN_N = 1024;
const SIN = new Float32Array(SIN_N);
for (let i = 0; i < SIN_N; i++) SIN[i] = Math.sin((i / SIN_N) * Math.PI * 2);
const TAU = Math.PI * 2;

function fastSin(rad: number): number {
  const i = (((rad / TAU) * SIN_N) | 0) & (SIN_N - 1);
  return SIN[i]!;
}

export interface Pulse {
  x: number;
  y: number;
  /** Seconds since the pulse was fired. */
  age: number;
}

export interface StepInput {
  dt: number;
  /** Elapsed seconds, drives the idle drift. */
  t: number;
  /** Smoothed cursor. */
  mx: number;
  my: number;
  /** Whether a cursor is engaged at all. */
  active: boolean;
  radius: number;
  strength: number;
  /** Pointer held down: formation accumulates instead of decaying. */
  sustain: boolean;
  pulses: readonly Pulse[];
}

/**
 * One physics tick.
 *
 * There is no neighbour query here. Fluidity comes from per-dot phase noise
 * and cohesion from a single shared field (the cursor), so the loop is pure
 * O(n) arithmetic and needs no spatial index.
 */
export function step(f: Field, s: StepInput): void {
  const { dt, t, mx, my, radius, strength, sustain, pulses } = s;
  const r2 = radius * radius;
  const drift = t * DRIFT_SPEED;
  const fall = sustain ? 0 : K_FALL;

  // Bucket counters reset each frame; the arrays themselves are reused.
  f.bucketLen[0] = 0;
  f.bucketLen[1] = 0;
  f.bucketLen[2] = 0;

  for (let i = 0; i < f.n; i++) {
    const px = f.x[i]!;
    const py = f.y[i]!;

    let target = 0;
    if (s.active) {
      const dx = mx - px;
      const dy = my - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2) {
        const lin = 1 - d2 / r2;
        target = lin * lin * strength; // quartic falloff, no sqrt
      }
    }

    // Expanding rings from clicks force order along their wavefront.
    for (let p = 0; p < pulses.length; p++) {
      const pu = pulses[p]!;
      const rr = pu.age * PULSE_SPEED;
      const dx = px - pu.x;
      const dy = py - pu.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(d - rr) < PULSE_WIDTH) {
        const k = 1 - Math.abs(d - rr) / PULSE_WIDTH;
        if (k > target) target = k;
      }
    }

    const o = f.order[i]!;
    const k = target > o ? K_RISE : fall;
    const next = o + (target - o) * k;
    f.order[i] = next;

    // Idle drift, then lerp toward the seat by however ordered we are.
    const ph = f.phase[i]! + drift;
    const a = f.amp[i]!;
    const hx = f.homeX[i]!;
    const hy = f.homeY[i]!;
    const wx = hx + fastSin(ph) * a;
    const wy = hy + fastSin(ph * 0.83 + 1.7) * a;
    const tx = wx + (hx - wx) * next;
    const ty = wy + (hy - wy) * next;

    const nvx = (f.vx[i]! + (tx - px) * STIFFNESS * dt) * DAMPING;
    const nvy = (f.vy[i]! + (ty - py) * STIFFNESS * dt) * DAMPING;
    f.vx[i] = nvx;
    f.vy[i] = nvy;
    f.x[i] = px + nvx * dt;
    f.y[i] = py + nvy * dt;

    if (next >= IDLE_THRESHOLD) {
      const b = f.tier[i]! as 0 | 1 | 2;
      f.buckets[b][f.bucketLen[b]++] = i;
    }
  }
}

/** Freeze the field in full formation — the reduced-motion still frame. */
export function settle(f: Field): void {
  f.bucketLen[0] = 0;
  f.bucketLen[1] = 0;
  f.bucketLen[2] = 0;
  for (let i = 0; i < f.n; i++) {
    f.order[i] = 1;
    f.x[i] = f.homeX[i]!;
    f.y[i] = f.homeY[i]!;
    f.vx[i] = 0;
    f.vy[i] = 0;
    const b = f.tier[i]! as 0 | 1 | 2;
    f.buckets[b][f.bucketLen[b]++] = i;
  }
}
