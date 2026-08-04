import landmask from "@/data/landmask.json";

/**
 * Land lookup over the packed bitmask produced by
 * scripts/generate-landmask.ts. Row 0 is the northernmost row; bits are
 * MSB-first within each byte.
 */

const { cols, rows, bounds, bits } = landmask;

/** Decoded once per runtime (once on the server, once in the browser). */
let bytes: Uint8Array | null = null;

function getBytes(): Uint8Array {
  if (bytes) return bytes;
  if (typeof atob === "function") {
    const bin = atob(bits);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    bytes = out;
  } else {
    bytes = new Uint8Array(Buffer.from(bits, "base64"));
  }
  return bytes;
}

/** Is there land at this coordinate? Outside the mask bounds reads as water. */
export function isLand(lon: number, lat: number): boolean {
  if (lat > bounds.latMax || lat < bounds.latMin) return false;

  // Wrap longitude into [-180, 180) so an over-panned view still resolves.
  let l = lon;
  while (l < -180) l += 360;
  while (l >= 180) l -= 360;

  const col = Math.floor(((l - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * cols);
  const row = Math.floor(((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * rows);
  if (col < 0 || col >= cols || row < 0 || row >= rows) return false;

  const bit = row * cols + col;
  const byte = getBytes()[bit >> 3];
  if (byte === undefined) return false;
  return (byte & (0b1000_0000 >> (bit & 7))) !== 0;
}

export const maskMeta = { cols, rows, bounds } as const;
