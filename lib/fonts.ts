import { Instrument_Sans, JetBrains_Mono, Martian_Mono } from "next/font/google";

/**
 * Monospace is this brand's display face, not its caption face.
 *
 * The company name *is* a domain string, so a mono display face is
 * semantically honest rather than decorative — and it sidesteps the
 * Inter-everywhere look that reads as machine-generated in 2026.
 *
 * Preload budget: two faces, latin subset only. JetBrains Mono is used for
 * labels below the fold, so it is deliberately not preloaded.
 */
export const martian = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  display: "swap",
  preload: true,
  weight: ["400", "600", "700"],
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  preload: true,
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

/** Every font variable, for the <html> className. */
export const fontVars = [
  martian.variable,
  instrument.variable,
  jetbrains.variable,
].join(" ");
