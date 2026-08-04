import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { alternatesFor, SITE, getContent } from "@/lib/i18n";
import "../globals.css";

const t = getContent("ko");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor("ko"),
  openGraph: {
    type: "website",
    siteName: "AgentBase",
    locale: "ko_KR",
    url: `${SITE}/ko`,
    title: t.meta.title,
    description: t.meta.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0c",
  colorScheme: "dark",
};

export default function KoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
