import type { Seat } from "./layout";
import type { SwarmView } from "./constants";

/** Units per grid cell in the static SVG's coordinate space. */
export const SVG_CELL = 4;
export const SVG_DOT = 2;

/**
 * Every dot as one `<path>`, using relative movetos so the deltas stay small
 * and repetitive — which is what makes it compress. One path element also
 * means the browser parses one node instead of three thousand.
 */
export function seatsToPath(seats: Seat[], view: SwarmView): string {
  const w = view.cols * SVG_CELL;
  const h = view.rows * SVG_CELL;
  const parts: string[] = [];
  let px = 0;
  let py = 0;

  for (const s of seats) {
    const x = Math.round(s.nx * w) - SVG_DOT / 2;
    const y = Math.round(s.ny * h) - SVG_DOT / 2;
    parts.push(`m${x - px} ${y - py}h${SVG_DOT}v${SVG_DOT}h-${SVG_DOT}z`);
    px = x;
    py = y;
  }

  return parts.join("");
}

export function svgViewBox(view: SwarmView): string {
  return `0 0 ${view.cols * SVG_CELL} ${view.rows * SVG_CELL}`;
}
