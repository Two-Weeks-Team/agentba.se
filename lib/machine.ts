import company from "@/data/company.json";
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
import { CONTACT_EMAIL, SITE, getContent, type Locale } from "@/lib/i18n";
import { NEWEST_SNAPSHOT } from "@/lib/snapshot";
import { renderLandingMarkdown } from "@/lib/landing";

/**
 * The machine-readable mirrors are rendered from the same content modules and
 * the same JSON as the HTML page. There is no second copy of the text, so the
 * two cannot drift apart.
 */
export function renderMarkdown(locale: Locale): string {
  if (locale === "en") return [
    renderLandingMarkdown(), renderFeaturedWork(), "## Founders and contact",
    ...people.people.map(p => `- [${p.name}](${p.linkedin}) — Co-founder · ${p.role}`),
    `Email: [${company.email}](mailto:${company.email}) — both founders read every line.`,
    `Company data: ${SITE}/data/company.json`, "",
  ].join("\n\n");
  const t = getContent(locale);
  const L = (en: string, ko: string) => (locale === "ko" ? ko : en);
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

  out.push(
    `## ${t.about.eyebrow}`,
    "",
    t.about.identity,
    "",
    t.about.founder,
    "",
    t.about.business,
    "",
  );

  out.push(`## ${t.fleet.eyebrow}`, "", t.fleet.lede, "");
  out.push(fleet.scope, "");
  for (const tier of ["domain", "meta", "watchdog"] as const) {
    const members = fleet.agents.filter((a) => a.tier === tier);
    out.push(`### ${t.fleet.groups[tier]} (${members.length})`, "");
    for (const a of members) out.push(`- \`${a.id}\` — ${a.role}`);
    out.push("");
  }

  out.push(`## ${t.ledger.eyebrow}`, "", t.ledger.lede, "");
  out.push(replacements.scope, "");
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
  out.push(quality.scope, "");
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
    out.push(`- [${p.name}](${p.url}) — ${p.one[locale]} ${p.scope}`);
  }
  out.push("");

  // Every entry carries at least one link a reader can open and check, so the
  // links travel with the line rather than sitting in a separate list.
  out.push(`## ${t.lab.eyebrow}`, "", t.lab.lede, "");
  out.push(portfolio.scope, "");
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
  out.push(competitions.scope, "");
  out.push("| date | event | project | result |", "| --- | --- | --- | --- |");
  for (const e of competitions.entries) {
    // `result` is a plain string in the JSON; the content map is the only place
    // the vocabulary is spelled out, so index it rather than widen the map.
    const label = t.record.results[e.result as keyof typeof t.record.results];
    const prize = e.prize ? `, ${e.prize[locale]}` : "";
    // The page prints the announcement date beside a judging row; without it
    // here the mirror would say less than the page it mirrors.
    const announce = e.announceOn
      ? `, ${L("announced", "발표")} ${e.announceOn}`
      : "";
    out.push(
      `| ${e.date} | ${cell(`${e.event} (${e.organizer})`)} | ${cell(e.project)} | ${label}${prize}${announce} |`,
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
    `${t.intake.fallback.prefix} [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) ${t.intake.fallback.suffix}`,
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
  for (const p of people.people) out.push(`- Co-founder · ${p.role}: [${p.name}](${p.linkedin})`);
  out.push("", `© 2026 ${t.footer.rights} · [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`);
  out.push("", `${SITE}`, "");
  return out.join("\n");
}

/** Curated public links shared by the index and the redesign's text mirror. */
export function renderFeaturedWork(): string {
  const productLinks = products.featured.map((id) => {
    const product = products.products.find((p) => p.id === id);
    if (!product) throw new Error(`Missing featured product: ${id}`);
    return `- [${product.name}](${product.url}): ${product.one.en} ${product.scope}`;
  });
  const technologyLinks = portfolio.featured.map((id) => {
    const project = portfolio.entries.find((p) => p.id === id);
    const link = project?.links.find((l) => l.label === "site" || l.label === "live");
    if (!project || !link) throw new Error(`Missing public evidence for featured technology: ${id}`);
    return `- [${project.name}](${link.url}): ${project.one.en}`;
  });

  return `## Products and operations
${productLinks.join("\n")}

## Core technology
${technologyLinks.join("\n")}`;
}

export function renderLlmsTxt(): string {
  return `# AgentBase

> AgentBase LLC builds and operates AI agent fleets for real business operations.

${company.identity}

Founded by ${people.people.map((p) => `[${p.name}](${p.linkedin}) (Co-founder · ${p.role})`).join(" and ")}.
Business inquiries: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) — both founders read every line.

${company.business}

The operating fleet currently runs on ${company.models.join(" and ")} models.
The Claude Code integrations described below are developer tools from our team's engineering work.

${renderFeaturedWork()}

## Long-term direction
- [AgentBase mission](${SITE}/): ${company.mission} ${company.missionScope}

## Company and evidence
- [Company page, English](${SITE}/index.md): the full English page as Markdown, including product scope and founder profiles
- [Company page, Korean](${SITE}/ko/index.md): the Korean page as Markdown, with the same company facts
- [company.json](${SITE}/data/company.json): legal entity, founding month, business, mission and contact
- [people.json](${SITE}/data/people.json): the two founders' names, roles and LinkedIn profiles; business contact is ${CONTACT_EMAIL}
- [products.json](${SITE}/data/products.json): products, public links, implementation stages and operating scope

## Optional
- [portfolio.json](${SITE}/data/portfolio.json): team projects, including work begun before AgentBase LLC was founded in August 2026; developer tools, prototypes and public evidence links
- [fleet.json](${SITE}/data/fleet.json): source-defined agent roles and workflow contracts captured ${fleet.capturedAt}; not a count of live or deployed agents
- [replacements.json](${SITE}/data/replacements.json): historical task-to-agent mappings; definitions do not establish deployed replacements
- [economics.json](${SITE}/data/economics.json): an illustrative cost model dated ${economics.modeledAt}, before incorporation; scenario inputs, not audited company results or promised savings
- [quality.json](${SITE}/data/quality.json): source-project tests and CI captured ${quality.measuredAt}; not the current website's test results
- [competitions.json](${SITE}/data/competitions.json): historical team record captured ${competitions.capturedAt}, including work before incorporation; pending labels reflect that date
- [partners.json](${SITE}/data/partners.json): historical programs and technology snapshot captured ${partners.capturedAt}
- [geo.json](${SITE}/data/geo.json): locations where work has run, not a list of company offices
`;
}
