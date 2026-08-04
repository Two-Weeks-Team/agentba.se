import fleet from "@/data/fleet.json";
import pilot from "@/data/pilot.json";

/**
 * The social card, built from the same snapshot the page renders. When the
 * scheduled job commits new figures, the next deploy regenerates this image —
 * the card cannot quietly go stale against the page.
 *
 * Latin-only by design. `ImageResponse` inlines whatever font it is given, and
 * a Korean face large enough to cover the script is megabytes; a social card
 * is not worth that. It also only supports a subset of CSS — flexbox, no grid.
 */
export function OgCard({ locale }: { locale: "en" | "ko" }) {
  const stats = [
    { value: String(fleet.counts.total), label: "AGENTS" },
    { value: String(pilot.headline.verifiedPosts), label: "VERIFIED POSTS" },
    { value: pilot.headline.views.toLocaleString("en-US"), label: "VIEWS" },
    { value: String(pilot.headline.unapprovedSends), label: "UNAPPROVED SENDS" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0e0e0c",
        color: "#f2efe6",
        padding: "64px 72px",
        fontFamily: "JetBrains Mono",
      }}
    >
      {/* Satori requires an explicit display on any element with more than one
          child, so every wrapper here declares flex even when it looks like
          plain text. */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: -1 }}>
          <span>agentba</span>
          <span style={{ color: "#e8b23a" }}>.</span>
          <span>se</span>
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#6f6b5c", letterSpacing: 2 }}>
          {locale === "ko" ? "SEOUL · KO" : "SEOUL"}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 78, lineHeight: 1.02, letterSpacing: -3 }}>
        This company runs on agents.
      </div>

      <div style={{ display: "flex", borderTop: "1px solid #2a2822", paddingTop: 28 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", flexDirection: "column", marginRight: 64 }}
          >
            <div style={{ display: "flex", fontSize: 44, lineHeight: 1 }}>{s.value}</div>
            <div
              style={{
                display: "flex",
                fontSize: 15,
                color: "#6f6b5c",
                marginTop: 8,
                letterSpacing: 1.5,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
