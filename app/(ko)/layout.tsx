import type { Metadata, Viewport } from "next";
import { metadataFor } from "@/lib/seo";
import { LandingLayout } from "@/components/pages/landing-layout";

export const metadata: Metadata = metadataFor("ko");

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  colorScheme: "light",
};

export default function KoLayout({ children }: { children: React.ReactNode }) {
  return <LandingLayout locale="ko">{children}</LandingLayout>;
}
