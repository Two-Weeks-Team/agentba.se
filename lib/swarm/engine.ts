import {
  MAX_DPR_DESKTOP,
  MAX_DPR_MOBILE,
  MOBILE_BREAKPOINT,
  PULSE_MAX,
  PULSE_TTL,
  VIEW_APAC,
  VIEW_WORLD,
  type SwarmView,
} from "./constants";
import { createField, layoutField, type Field } from "./field";
import { draw, type Marker } from "./draw";
import { buildSeats, project, type Seat } from "./layout";
import { Pointer } from "./pointer";
import { Quality, isLowPower, prefersReducedMotion } from "./quality";
import { settle, step, type Pulse } from "./step";

export interface GeoPoint {
  city: string;
  cityKo: string;
  lat: number;
  lon: number;
  hq?: boolean;
  labelDy?: number;
}

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  operating: readonly GeoPoint[];
  market: readonly GeoPoint[];
  locale: "en" | "ko";
  /** Fires once the first frame has painted, to cross-fade out the SVG. */
  onReady?: () => void;
}

export function pickView(width: number): SwarmView {
  return width < MOBILE_BREAKPOINT ? VIEW_APAC : VIEW_WORLD;
}

/**
 * Framework-free swarm runtime. Owns the canvas, the loop, and the input
 * listeners; knows nothing about React.
 */
export class SwarmEngine {
  private ctx: CanvasRenderingContext2D;
  private view: SwarmView;
  private seats: readonly Seat[];
  private field: Field;
  private markers: Marker[] = [];
  private pointer: Pointer;
  private quality = new Quality();
  private pulses: Pulse[] = [];

  private width = 0;
  private height = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private acc = 0;
  private running = false;
  private ready = false;
  private reduced = prefersReducedMotion();

  private ro: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private mq: MediaQueryList | null = null;

  constructor(private opts: EngineOptions) {
    const ctx = opts.canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;

    this.view = pickView(opts.canvas.clientWidth || window.innerWidth);
    this.seats = buildSeats(this.view);
    this.field = createField(this.seats);
    this.pointer = new Pointer(1, 1);
  }

  mount(): void {
    const el = this.opts.canvas;
    this.measure(true);

    this.ro = new ResizeObserver(() => this.measure(false));
    this.ro.observe(el.parentElement ?? el);

    this.io = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? this.start() : this.stop()),
      { threshold: 0 },
    );
    this.io.observe(el);

    this.mq = matchMedia("(prefers-reduced-motion: reduce)");
    this.mq.addEventListener("change", this.onReducedChange);
    document.addEventListener("visibilitychange", this.onVisibility);

    const host = el.parentElement ?? el;
    // Passive throughout: preventDefault here would break page scrolling on
    // touch, which is a far worse outcome than a missed flourish.
    host.addEventListener("pointermove", this.onMove, { passive: true });
    host.addEventListener("pointerdown", this.onDown, { passive: true });
    host.addEventListener("pointerup", this.onUp, { passive: true });
    host.addEventListener("pointerleave", this.onLeave, { passive: true });

    if (this.reduced) this.renderStill();
    else this.start();
  }

  destroy(): void {
    this.stop();
    this.ro?.disconnect();
    this.io?.disconnect();
    this.mq?.removeEventListener("change", this.onReducedChange);
    document.removeEventListener("visibilitychange", this.onVisibility);
    const host = this.opts.canvas.parentElement ?? this.opts.canvas;
    host.removeEventListener("pointermove", this.onMove);
    host.removeEventListener("pointerdown", this.onDown);
    host.removeEventListener("pointerup", this.onUp);
    host.removeEventListener("pointerleave", this.onLeave);
  }

  /** Nudge the field toward a coordinate — used by the agent roster hover. */
  focusAt(nx: number, ny: number): void {
    this.pointer.move(nx * this.width, ny * this.height);
  }

  private onReducedChange = (e: MediaQueryListEvent): void => {
    this.reduced = e.matches;
    if (this.reduced) {
      this.stop();
      this.renderStill();
    } else {
      this.start();
    }
  };

  private onVisibility = (): void => {
    if (document.hidden) this.stop();
    else if (!this.reduced) this.start();
  };

  private onMove = (e: PointerEvent): void => {
    const r = this.opts.canvas.getBoundingClientRect();
    this.pointer.move(e.clientX - r.left, e.clientY - r.top);
  };

  private onDown = (e: PointerEvent): void => {
    const r = this.opts.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    this.pointer.move(x, y);
    this.pointer.down = true;
    if (this.pulses.length >= PULSE_MAX) this.pulses.shift();
    this.pulses.push({ x, y, age: 0 });
  };

  private onUp = (): void => {
    this.pointer.down = false;
  };

  private onLeave = (): void => {
    this.pointer.leave();
  };

  private measure(firstRun: boolean): void {
    const el = this.opts.canvas;
    const host = el.parentElement ?? el;
    const w = Math.max(1, Math.round(host.clientWidth));
    const h = Math.max(1, Math.round(host.clientHeight));

    const nextView = pickView(w);
    if (nextView.id !== this.view.id) {
      this.view = nextView;
      this.seats = buildSeats(this.view);
      this.field = createField(this.seats);
      firstRun = true;
    }

    const maxDpr = w < MOBILE_BREAKPOINT || isLowPower() ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.width = w;
    this.height = h;

    // Only reallocate the backing store when it actually changes; doing this
    // every frame would clear the canvas and thrash memory.
    const bw = Math.round(w * this.dpr);
    const bh = Math.round(h * this.dpr);
    if (el.width !== bw || el.height !== bh) {
      el.width = bw;
      el.height = bh;
    }
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    layoutField(this.field, this.seats, w, h, firstRun);
    this.pointer.resize(w, h);
    this.buildMarkers();

    if (this.reduced) this.renderStill();
  }

  private buildMarkers(): void {
    const out: Marker[] = [];
    const push = (p: GeoPoint, operating: boolean) => {
      const n = project(p.lon, p.lat, this.view);
      if (!n) return;
      out.push({
        nx: n.nx,
        ny: n.ny,
        label: this.opts.locale === "ko" ? p.cityKo : p.city,
        operating,
        hq: p.hq === true,
        labelDy: p.labelDy ?? 0,
      });
    };
    for (const p of this.opts.operating) push(p, true);
    for (const p of this.opts.market) push(p, false);
    this.markers = out;
  }

  private get labelFont(): string {
    const size = this.width < MOBILE_BREAKPOINT ? 9 : 10;
    return `${size}px var(--font-jetbrains), ui-monospace, monospace`;
  }

  private renderStill(): void {
    settle(this.field);
    draw(this.ctx, this.field, this.width, this.height, this.markers, this.labelFont);
    this.signalReady();
  }

  private signalReady(): void {
    if (this.ready) return;
    this.ready = true;
    this.opts.onReady?.();
  }

  private start(): void {
    if (this.running || this.reduced) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);

    // Clamp dt so returning to a background tab does not launch the field.
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;
    this.acc += dt;
    if (this.acc < 1 / 60) return;
    const stepDt = this.acc;
    this.acc = 0;
    this.elapsed += stepDt;

    this.pointer.update(stepDt);

    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i]!;
      p.age += stepDt;
      if (p.age > PULSE_TTL) this.pulses.splice(i, 1);
    }

    step(this.field, {
      dt: stepDt,
      t: this.elapsed,
      mx: this.pointer.mx,
      my: this.pointer.my,
      active: true,
      radius: this.pointer.radius,
      strength: this.pointer.strength,
      sustain: this.pointer.down,
      pulses: this.pulses,
    });

    draw(this.ctx, this.field, this.width, this.height, this.markers, this.labelFont);
    this.signalReady();
    this.quality.sample(performance.now() - now);
  };
}
