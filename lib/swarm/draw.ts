import type { Field } from "./field";
import { COLORS, DOT_ACTIVE, DOT_IDLE, IDLE_THRESHOLD } from "./constants";

const TIER_COLOR = [COLORS.domain, COLORS.meta, COLORS.watchdog] as const;

export interface Marker {
  nx: number;
  ny: number;
  label: string;
  operating: boolean;
  hq: boolean;
  /** Nudge the label off a neighbour's. Does not move the marker itself. */
  labelDy: number;
}

/**
 * Two batched passes. The real cost in Canvas 2D is draw calls and fillStyle
 * changes, not arithmetic, so idle dots share one fill and active dots are
 * grouped into three.
 *
 * Coordinates are snapped to integers with `| 0`. That is a performance win
 * (no sub-pixel antialiasing) and, more importantly, the reason this reads as
 * a control display rather than a particle nebula.
 */
export function draw(
  ctx: CanvasRenderingContext2D,
  f: Field,
  width: number,
  height: number,
  markers: readonly Marker[],
  labelFont: string,
): void {
  // Hard clear. No translucent trail — that is the nebula look and it also
  // costs a full-surface composite every frame.
  ctx.clearRect(0, 0, width, height);

  // Pass 1 — the scattered crowd. One fillStyle for the whole pass.
  ctx.fillStyle = COLORS.graphite;
  for (let i = 0; i < f.n; i++) {
    if (f.order[i]! >= IDLE_THRESHOLD) continue;
    ctx.fillRect(f.x[i]! | 0, f.y[i]! | 0, DOT_IDLE, DOT_IDLE);
  }

  // Pass 2 — dots in formation, grouped by tier. Three fillStyle changes.
  for (let b = 0; b < 3; b++) {
    const len = f.bucketLen[b]!;
    if (len === 0) continue;
    ctx.fillStyle = TIER_COLOR[b]!;
    const bucket = f.buckets[b]!;
    for (let k = 0; k < len; k++) {
      const i = bucket[k]!;
      // Intensity is encoded as size, never as globalAlpha — changing alpha
      // per dot would defeat the batching.
      const size = f.order[i]! > 0.6 ? DOT_ACTIVE : DOT_IDLE + 1;
      ctx.fillRect(f.x[i]! | 0, f.y[i]! | 0, size, size);
    }
  }

  drawMarkers(ctx, markers, width, height, labelFont);
}

/**
 * Markers are drawn independently of the dot grid. That is what keeps `Seoul`
 * legible on a world silhouette where Korea itself is two dots wide.
 */
export function drawMarkers(
  ctx: CanvasRenderingContext2D,
  markers: readonly Marker[],
  width: number,
  height: number,
  labelFont: string,
): void {
  ctx.font = labelFont;
  ctx.textBaseline = "middle";

  for (const m of markers) {
    const x = (m.nx * width) | 0;
    const y = (m.ny * height) | 0;

    ctx.beginPath();
    ctx.arc(x, y, m.hq ? 4.5 : 3.5, 0, Math.PI * 2);
    if (m.operating) {
      ctx.fillStyle = m.hq ? COLORS.marker : COLORS.domain;
      ctx.fill();
    } else {
      ctx.strokeStyle = COLORS.watchdog;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (m.operating) {
      ctx.fillStyle = COLORS.marker;
      ctx.globalAlpha = m.hq ? 0.95 : 0.66;
      ctx.fillText(m.label, x + (m.hq ? 9 : 8), y + 0.5 + m.labelDy);
      ctx.globalAlpha = 1;
    }
  }
}
