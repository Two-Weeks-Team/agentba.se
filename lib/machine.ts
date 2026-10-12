import company from "@/data/company.json";
import competitions from "@/data/competitions.json";
import economics from "@/data/economics.json";
import fleet from "@/data/fleet.json";
import partners from "@/data/partners.json";
import people from "@/data/people.json";
import portfolio from "@/data/portfolio.json";
import products from "@/data/products.json";
import quality from "@/data/quality.json";
import { CONTACT_EMAIL, SITE, type Locale } from "@/lib/i18n";
import { translateText } from "@/assets/landing/locale-core.mjs";
import { renderLandingMarkdown } from "@/lib/landing";

/**
 * The machine-readable mirrors are rendered from the same content modules and
 * the same JSON as the HTML page. There is no second copy of the text, so the
 * two cannot drift apart.
 */
export function renderMarkdown(locale: Locale): string {
  const ko = locale === "ko";
  return [
    renderLandingMarkdown(locale), renderFeaturedWork(locale), ko ? "## 창업자와 연락처" : "## Founders and contact",
    ...people.people.map(p => `- [${p.name}](${p.linkedin}) — ${ko ? "공동 창업자" : "Co-founder"} · ${p.role}`),
    ko ? `이메일: [${company.email}](mailto:${company.email}) — 보내주신 메일은 두 창업자가 직접 읽습니다.`
      : `Email: [${company.email}](mailto:${company.email}) — both founders read every line.`,
    `${ko ? "회사 정보" : "Company data"}: ${SITE}/data/company.json`, "",
  ].join("\n\n");
}

/** Curated public links shared by the index and the redesign's text mirror. */
export function renderFeaturedWork(locale: Locale = "en"): string {
  const productLinks = products.featured.map((id) => {
    const product = products.products.find((p) => p.id === id);
    if (!product) throw new Error(`Missing featured product: ${id}`);
    return `- [${product.name}](${product.url}): ${product.one[locale]} ${translateText(product.scope, locale)}`;
  });
  const technologyLinks = portfolio.featured.map((id) => {
    const project = portfolio.entries.find((p) => p.id === id);
    const link = project?.links.find((l) => l.label === "site" || l.label === "live");
    if (!project || !link) throw new Error(`Missing public evidence for featured technology: ${id}`);
    return `- [${project.name}](${link.url}): ${project.one[locale]}`;
  });

  return `## ${locale === "ko" ? "제품과 운영" : "Products and operations"}
${productLinks.join("\n")}

## ${locale === "ko" ? "핵심 기술" : "Core technology"}
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
- [Company page, Korean](${SITE}/ko/index.md): the same renewed page in Korean, including product scope and founder profiles
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
