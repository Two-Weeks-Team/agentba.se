import type { Metadata, Viewport } from "next";
import { metadataFor } from "@/lib/seo";
import { LandingLayout } from "@/components/pages/landing-layout";

/**
 * There is no `app/layout.tsx`. Each locale group is its own root layout, so
 * `<html lang>` is correct without a middleware doing locale negotiation on
 * every request. The cost is that switching locale is a full page load, which
 * is the behaviour we want anyway.
 */
export const metadata: Metadata = metadataFor("en");

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  colorScheme: "light",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <LandingLayout locale="en">{children}</LandingLayout>;
}
