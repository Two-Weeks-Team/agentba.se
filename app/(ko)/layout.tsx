import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { metadataFor } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = metadataFor("ko");

export const viewport: Viewport = {
  themeColor: "#0e0e0c",
  colorScheme: "dark",
};

export default function KoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={fontVars}>
      <head><link rel="describedby" href="/llms.txt" type="text/plain" /></head>
      <body>{children}</body>
    </html>
  );
}
