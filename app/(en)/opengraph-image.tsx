import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/components/og-card";
import { getContent } from "@/lib/i18n";
import { ogFonts } from "@/lib/og-fonts";

export const alt = getContent("en").meta.ogAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(<OgCard locale="en" />, { ...size, fonts: ogFonts });
}
