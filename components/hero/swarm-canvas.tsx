"use client";

import { useEffect, useRef, useState } from "react";
import geo from "@/data/geo.json";
import { SwarmEngine } from "@/lib/swarm/engine";
import { saveData } from "@/lib/swarm/quality";
import type { Locale } from "@/lib/i18n";

/**
 * The live layer. Mounts over the server-rendered SVG and cross-fades in once
 * it has painted its first frame, so a slow device never shows a blank hero.
 *
 * Initialisation is deferred by two animation frames so the browser gets at
 * least one paint in first — the LCP element is the headline text, and it must
 * not wait on this.
 */
export function SwarmCanvas({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Respect Save-Data: the static picture already says everything.
    if (saveData()) return;

    let engine: SwarmEngine | null = null;
    let raf = 0;

    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        try {
          engine = new SwarmEngine({
            canvas,
            operating: geo.operating,
            market: geo.market,
            locale,
            onReady: () => setLive(true),
          });
          engine.mount();
        } catch {
          // A missing 2d context is not worth breaking the page over; the
          // static SVG underneath stays visible.
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      engine?.destroy();
    };
  }, [locale]);

  return (
    <canvas
      ref={ref}
      className="viz-live"
      data-live={live ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
