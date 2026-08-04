/**
 * English is the source of truth for the content shape.
 *
 * Deliberately not `as const`: string literals widen to `string`, so
 * `content/ko/home.ts` can satisfy `HomeContent` with Korean values while a
 * missing or misspelled key is still a compile error.
 *
 * This is a company page. Product arguments — customers, campaign results,
 * category metrics — belong on the product's own site, not here.
 */
export const home = {
  meta: {
    title: "AgentBase — this company runs on agents",
    description:
      "AgentBase is a company whose operating work is performed by software agents. We do not hire for those roles; we build the agents that hold them.",
    ogAlt: "AgentBase — agents across a world map",
  },

  nav: {
    skip: "Skip to content",
    localeLabel: "한국어",
    localeHref: "/ko",
  },

  hero: {
    eyebrow: "AgentBase — Seoul",
    h1: "This company runs on agents.",
    sub: "We do not hire people for the operating roles. We build the agents that hold them, and we run our products on that fleet.",
    stats: [
      { value: "22", label: "agents in the fleet" },
      { value: "2", label: "people" },
      { value: "7", label: "approval gates" },
    ],
    swarmLegend:
      "Each square is a unit of operating work. Move the cursor: scattered work falls into formation. Colour mix mirrors the fleet — 16 domain, 3 meta, 3 watchdog.",
    swarmHint: "Move · hold · click",
  },

  fleet: {
    eyebrow: "01 — The fleet",
    h2: "Twenty-two agents, named and accounted for.",
    lede: "Not a free-roaming loop. Each one is a function a durable workflow invokes for a judgment-heavy sub-task: a system prompt, a curated tool subset, an output contract, a spend cap, and a defined escalation.",
    groups: {
      domain: "Domain",
      meta: "Meta",
      watchdog: "Watchdog",
    },
    groupNotes: {
      domain: "Do the operating work.",
      meta: "Route, score, and tune the ones that do.",
      watchdog: "Watch drift, spend, and the trust boundary.",
    },
  },

  ledger: {
    eyebrow: "02 — The replacement ledger",
    h2: "Eight seats a person used to sit in.",
    lede: "The left column is quoted verbatim from our internal agent roster, written before this website existed. We did not rewrite them to read better. They read like someone's actual job because they were — ours.",
    wasLabel: "before · human",
    nowLabel: "after · agent",
    footnote:
      "…and 14 more agents doing work that had no human predecessor at all.",
    sourceNote: "Quoted from our agent roster.",
  },

  workflow: {
    eyebrow: "03 — How the work moves",
    h2: "Autonomy is a setting, not a personality.",
    lede: "Work moves through named stages, and every irreversible action sits behind a named gate. Gates ship on by default. An operator moves the whole workspace between three levels — and the level, not the mood of a model, decides what happens without a human.",
    stagesTitle: "Stages",
    gatesTitle: "Gates",
    levelsTitle: "Autonomy levels",
    hitl: "required",
    defaultTag: "default",
  },

  economics: {
    eyebrow: "04 — The operating layer",
    h2: "$2,400 and 45 hours became $7.40 and 2 hours.",
    lede: "The same piece of work, priced two ways. The left column is what an outside operator charges to run it, plus the hours it takes them. Ours is metered agent and infrastructure cost, plus the hours a person spends at the gates.",
    hoursLabel: "human hours",
    costLabel: "operating cost",
    excludedLabel: "excluded from this comparison",
  },

  staffing: {
    eyebrow: "05 — How we staff",
    h2: "We don't hire people. We build agents.",
    lede: "That is a statement about where headcount goes, not about who is accountable. Two people run this company, and the boundary between what they decide and what the fleet executes is written down, versioned, and enforced in code.",
    humanTitle: "What stays with a person",
    human: [
      "Anything irreversible: releasing spend, signing a contract, final sign-off on published work.",
      "Setting the autonomy level, and moving it.",
      "Deciding what the company builds next.",
      "Everything on this page. Two names, at the bottom.",
    ],
    agentTitle: "What the fleet holds",
    agent: [
      "The operating roles a company this size would otherwise hire for.",
      "The work that runs on a schedule, and the work nobody wants to do twice.",
      "The checks on its own output — scoring, cost, drift, and the trust boundary.",
    ],
    requiredNote: "Gates a person can never delegate: ",
  },

  company: {
    eyebrow: "06 — The company itself",
    h2: "The same rule applies inward.",
    lede: "Merging to main is the release — no human runs a deploy command. Deploys to the agent service land as a zero-traffic canary and promoting one stays a deliberate human decision: the same gate-shaped governance the products are built on.",
    gatesTitle: "Gates on every pull request",
    testsTitle: "Test suites that block the merge",
    siteNote:
      "This website is in that loop too. The figures on this page are a JSON snapshot committed to a public repository and rendered on the server — nothing here is fetched after the page loads.",
  },

  products: {
    eyebrow: "07 — What we operate",
    h2: "The fleet is not the product. It is how the products get run.",
    lede: "Each one makes its own case on its own site.",
  },

  geo: {
    eyebrow: "08 — Where we operate",
    h2: "Operating work does not need a local office.",
    operatingTitle: "Operating",
    hqTag: "HQ",
  },

  partners: {
    backedBy: "Backed by",
    builtWith: "Built with",
  },

  footer: {
    wordmark: "agentba.se",
    line: "A company whose operating work is performed by software agents. Seoul.",
    repoLabel: "Source on GitHub",
    snapshot: "Figures on this page come from a snapshot dated",
    rights: "AgentBase.",
  },
};

export type HomeContent = typeof home;
