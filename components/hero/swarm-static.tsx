import geo from "@/data/geo.json";
import { COLORS, VIEW_APAC, VIEW_WORLD, type SwarmView } from "@/lib/swarm/constants";
import { buildSeats, project } from "@/lib/swarm/layout";
import { SVG_CELL, seatsToPath, svgViewBox } from "@/lib/swarm/path";
import type { Locale } from "@/lib/i18n";

/**
 * The hero without JavaScript.
 *
 * Rendered on the server from the same seat generator the canvas uses, so the
 * cross-fade between this and the live layer is invisible. Every dot is one
 * `<path>` — around 1 kB gzipped for the world, 0.4 kB for Asia-Pacific —
 * rather than three thousand DOM nodes.
 *
 * Both views ship and CSS picks one. The server cannot know the viewport
 * width, and a letterboxed world map behind an Asia-Pacific canvas would be a
 * visible seam during the cross-fade.
 */
function ViewSvg({ view, locale, className }: { view: SwarmView; locale: Locale; className: string }) {
  const seats = buildSeats(view);
  const d = seatsToPath(seats, view);
  const w = view.cols * SVG_CELL;
  const h = view.rows * SVG_CELL;

  const markers = [
    ...geo.operating.map((p) => ({ ...p, operating: true, hq: "hq" in p && p.hq === true })),
    ...geo.market.map((p) => ({ ...p, operating: false, hq: false })),
  ]
    .map((p) => {
      const n = project(p.lon, p.lat, view);
      return n ? { ...p, x: n.nx * w, y: n.ny * h } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <svg
      className={className}
      viewBox={svgViewBox(view)}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill={COLORS.graphite} />
      {markers.map((m) => (
        <g key={m.id}>
          <circle
            cx={m.x}
            cy={m.y}
            r={m.hq ? 4 : 3}
            fill={m.operating ? (m.hq ? COLORS.marker : COLORS.domain) : "none"}
            stroke={m.operating ? "none" : COLORS.watchdog}
            strokeWidth={1}
          />
          {m.operating ? (
            <text
              x={m.x + 7}
              y={m.y + 3 + ("labelDy" in m && typeof m.labelDy === "number" ? m.labelDy : 0)}
              fill={COLORS.marker}
              fillOpacity={m.hq ? 0.95 : 0.62}
              fontSize={9}
              fontFamily="var(--font-jetbrains), ui-monospace, monospace"
            >
              {locale === "ko" ? m.cityKo : m.city}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function SwarmStatic({ locale }: { locale: Locale }) {
  return (
    <>
      <ViewSvg view={VIEW_WORLD} locale={locale} className="viz-static viz-static--world" />
      <ViewSvg view={VIEW_APAC} locale={locale} className="viz-static viz-static--apac" />
    </>
  );
}
