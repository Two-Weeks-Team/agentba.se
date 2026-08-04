import Link from "next/link";
import { fontVars } from "@/lib/fonts";
import "./globals.css";

/**
 * With two root layouts and no `app/layout.tsx`, the not-found page inherits
 * nothing — it has to render its own document shell.
 */
export default function NotFound() {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <main className="wrap notfound">
          <p className="eyebrow">404</p>
          <h1 className="sec__h2">No page here.</h1>
          <p className="sec__lede">
            This site is a single page. <Link href="/">Go to it</Link>, or read{" "}
            <Link href="/ko">the Korean version</Link>.
          </p>
        </main>
      </body>
    </html>
  );
}
