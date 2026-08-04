import {
  DOWNGRADE_AFTER_FRAMES,
  DOWNGRADE_FACTOR,
  FRAME_BUDGET_MS,
  MAX_DOWNGRADES,
} from "./constants";

/**
 * Frame-time watchdog. If the loop misses budget for long enough it sheds
 * particles rather than letting the whole page stutter.
 *
 * It only ever downgrades. Recovering would oscillate on a device that sits
 * right at the threshold, and a swarm that pulses between densities looks
 * broken in a way that a slightly sparser one does not.
 */
export class Quality {
  ema = 8;
  private over = 0;
  private steps = 0;

  /** Fraction of the field that is simulated and drawn. */
  scale = 1;

  sample(frameMs: number): boolean {
    this.ema = this.ema * 0.9 + frameMs * 0.1;
    if (this.ema > FRAME_BUDGET_MS) {
      this.over++;
      if (this.over >= DOWNGRADE_AFTER_FRAMES && this.steps < MAX_DOWNGRADES) {
        this.over = 0;
        this.steps++;
        this.scale *= DOWNGRADE_FACTOR;
        return true;
      }
    } else {
      this.over = 0;
    }
    return false;
  }
}

/** Coarse device tier, used to pick the initial DPR cap. */
export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  return cores <= 4;
}

export function prefersReducedMotion(): boolean {
  if (typeof matchMedia !== "function") return false;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function saveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as { connection?: { saveData?: boolean } }).connection;
  return c?.saveData === true;
}
