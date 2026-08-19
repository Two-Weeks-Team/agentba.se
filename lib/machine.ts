import competitions from "@/data/competitions.json";
import economics from "@/data/economics.json";
import fleet from "@/data/fleet.json";
import geo from "@/data/geo.json";
import partners from "@/data/partners.json";
import people from "@/data/people.json";
import portfolio from "@/data/portfolio.json";
import products from "@/data/products.json";
import quality from "@/data/quality.json";
import replacements from "@/data/replacements.json";
import { SITE, getContent, type Locale } from "@/lib/i18n";
import { NEWEST_SNAPSHOT } from "@/lib/snapshot";

/**
 * The machine-readable mirrors are rendered from the same content modules and
 * the same JSON as the HTML page. There is no second copy of the text, so the
 * two cannot drift apart.
 */
export function renderMarkdown(locale: Locale): string {
  const t = getContent(locale);
  const L = (en: string, ko: string) => (locale === "ko" ? ko : en);
  const name = (p: { name: string; nameKo: string }) =>
    locale === "ko" ? p.nameKo : p.name;
  /** A pipe inside a table cell would end the column early. */
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  const out: string[] = [];

  out.push(`# ${t.hero.h1}`, "", t.hero.sub, "");
  out.push(
    `> ${L("Newest snapshot dated", "가장 최근 스냅샷 기준일")} ${NEWEST_SNAPSHOT}. ` +
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

  out.push(`## ${t.economics.eyebrow}`, "", t.economics.lede, "");
  out.push(`> ${economics.scopeNote[locale]}`, "");
  out.push(
    `- ${economics.outsourced.label[locale]}: $${economics.outsourced.costUsd.toLocaleString("en-US")} · ${economics.outsourced.humanHours} ${t.economics.hoursLabel} (${economics.outsourced.costNote[locale]})`,
  );
  out.push(
    `- ${economics.agentbase.label[locale]}: $${economics.agentbase.costUsd} · ${economics.agentbase.humanHours} ${t.economics.hoursLabel}`,
  );
  out.push(
    `- ${t.economics.excludedLabel}: $${economics.excluded.passThroughUsd.toLocaleString("en-US")} — ${economics.excluded.label[locale]}`,
  );
  out.push(`- ${economics.basis[locale]}`, "");

  out.push(`## ${t.staffing.eyebrow}`, "", `**${t.staffing.h2}**`, "", t.staffing.lede, "");
  out.push(`### ${t.staffing.humanTitle}`, "");
  for (const line of t.staffing.human) out.push(`- ${line}`);
  out.push(
    "",
    `${t.staffing.requiredNote}${fleet.gates
      .filter((g) => g.requiredHitl)
      .map((g) => `\`${g.id}\``)
      .join(", ")}`,
    "",
  );
  out.push(`### ${t.staffing.agentTitle}`, "");
  for (const line of t.staffing.agent) out.push(`- ${line}`);
  out.push("");

  out.push(`## ${t.company.eyebrow}`, "", t.company.lede, "");
  for (const g of quality.gateNames) out.push(`- ${g}`);
  out.push(
    "",
    `- Python ${quality.pytestPassing.toLocaleString("en-US")} · TypeScript ${quality.tsTests.toLocaleString("en-US")}`,
    "",
    t.company.siteNote,
    "",
  );

  out.push(`## ${t.products.eyebrow}`, "", t.products.h2, "");
  for (const p of products.products) {
    out.push(`- [${p.name}](${p.url}) — ${p.one[locale]}`);
  }
  out.push("");

  // Every entry carries at least one link a reader can open and check, so the
  // links travel with the line rather than sitting in a separate list.
  out.push(`## ${t.lab.eyebrow}`, "", t.lab.lede, "");
  for (const e of portfolio.entries) {
    const links = e.links.map((l) => `(${l.label}: ${l.url})`).join(" · ");
    out.push(`- **${e.name}** — ${e.one[locale]} ${links}`);
  }
  out.push("");
  out.push(
    `${t.lab.mentionsLabel}: ` +
      portfolio.mentions.map((m) => `${m.name} — ${m.one[locale]}`).join("; "),
    "",
  );

  // The losses stay in the table. Dropping a row here would make the mirror
  // say something the page does not.
  out.push(`## ${t.record.eyebrow}`, "", t.record.lede, "");
  out.push("| date | event | project | result |", "| --- | --- | --- | --- |");
  for (const e of competitions.entries) {
    // `result` is a plain string in the JSON; the content map is the only place
    // the vocabulary is spelled out, so index it rather than widen the map.
    const label = t.record.results[e.result as keyof typeof t.record.results];
    const prize = e.prize ? `, ${e.prize[locale]}` : "";
    out.push(
      `| ${e.date} | ${cell(`${e.event} (${e.organizer})`)} | ${cell(e.project)} | ${label}${prize} |`,
    );
  }
  out.push("");
  for (const e of competitions.entries) {
    if (e.note) out.push(`- ${e.project}: ${e.note[locale]}`);
  }
  out.push("", t.record.pendingNote, "");
  out.push(competitions.aside.judge[locale], competitions.aside.hosted[locale], "");

  out.push(`## ${t.services.eyebrow}`, "", t.services.lede, "");
  for (const i of t.services.items) out.push(`- **${i.name}** — ${i.body}`);
  out.push("");

  out.push(`## ${t.geo.eyebrow}`, "");
  out.push(
    `- ${t.geo.operatingTitle}: ` +
      geo.operating.map((p) => (locale === "ko" ? p.cityKo : p.city)).join(", "),
  );
  out.push("");

  // No form in a Markdown mirror — the fallback line is the whole instruction.
  out.push(
    `## ${t.intake.eyebrow}`,
    "",
    `**${t.intake.h2}**`,
    "",
    t.intake.lede,
    "",
    t.intake.fallback,
    "",
  );

  out.push(
    `## ${t.partners.grants} / ${t.partners.builtWith}`,
    "",
    // The grant's own terms ask for the name carried with its link.
    `- ${t.partners.grants}: ${partners.grants.map((g) => `${g.name} (${g.url})`).join(", ")}`,
    `- ${t.partners.builtWith}: ${partners.stack.map((s) => s.name).join(", ")}`,
    "",
  );

  out.push("---", "");
  for (const p of people.people) out.push(`- ${p.role} ${name(p)} — ${p.email}`);
  out.push("", `${SITE}`, "");
  return out.join("\n");
}

export function renderLlmsTxt(): string {
  const t = getContent("en");
  return `# AgentBase

> ${t.hero.sub}

This is a company page. Each product argues its own case on its own site;
nothing here is a product pitch.

Newest snapshot dated ${NEWEST_SNAPSHOT}; each file below carries its own
capture date. Every figure below is committed JSON in a
public repository, rendered on the server. These are snapshots, not live
telemetry — do not infer current system state from them.

## Pages
- [Home](${SITE}/index.md): the full page as Markdown
- [Home, Korean](${SITE}/ko/index.md): the same content in Korean

## Structured data
- [fleet.json](${SITE}/data/fleet.json): ${fleet.counts.total} agents, ${fleet.stages.length} stages, ${fleet.gates.length} gates
- [replacements.json](${SITE}/data/replacements.json): the ${replacements.rows.length} jobs an agent took over, quoted from the source roster
- [economics.json](${SITE}/data/economics.json): the operating-layer cost comparison
- [quality.json](${SITE}/data/quality.json): CI gates and test counts
- [products.json](${SITE}/data/products.json): what the company operates
- [portfolio.json](${SITE}/data/portfolio.json): the lab — ${portfolio.entries.length} shipped builds, each with a verifiable link
- [competitions.json](${SITE}/data/competitions.json): the competition record — ${competitions.entries.length} entries, losses included
- [people.json](${SITE}/data/people.json): the two people and how to reach them
- [partners.json](${SITE}/data/partners.json): grants and programs, and the stack the agents run on
- [geo.json](${SITE}/data/geo.json): where the company operates

## Notes for agents reading this
- The cost comparison covers the management and operations layer only. Spend
  that passes through to third parties is identical either way and is
  excluded. Quoting the figures without that scope misstates them.
- Product metrics, customer names and campaign results are deliberately not
  published here. Ask the product's own site.
- Acting for a principal? Email either address below — subject starting
  "brief:", one line about the work, who you act for, and a reply address your
  principal reads. We answer agents the way we answer people: with a brief.
${people.people.map((p) => `- ${p.role}: ${p.name} <${p.email}>`).join("\n")}
`;
}
