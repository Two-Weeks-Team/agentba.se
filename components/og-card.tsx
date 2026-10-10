import { readFileSync } from "node:fs";
import { join } from "node:path";
import company from "@/data/company.json";
import { MARK_ASPECT, markDataUri } from "@/lib/brand";
export { OG_SIZE } from "@/lib/seo";

const diagram = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "assets/brand/og-organization.svg")).toString("base64")}`;

/** English brand artwork shared by both locales; rendered with local fonts. */
export function OgCard() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", color: "#000000", fontFamily: "JetBrains Mono" }}>
      <div style={{ position: "absolute", left: 48, right: 48, top: 32, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markDataUri("#000000", 80)} alt="" width={Math.round(32 * MARK_ASPECT)} height={32} />
          <span style={{ fontFamily: "Bebas Neue", fontSize: 36 }}>AGENTBASE</span>
        </div>
        <span style={{ fontSize: 15, letterSpacing: 1.2 }}>AI AGENT FLEETS</span>
      </div>
      <div style={{ position: "absolute", left: 48, right: 48, top: 96, height: 1, background: "#000000" }} />

      <div style={{ position: "absolute", left: 48, top: 125, display: "flex", flexDirection: "column", fontFamily: "Bebas Neue", fontSize: 88, lineHeight: .94, letterSpacing: -.8 }}>
        <span>BUILD A COMPANY.</span>
        <span style={{ marginTop: 12, display: "flex" }}>
          <span style={{ color: "#ffffff", WebkitTextStroke: "1.5px #000000" }}>DEPLOY</span>
          <span style={{ marginLeft: 16 }}>ITS</span>
        </span>
        <span>WORKFORCE.</span>
      </div>
      <div style={{ position: "absolute", left: 48, top: 436, display: "flex", flexDirection: "column", fontSize: 21, lineHeight: 1.5 }}>
        <span>AI agent fleets for</span>
        <span>real business operations.</span>
      </div>

      {/* Same geometry as the interactive hero, rendered as a crawlable image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={diagram} alt="" width={600} height={450} style={{ position: "absolute", left: 565, top: 108 }} />
      <div style={{ position: "absolute", left: 838, top: 128, display: "flex", background: "#000000", color: "#ffffff", padding: "7px 10px", fontSize: 12 }}>HUMAN DIRECTION</div>
      <div style={{ position: "absolute", left: 602, top: 286, display: "flex", background: "#ffffff", border: "1px solid #000000", padding: "7px 10px", fontSize: 12 }}>AGENT DEPARTMENTS</div>
      <div style={{ position: "absolute", left: 853, top: 486, display: "flex", background: "#ffffff", border: "1px solid #000000", padding: "7px 10px", fontSize: 12 }}>BUSINESS OPERATIONS</div>
      <div style={{ position: "absolute", right: 48, top: 537, display: "flex", fontSize: 10, letterSpacing: .4 }}>CONCEPTUAL ORGANIZATION</div>

      <div style={{ position: "absolute", left: 48, right: 48, bottom: 62, height: 1, background: "#000000" }} />
      <div style={{ position: "absolute", left: 48, right: 48, bottom: 27, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span>{company.legalName} · {company.country}</span>
        <span>agentba.se</span>
      </div>
    </div>
  );
}

export const OG_CONTENT_TYPE = "image/png";
