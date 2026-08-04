import {
  DWELL_MS,
  LERP_FIELD,
  LERP_WAKE,
  RADIUS_FAST,
  RADIUS_REF_WIDTH,
  RADIUS_SLOW,
  SPEED_FULL,
} from "./constants";

/**
 * Cursor smoothing, speed sensing, dwell detection, and the autonomous cursor
 * that runs the show when nobody is pointing at it.
 *
 * The pointer handler itself does nothing but store two numbers. Everything
 * derived happens inside the frame loop, where it is already paying for a
 * tick — that keeps input latency (and INP) off the event handler.
 */
export class Pointer {
  /** Raw, written by the event handler. */
  rawX = 0;
  rawY = 0;
  hasInput = false;
  down = false;

  /** Smoothed field centre. */
  mx = 0;
  my = 0;
  /** Trailing centre — the wake. */
  wx = 0;
  wy = 0;

  radius = RADIUS_SLOW;
  strength = 1;
  /** Milliseconds the cursor has been effectively still. */
  dwellMs = 0;

  private prevX = 0;
  private prevY = 0;
  /** Autonomous cursor phase, in seconds. */
  private autoT = 0;
  private handoff = 0;

  constructor(
    private width: number,
    private height: number,
  ) {}

  /** Radius scales with the canvas, so a phone gets a focused spot rather
   *  than a field that engulfs the whole map. */
  private scale = 1;

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.scale = Math.max(0.42, Math.min(1.15, width / RADIUS_REF_WIDTH));
  }

  /** Called from the event handler. Two assignments, nothing else. */
  move(x: number, y: number): void {
    this.rawX = x;
    this.rawY = y;
    if (!this.hasInput) {
      this.hasInput = true;
      this.mx = x;
      this.my = y;
      this.wx = x;
      this.wy = y;
    }
    this.handoff = Math.min(1, this.handoff + 0.02);
  }

  leave(): void {
    this.hasInput = false;
    this.down = false;
  }

  /**
   * A slow figure-eight across the map. It teaches a first-time visitor what
   * the surface does before they touch it, and it is the whole interaction on
   * a touch screen, where there is no cursor to follow.
   */
  private autonomous(dt: number): { x: number; y: number } {
    this.autoT += dt * 0.12;
    const t = this.autoT;
    return {
      x: this.width * (0.5 + 0.34 * Math.sin(t)),
      y: this.height * (0.5 + 0.26 * Math.sin(t * 2.1)),
    };
  }

  update(dt: number): void {
    const auto = this.autonomous(dt);
    // Cross-fade from the autonomous path to the real cursor on first input.
    const blend = this.hasInput ? Math.min(1, this.handoff + dt * 3) : 0;
    this.handoff = blend;
    const tx = auto.x + (this.rawX - auto.x) * blend;
    const ty = auto.y + (this.rawY - auto.y) * blend;

    // Frame-rate independent lerp, so 120 Hz does not double the response.
    const k = 1 - Math.pow(1 - LERP_FIELD, dt * 60);
    const k2 = 1 - Math.pow(1 - LERP_WAKE, dt * 60);
    this.mx += (tx - this.mx) * k;
    this.my += (ty - this.my) * k;
    this.wx += (this.mx - this.wx) * k2;
    this.wy += (this.my - this.wy) * k2;

    const dx = this.mx - this.prevX;
    const dy = this.my - this.prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.prevX = this.mx;
    this.prevY = this.my;

    const speed = Math.min(1, dist / dt / SPEED_FULL);
    // Sweeping fast paints a wide, weak field; slowing down focuses it.
    this.radius = (RADIUS_SLOW + (RADIUS_FAST - RADIUS_SLOW) * speed) * this.scale;
    this.strength = 1 - 0.45 * speed;
    if (this.down) this.radius *= 1.6;

    this.dwellMs = dist < 0.4 ? this.dwellMs + dt * 1000 : 0;
  }

  get dwelling(): boolean {
    return this.dwellMs > DWELL_MS;
  }
}
