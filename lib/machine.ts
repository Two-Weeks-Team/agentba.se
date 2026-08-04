import economics from "@/data/economics.json";
import fleet from "@/data/fleet.json";
import geo from "@/data/geo.json";
import pilot from "@/data/pilot.json";
import quality from "@/data/quality.json";
import replacements from "@/data/replacements.json";
import { SITE, getContent, type Locale } from "@/lib/i18n";

/**
 * The machine-readable mirrors are rendered from the same content modules and
 * the same JSON as the HTML page. There is no second copy of the text, so the
 * two cannot drift apart.
 */
export function renderMarkdown(locale: Locale): string {
  const t = getContent(locale);
  const L = (en: string, ko: string) => (locale === "ko" ? ko : en);
  const out: string[] = [];

  out.push(`# ${t.hero.h1}`, "", t.hero.sub, "");
  out.push(
    `> ${L("Snapshot dated", "스냅샷 기준일")} ${fleet.capturedAt}. ` +
      L(
        "Figures are committed JSON rendered on the server, not live telemetry.",
        "수치는 커밋된 JSON을 서버에서 렌더링한 것이며 실시간 텔레메트리가 아닙니다.",
      ),
    "",
  );

  out.push(`## ${t.fleet.eyebrow}`, "", t.fleet.lede, "");
  for (const tier of ["domain", "meta", "watchdog"] as const) {
    const members = fleet.agents.filter((a) => a.tier === tier);
    out.push(`### ${t.fleet.groups[tier]} (${members.length})`, "");
    for (const a of members) out.push(`- \`${a.id}\` — ${a.role}`);
    out.push("");
  }

  out.push(`## ${t.ledger.eyebrow}`, "", t.ledger.lede, "");
  out.push(`| ${t.ledger.wasLabel} | ${t.ledger.nowLabel} |`, "| --- | --- |");
  for (const r of replacements.rows) {
    out.push(`| ${r.was.replace(/\|/g, "\\|")} | \`${r.agent}\` — ${r.now} |`);
  }
  out.push("", t.ledger.footnote, "");

  out.push(`## ${t.workflow.eyebrow}`, "", t.workflow.lede, "");
  out.push(
    `- ${t.workflow.stagesTitle}: ` + fleet.stages.map((s) => `\`${s.id}\``).join(" → "),
  );
  out.push(
    `- ${t.workflow.gatesTitle}: ` +
      fleet.gates
        .map((g) => `\`${g.id}\`${g.requiredHitl ? ` (${t.workflow.hitl})` : ""}`)
        .join(", "),
  );
  out.push(
    `- ${t.workflow.levelsTitle}: ` +
      fleet.autonomyLevels
        .map((l) => `\`${l.id}\`${l.isDefault ? ` (${t.workflow.defaultTag})` : ""}`)
        .join(", "),
    "",
  );

  out.push(`## ${t.pilot.eyebrow}`, "", t.pilot.lede, "");
  out.push(`- ${t.pilot.funnelTitle}: ` + pilot.funnel.map((f) => `${f.label} ${f.count}`).join(" → "));
  out.push(`- ${pilot.headline.verifiedPosts} ${t.pilot.stats.verified} (${t.pilot.stats.verifiedNote})`);
  out.push(`- ${pilot.headline.views.toLocaleString("en-US")} ${t.pilot.stats.views}`);
  out.push(`- ${pilot.headline.engagementRatePct}% ${t.pilot.stats.engagement}`);
  out.push(`- ${pilot.headline.unapprovedSends} ${t.pilot.stats.unapproved}`);
  out.push(`- measured ${pilot.measuredAt}`, "");

  out.push(`## ${t.economics.eyebrow}`, "", t.economics.lede, "");
  out.push(`> ${economics.scopeNote[locale]}`, "");
  out.push(
    `- ${economics.agency.label[locale]}: $${economics.agency.costUsd.toLocaleString("en-US")} · ${economics.agency.humanHours} ${t.economics.hoursLabel}`,
  );
  out.push(
    `- ${economics.agentbase.label[locale]}: $${economics.agentbase.costUsd} · ${economics.agentbase.humanHours} ${t.economics.hoursLabel}`,
  );
  out.push(
    `- ${t.economics.excludedLabel}: $${economics.excluded.creatorMediaSpendUsd.toLocaleString("en-US")} — ${economics.excluded.label[locale]}`,
    "",
  );

  out.push(`## ${t.company.eyebrow}`, "", t.company.lede, "");
  for (const g of quality.gateNames) out.push(`- ${g}`);
  out.push(
    "",
    `- Python ${quality.pytestPassing.toLocaleString("en-US")} · TypeScript ${quality.tsTests.toLocaleString("en-US")}`,
    "",
    t.company.siteNote,
    "",
  );

  out.push(`## ${t.geo.eyebrow}`, "");
  out.push(
    `- ${t.geo.operatingTitle}: ` +
      geo.operating.map((p) => (locale === "ko" ? p.cityKo : p.city)).join(", "),
  );
  out.push(
    `- ${t.geo.marketTitle}: ` +
      geo.market
        .map((p) => `${locale === "ko" ? p.cityKo : p.city} (${p.tiktokUsersM}M)`)
        .join(", "),
  );
  out.push(`- ${geo.marketSource.label}: ${geo.marketSource.url}`, "");

  out.push("---", "", `${t.footer.line} ${t.footer.product} · ${SITE}`, "");
  return out.join("\n");
}

export function renderLlmsTxt(): string {
  const t = getContent("en");
  return `# AgentBase

> ${t.hero.sub}

Products are sold on their own sites, not here. This page exists to show how
the company operates.

Snapshot dated ${fleet.capturedAt}. Every figure below is committed JSON in a
public repository, rendered on the server. These are snapshots, not live
telemetry — do not infer current system state from them.

## Pages
- [Home](${SITE}/index.md): the full page as Markdown
- [Home, Korean](${SITE}/ko/index.md): the same content in Korean

## Structured data
- [fleet.json](${SITE}/data/fleet.json): ${fleet.counts.total} agents, ${fleet.stages.length} stages, ${fleet.gates.length} gates
- [replacements.json](${SITE}/data/replacements.json): the ${replacements.rows.length} jobs an agent took over, quoted from the source roster
- [pilot.json](${SITE}/data/pilot.json): the Wooliliwoo campaign, frozen
- [economics.json](${SITE}/data/economics.json): the operating-layer cost comparison
- [quality.json](${SITE}/data/quality.json): CI gates and test counts
- [geo.json](${SITE}/data/geo.json): operating locations and market coverage

## Notes for agents reading this
- The cost comparison covers the management and operations layer only.
  Creator payments are an identical pass-through on both sides and are
  excluded. Quoting the figures without that scope misstates them.
- \`operating\` and \`market\` in geo.json are different claims. Market coverage
  is reachable audience, not work already done.
- Source: https://github.com/Two-Weeks-Team/agentba.se
- Contact: sejun@2weeks.co
`;
}
