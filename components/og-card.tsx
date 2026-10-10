import { readFileSync } from "node:fs";
import { join } from "node:path";
import company from "@/data/company.json";
import { MARK_ASPECT, markDataUri } from "@/lib/brand";
export { OG_SIZE } from "@/lib/seo";

const diagram = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "assets/brand/og-organization.svg")).toString("base64")}`;
const colors = { canvas: "#f7f6f2", ink: "#242421", muted: "#66665e", rule: "#dedbd2" };
const labelStyle = {
  position: "absolute" as const,
  display: "flex",
  background: colors.canvas,
  color: colors.muted,
  border: `1px solid ${colors.rule}`,
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 14,
};

/** English brand artwork shared by both locales; rendered with local fonts. */
export function OgCard() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: colors.canvas, color: colors.ink, fontFamily: "Inter", fontWeight: 400 }}>
      <div style={{ position: "absolute", left: 56, right: 56, top: 36, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markDataUri(colors.ink, 80)} alt="" width={Math.round(32 * MARK_ASPECT)} height={32} />
          <span style={{ fontFamily: "Inter", fontSize: 28, letterSpacing: -1.2 }}>AgentBase</span>
        </div>
        <span style={{ fontSize: 16, color: colors.muted }}>AI agent fleets</span>
      </div>

      <div style={{ position: "absolute", left: 56, top: 146, display: "flex", flexDirection: "column", fontFamily: "Newsreader", fontSize: 88, lineHeight: 1.02, letterSpacing: -2.4 }}>
        <span>Build a company.</span>
        <span>Deploy its</span>
        <span>workforce.</span>
      </div>
      <div style={{ position: "absolute", left: 56, top: 452, display: "flex", flexDirection: "column", fontSize: 22, lineHeight: 1.45, color: colors.muted }}>
        <span>AI agent fleets for</span>
        <span>real business operations.</span>
      </div>

      {/* Same geometry as the interactive hero, rendered as a crawlable image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={diagram} alt="" width={576} height={432} style={{ position: "absolute", left: 588, top: 132 }} />
      <div style={{ ...labelStyle, left: 832, top: 154 }}>Human direction</div>
      <div style={{ ...labelStyle, left: 628, top: 300 }}>Agent departments</div>
      <div style={{ ...labelStyle, left: 852, top: 496 }}>Business operations</div>
      <div style={{ position: "absolute", right: 56, top: 544, display: "flex", fontSize: 11, color: colors.muted }}>Conceptual organization</div>

      <div style={{ position: "absolute", left: 56, right: 56, bottom: 58, height: 1, background: colors.rule }} />
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 26, display: "flex", justifyContent: "space-between", fontSize: 14, color: colors.muted }}>
        <span>{company.legalName} · {company.country}</span>
        <span>agentba.se</span>
      </div>
    </div>
  );
}

export const OG_CONTENT_TYPE = "image/png";
