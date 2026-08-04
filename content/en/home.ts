/**
 * English is the source of truth for the content shape.
 *
 * Deliberately not `as const`: string literals widen to `string`, so
 * `content/ko/home.ts` can satisfy `HomeContent` with Korean values while a
 * missing or misspelled key is still a compile error.
 */
export const home = {
  meta: {
    title: "AgentBase — this company runs on agents",
    description:
      "AgentBase builds and operates products whose day-to-day work is performed by software agents. 22 agents, a six-stage workflow, seven approval gates, and a campaign that ran end to end.",
    ogAlt: "AgentBase — 22 agents across a world map",
  },

  nav: {
    skip: "Skip to content",
    repo: "GitHub",
    localeLabel: "한국어",
    localeHref: "/ko",
  },

  hero: {
    eyebrow: "AgentBase — Seoul",
    h1: "This company runs on agents.",
    sub: "We build and operate products whose day-to-day work is performed by software agents. Below is what they do, and what they have already done.",
    stats: [
      { value: "22", label: "agents in the fleet" },
      { value: "6", label: "stage workflow" },
      { value: "7", label: "approval gates" },
    ],
    swarmLegend:
      "Each square is a unit of campaign work. Move the cursor: scattered work falls into formation. Colour mix mirrors the fleet — 16 domain, 3 meta, 3 watchdog.",
    swarmHint: "Move · hold · click",
  },

  fleet: {
    eyebrow: "01 — The fleet",
    h2: "Twenty-two agents, named and accounted for.",
    lede: "Not a free-roaming loop. Each one is a function the durable workflow invokes for a judgment-heavy sub-task: a system prompt, a curated tool subset, an output contract, a spend cap, and a defined escalation.",
    groups: {
      domain: "Domain",
      meta: "Meta",
      watchdog: "Watchdog",
    },
    groupNotes: {
      domain: "Do the campaign work.",
      meta: "Route, score, and tune the ones that do.",
      watchdog: "Watch drift, spend, and the trust boundary.",
    },
  },

  ledger: {
    eyebrow: "02 — The replacement ledger",
    h2: "Eight seats a person used to sit in.",
    lede: "The left column is quoted verbatim from our internal agent roster, written before this website existed. We did not rewrite them to read better. They read like someone's actual job because they were.",
    wasLabel: "v1 · human",
    nowLabel: "v2 · agent",
    footnote:
      "…and 14 more agents doing work that had no human predecessor at all.",
    sourceNote: "Quoted from the agent roster in social-seeding-v2.",
  },

  workflow: {
    eyebrow: "03 — The workflow",
    h2: "Autonomy is a setting, not a personality.",
    lede: "Every irreversible action sits behind a named gate. Gates ship on by default. An operator moves the whole workspace between three levels — and the level, not the mood of a model, decides what happens without a human.",
    stagesTitle: "Six stages",
    gatesTitle: "Seven gates",
    levelsTitle: "Three autonomy levels",
    hitl: "required",
    defaultTag: "default",
  },

  pilot: {
    eyebrow: "04 — It ran",
    h2: "One campaign, carried past the point teams give up.",
    lede: "Wooliliwoo — K-beauty into Mexico. The fleet sourced, wrote, sent, handled the replies, and arranged shipping. Then it did the part that usually gets abandoned: it went back, found the posts, verified them against the brief, and compiled the report.",
    funnelTitle: "The funnel",
    stats: {
      verified: "verified posts",
      verifiedNote: "against a target of 10",
      views: "views",
      engagement: "engagement",
      unapproved: "sends without approval",
    },
  },

  economics: {
    eyebrow: "05 — The operating layer",
    h2: "$2,400 and 45 hours became $7.40 and 2 hours.",
    lede: "Same campaign shape: 20 creators. The agency column is a management fee on creator spend plus manual operations time. Ours is metered agent and infrastructure cost plus the hours a human spends at the gates.",
    hoursLabel: "human hours",
    costLabel: "operating cost",
    excludedLabel: "excluded from this comparison",
  },

  company: {
    eyebrow: "06 — The company itself",
    h2: "The same rule applies inward.",
    lede: "Merging to main is the release — no human runs a deploy command. Deploys to the agent service land as a zero-traffic canary and promoting one stays a deliberate human decision: the same gate-shaped governance the product is built on.",
    gatesTitle: "Gates on every pull request",
    testsTitle: "Test suites that block the merge",
    siteNote:
      "This website is in that loop too. The figures on this page are a JSON snapshot committed to a public repository and rendered on the server — nothing here is fetched after the page loads.",
  },

  geo: {
    eyebrow: "07 — Where we operate",
    h2: "Campaign work does not need a local office.",
    operatingTitle: "Operating",
    marketTitle: "Market coverage",
    marketNote: "TikTok audience we can reach, ranked by users.",
    hqTag: "HQ",
  },

  footer: {
    wordmark: "agentba.se",
    line: "Products are shown on their own sites.",
    product: "socialseed.ing",
    repoLabel: "Source",
    contactLabel: "Contact",
    machineLabel: "For agents",
    snapshot: "Figures on this page come from a snapshot dated",
    rights: "AgentBase. Seoul.",
  },
};

export type HomeContent = typeof home;
