/**
 * Every tuning constant for the hero swarm lives here. One file, so that
 * "the cursor feels sluggish" is one edit and not an archaeology exercise.
 */

/** A view is a lon/lat window. The grid is sized to match its aspect. */
export interface SwarmView {
  readonly id: "world" | "apac";
  readonly lonMin: number;
  readonly lonMax: number;
  readonly latMin: number;
  readonly latMax: number;
  /** Canonical sampling grid. Seats are emitted in normalised [0,1] space so
   *  the server SVG and the client canvas place the identical pattern. */
  readonly cols: number;
  readonly rows: number;
}

/** Desktop: the whole operating surface, Antarctica dropped. */
export const VIEW_WORLD: SwarmView = {
  id: "world",
  lonMin: -180,
  lonMax: 180,
  latMin: -58,
  latMax: 78,
  cols: 160,
  rows: 60,
};

/**
 * Mobile: a world silhouette at 390 px wide resolves Korea to two dots, so
 * small screens zoom to Asia-Pacific instead — the markers stay legible and
 * the shape still reads as a map.
 */
export const VIEW_APAC: SwarmView = {
  id: "apac",
  lonMin: 90,
  lonMax: 152,
  latMin: -10,
  latMax: 50,
  cols: 62,
  rows: 60,
};

/** Below this width the hero switches to the Asia-Pacific view. */
export const MOBILE_BREAKPOINT = 768;

/* ── motion ──────────────────────────────────────────────────────────── */

/** Cursor smoothing per 60 fps frame. Raise for calmer, lower for snappier.
 *  Tune upward only: over-smoothing is what makes these feel greasy. */
export const LERP_FIELD = 0.18;
/** The trailing centre, which leaves a wake behind the cursor. */
export const LERP_WAKE = 0.06;

/** Influence radius in CSS px at a 1200 px-wide canvas, modulated by cursor
 *  speed and scaled to the actual canvas so a phone does not light up whole. */
export const RADIUS_SLOW = 130;
export const RADIUS_FAST = 240;
export const RADIUS_REF_WIDTH = 1200;
/** Cursor speed (px/s) that reaches RADIUS_FAST. */
export const SPEED_FULL = 1200;

/** How fast a dot falls into formation, and how slowly it lets go.
 *  Asymmetric on purpose: order accrues quickly and decays slowly, so the
 *  cursor leaves a visible trail of tidied work behind it. */
export const K_RISE = 0.14;
export const K_FALL = 0.018;

/** Spring pulling a dot toward its target. This is where the snap lives. */
export const STIFFNESS = 46;
export const DAMPING = 0.86;

/**
 * Idle drift: how far a dot wanders from its seat, and how fast.
 *
 * Kept small on purpose. Large amplitudes dissolve the continents into noise,
 * and a swarm that does not read as a map is just a particle background — the
 * exact thing this hero is built to avoid. The cursor's job is to sharpen an
 * already-legible map, not to rescue it from chaos.
 */
export const DRIFT_SPEED = 0.5;
export const DRIFT_AMP_MIN = 0.8;
export const DRIFT_AMP_MAX = 3.2;

/** Click impulse rings. */
export const PULSE_SPEED = 620;
export const PULSE_WIDTH = 34;
export const PULSE_MAX = 4;
export const PULSE_TTL = 1.4;

/** Milliseconds of stillness before the cursor enters focus mode. */
export const DWELL_MS = 700;

/* ── rendering ───────────────────────────────────────────────────────── */

export const DOT_IDLE = 2;
export const DOT_ACTIVE = 4;
/** Below this order value a dot is drawn in the idle pass. */
export const IDLE_THRESHOLD = 0.15;

export const MAX_DPR_DESKTOP = 2;
export const MAX_DPR_MOBILE = 1.5;

/** Frame budget. Exceeding it for this many consecutive frames downgrades. */
export const FRAME_BUDGET_MS = 20;
export const DOWNGRADE_AFTER_FRAMES = 45;
export const DOWNGRADE_FACTOR = 0.7;
export const MAX_DOWNGRADES = 2;

/* ── palette (kept in sync with app/globals.css) ─────────────────────── */

export const COLORS = {
  void: "#0e0e0c",
  /** Idle dots. Bright enough that the coastline reads without the cursor. */
  graphite: "#4c493e",
  chalk: "#c9c5b6",
  domain: "#e8b23a",
  meta: "#c9c5b6",
  watchdog: "#6fa8c7",
  marker: "#f2efe6",
} as const;

export type Tier = "domain" | "meta" | "watchdog";
