/*
 * Local illustration grounded in Two-Weeks-Team/social-seeding-v2,
 * 3b22f09ace6a86bd0d1ed324c25272d5e232c871.
 * Personas/artwork: apps/web/lib/fleet.ts, apps/web/public/fleet/*.webp.
 * Sample documents below are authored fixtures, never model/run results.
 * No backend, storage, timers, tool execution, or message sending.
 */

const PORTRAITS = new URL("./media-proposal/social-badges/fleet/", import.meta.url);
const STEPS = ["Assignment", "Draft", "Human review"];
const mounts = new WeakMap();
let sequence = 0;

const PERSONAS = [
  {
    id: "sourcing", name: "Remi", role: "Creator Scout", shortRole: "Discovery",
    scope: "Sandbox scope", tools: ["tiktok.search", "blacklist.check"],
    responsibility: "Turn the brief into search directions and screen candidate eligibility.",
    stages: [
      { title: "Start with the product, not a list.", label: "Sample search brief", rows: [
        ["Product", "A fragrance-free cleanser."],
        ["Look for", "Creators who explain ingredients and everyday skincare routines."],
        ["Constraint", "Use the supplied product facts. Exclude blocked records."],
      ] },
      { title: "A search direction you can inspect.", label: "Illustrative discovery plan", rows: [
        ["Search themes", "Cleanser routines · ingredient explainers"],
        ["Screening", "Check eligibility and the campaign exclusion list."],
        ["Handoff", "Send candidate context to June for a fit review."],
      ] },
      { title: "A person chooses the direction.", label: "Search review", rows: [
        ["Check", "Do these themes match the product and intended audience?"],
        ["Decide", "Refine the direction before reviewing a shortlist."],
        ["Boundary", "This illustration has not searched TikTok or retrieved creators."],
      ] },
    ],
    handoff: "Review the search direction before moving to a shortlist.",
  },
  {
    id: "vetting", name: "June", role: "Fit Analyst", shortRole: "Fit review",
    scope: "Sandbox scope", tools: ["tiktok.getCreator", "ranking.score"],
    responsibility: "Explain creator fit and flag gaps in the supplied profile and post evidence.",
    stages: [
      { title: "Give the reviewer something concrete.", label: "Sample candidate context", rows: [
        ["Profile", "A fictional creator covering ingredient-led skincare."],
        ["Post context", "Routine explainers and cleanser discussions."],
        ["Question", "Does the supplied evidence support this campaign brief?"],
      ] },
      { title: "Reasons for fit. Gaps left visible.", label: "Illustrative fit note", rows: [
        ["Relevant context", "Ingredient explainers align with the brief’s subject."],
        ["Open question", "Current audience and language evidence are still needed."],
        ["Recommendation", "Request that context before approving the candidate."],
      ] },
      { title: "The shortlist remains a decision.", label: "Candidate review", rows: [
        ["Inspect", "Read the source context behind the fit explanation."],
        ["Decide", "Keep the candidate for review, ask for context, or exclude them."],
        ["Boundary", "No real creator has been evaluated in this illustration."],
      ] },
    ],
    handoff: "Inspect the evidence and resolve open questions before approval.",
  },
  {
    id: "outreach-writer", name: "Theo", role: "Outreach Writer", shortRole: "Outreach",
    scope: "Draft implementation · operation unverified",
    tools: ["OpenAI drafting", "outreach.extractFacts", "outreach.judge"],
    responsibility: "Prepare outreach grounded in the supplied product and creator facts.",
    stages: [
      { title: "A clear brief. A closed set of facts.", label: "Sample writing assignment", rows: [
        ["Product fact", "The sample brief describes a fragrance-free cleanser."],
        ["Creator context", "The fictional profile discusses ingredients and daily routines."],
        ["Direction", "Ask about interest. Do not invent terms or product claims."],
      ] },
      { title: "An opening, ready for your review.", label: "Illustrative email · unsent", subject: "A cleanser collaboration to explore",
        paragraphs: [
          "Hello,",
          "Your ingredient-focused routine posts align with this fragrance-free cleanser brief. Would you like to see the product details and collaboration requirements?",
          "Any commercial terms would be reviewed by a person before we confirm them.",
        ] },
      { title: "A draft is not permission to send.", label: "Outbound review", rows: [
        ["Check", "Confirm the product facts, recipient context, and wording."],
        ["Decide", "Approve the draft, revise it, or reject it."],
        ["Boundary", "Real email sending requires human approval. This demo cannot send."],
      ] },
    ],
    handoff: "A person reviews the draft before any real email can be sent.",
  },
  {
    id: "conversation-responder", name: "Mina", role: "Reply Liaison", shortRole: "Replies",
    scope: "Internal proof", tools: ["Reply classification", "templates.render", "outreach.judge"],
    responsibility: "Classify a reply, prepare an answer, and escalate new commitments.",
    stages: [
      { title: "Read the request against the brief.", label: "Sample incoming message", rows: [
        ["Message", "“Could we add another product to the kit?”"],
        ["Approved scope", "The cleanser sample only."],
        ["Direction", "Do not promise an additional item without a person’s approval."],
      ] },
      { title: "A helpful reply, without a new promise.", label: "Illustrative reply · unsent", subject: "About the sample kit",
        paragraphs: [
          "Thanks for asking.",
          "The current brief covers the cleanser sample only. I’ll ask the team to review your request before confirming any additional item.",
          "We can continue once that scope is clear.",
        ] },
      { title: "New commitments go to a person.", label: "Reply handoff", rows: [
        ["Reason", "The request goes beyond the approved product scope."],
        ["Decide", "Confirm or decline the extra item, then review the reply."],
        ["Boundary", "The illustration neither changes the offer nor sends a response."],
      ] },
    ],
    handoff: "A person decides the additional commitment and reviews the response.",
  },
  {
    id: "logistics", name: "Diego", role: "Logistics Lead", shortRole: "Logistics",
    scope: "Internal proof · live carrier unimplemented",
    tools: ["Address normalization", "shipment.create · demo adapter"],
    responsibility: "Prepare shipping details and a handoff for a person to review.",
    stages: [
      { title: "Clarify the shipment before dispatch.", label: "Sample fulfillment assignment", rows: [
        ["Kit", "The approved cleanser sample only."],
        ["Delivery details", "A fictional address record; no personal details displayed."],
        ["Direction", "Prepare a review note. Do not purchase a label or create a shipment."],
      ] },
      { title: "A handoff, not a shipping receipt.", label: "Illustrative dispatch note", rows: [
        ["Kit contents", "Approved sample only; no additional item promised."],
        ["Address check", "Needs confirmation by a person."],
        ["Carrier request", "Not created. The default live carrier adapter is unimplemented."],
      ] },
      { title: "Real dispatch stays outside this demo.", label: "Fulfillment review", rows: [
        ["Check", "Confirm the kit and delivery details."],
        ["Next action", "A person would arrange any real shipment."],
        ["Boundary", "No carrier connection, label purchase, or shipment occurs here."],
      ] },
    ],
    handoff: "Confirm details with a person. Live carrier fulfillment is not implemented.",
  },
  {
    id: "content-verify", name: "Aria", role: "Content Verifier", shortRole: "Evidence",
    scope: "Evidence gate · human review",
    tools: ["Post-text judgment", "Human verification gate"],
    responsibility: "Review post text and supplied evidence; leave final verification to a person.",
    stages: [
      { title: "A mention is only part of the evidence.", label: "Sample content assignment", rows: [
        ["Post text", "A fictional routine caption refers to the cleanser."],
        ["Evidence", "No visual or manual evidence has been supplied."],
        ["Direction", "Keep uncertainty visible. Do not assume the product appears."],
      ] },
      { title: "Missing evidence stays missing.", label: "Illustrative verification note", rows: [
        ["Text finding", "The caption refers to the product in the sample brief."],
        ["Product visibility", "Unconfirmed; supporting evidence is absent."],
        ["Recommendation", "Hold verification and request evidence for human review."],
      ] },
      { title: "Verification needs evidence and a person.", label: "Evidence review", rows: [
        ["Request", "Add visual or manual evidence that supports the product claim."],
        ["Decide", "A person reviews the evidence before the track can be verified."],
        ["Boundary", "This is text-and-evidence review, not demonstrated autonomous vision."],
      ] },
    ],
    handoff: "A human review gate decides whether the supplied evidence is sufficient.",
  },
  {
    id: "analyst", name: "Noor", role: "Performance Analyst", shortRole: "Reporting",
    scope: "Sandbox scope", tools: ["analytics.compile", "Report narration"],
    responsibility: "Turn stored campaign evidence into a report with clear limitations.",
    stages: [
      { title: "Start with the record, not a success story.", label: "Sample reporting assignment", rows: [
        ["Activity", "A fictional record of outreach and content review."],
        ["Evidence", "A sample publication reference approved by a reviewer."],
        ["Direction", "Summarize the supplied record without inventing business results."],
      ] },
      { title: "A report that separates fact from inference.", label: "Illustrative report excerpt", rows: [
        ["Recorded activity", "Content review is recorded in the sample campaign."],
        ["Evidence", "The sample publication reference has a reviewer’s confirmation."],
        ["Next step", "Apply the same review standard to the remaining work."],
      ] },
      { title: "Review what the report can support.", label: "Report review", rows: [
        ["Check", "Trace statements back to stored activity and reviewed evidence."],
        ["Decide", "Correct unsupported interpretations before sharing the report."],
        ["Boundary", "This sample establishes no reach, sales, savings, or return on investment."],
      ] },
    ],
    handoff: "Review the interpretation. A report must not invent outcomes.",
  },
];

function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function portrait(persona) {
  return new URL(`${persona.id}.webp`, PORTRAITS).href;
}

/**
 * Mount into a dedicated element. Repeated mounts clean up the previous instance.
 * Returns { destroy, selectPersona, setStep, replay }; no backend is connected.
 */
export function mountSocialDemo(host) {
  if (!host || host.nodeType !== 1) throw new TypeError("mountSocialDemo needs a host element.");
  mounts.get(host)?.destroy();
  const doc = host.ownerDocument;
  const prefix = `ss-demo-${++sequence}`;
  const root = doc.createElement("section");
  root.className = "social-demo";
  root.setAttribute("aria-label", "Social Seeding interactive illustration");
  let selected = PERSONAS[2];
  let step = 1;
  let destroyed = false;

  root.innerHTML = `
    <header class="ss-masthead">
      <span class="ss-wordmark">Social Seeding<span class="ss-wordmark-rule" aria-hidden="true"></span>Work sample</span>
      <span class="ss-persona-label">AI personas</span>
    </header>
    <div class="ss-roster" role="group" aria-label="Choose an AI persona">
      ${PERSONAS.map((persona) => `
        <button class="ss-person" type="button" data-ss-persona="${persona.id}" aria-pressed="false" aria-label="${escape(persona.name)}, ${escape(persona.role)}" aria-controls="${prefix}-body">
          <img class="ss-person-image" src="${escape(portrait(persona))}" alt="" width="48" height="48" decoding="async">
          <span class="ss-person-text"><span class="ss-person-name">${persona.name}</span><span class="ss-person-role">${persona.shortRole}</span></span>
        </button>`).join("")}
    </div>
    <div class="ss-body" id="${prefix}-body">
      <article class="ss-id" aria-label="Selected AI persona identity card"></article>
      <div class="ss-work">
        <div class="ss-flow" role="group" aria-label="Explore the sample workflow">
          ${STEPS.map((label, index) => `<button class="ss-step" type="button" data-ss-step="${index}" aria-pressed="false" aria-controls="${prefix}-artifact"><span class="ss-step-mark" aria-hidden="true"></span>${label}</button>`).join("")}
        </div>
        <div class="ss-work-content">
          <header class="ss-result-heading"><p class="ss-eyebrow"></p><h3 class="ss-result-title"></h3></header>
          <div class="ss-artifact" id="${prefix}-artifact"></div>
          <div class="ss-handoff"><span class="ss-handoff-symbol" aria-hidden="true">↗</span><div><span class="ss-handoff-label">Human handoff</span><p class="ss-handoff-copy"></p></div><button type="button" class="ss-role-next" data-ss-handoff hidden></button></div>
        </div>
        <div class="ss-controls"><span class="ss-manual">Manual walkthrough</span><div class="ss-control-buttons"><button class="ss-back" type="button" data-ss-action="back"><span aria-hidden="true">←</span> Back</button><button class="ss-next" type="button" data-ss-action="next"></button></div></div>
      </div>
    </div>
    <footer class="ss-caption"><span>Interactive illustration · original agent artwork · sample assignment</span><span>No agent is running. Nothing is sent.</span></footer>
    <p class="ss-announcer" role="status" aria-live="polite" aria-atomic="true"></p>`;

  host.replaceChildren(root);
  const roster = root.querySelector(".ss-roster");
  const identity = root.querySelector(".ss-id");
  const eyebrow = root.querySelector(".ss-eyebrow");
  const title = root.querySelector(".ss-result-title");
  const artifact = root.querySelector(".ss-artifact");
  const handoff = root.querySelector(".ss-handoff-copy");
  const back = root.querySelector(".ss-back");
  const next = root.querySelector(".ss-next");
  const announcer = root.querySelector(".ss-announcer");
  const people = [...root.querySelectorAll(".ss-person")];
  const stepButtons = [...root.querySelectorAll(".ss-step")];

  function render(announce = true) {
    if (destroyed) return;
    const current = selected.stages[step];
    root.dataset.ssPersona = selected.id;
    root.dataset.ssStep = STEPS[step].toLowerCase().replaceAll(" ", "-");
    people.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.ssPersona === selected.id)));
    stepButtons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === step));
      button.setAttribute("aria-label", `Show ${selected.name}’s ${STEPS[index].toLowerCase()}`);
    });
    identity.innerHTML = `
      <div class="ss-badge-slot" aria-hidden="true"></div>
      <div class="ss-id-band"><span>Social Seeding</span><span>AI role</span></div>
      <div class="ss-id-face"><img class="ss-id-portrait" src="${escape(portrait(selected))}" alt="${escape(selected.name)}, illustrated AI persona" width="160" height="160" decoding="async"><div class="ss-id-nameplate"><h3 class="ss-id-name">${selected.name}</h3><p class="ss-id-role">${selected.role}</p></div></div>
      <p class="ss-responsibility">${escape(selected.responsibility)}</p>
      <details class="ss-implementation"><summary>Role &amp; tools <span aria-hidden="true">+</span></summary><div class="ss-method"><span class="ss-small-label">Tools / method</span><ul class="ss-tools">${selected.tools.map((tool) => `<li>${escape(tool)}</li>`).join("")}</ul></div>
      <p class="ss-scope"><span class="ss-small-label">Implementation scope</span>${escape(selected.scope)}</p></details>`;
    eyebrow.textContent = `${selected.name} / ${STEPS[step]}`;
    title.textContent = current.title;
    artifact.innerHTML = `
      <article class="ss-paper ${current.paragraphs ? "ss-paper-email" : "ss-paper-note"}" aria-label="${escape(current.label)}">
        <div class="ss-paper-header"><span>${escape(current.label)}</span><span class="ss-paper-corner" aria-hidden="true">↗</span></div>
        ${current.paragraphs
          ? `<div class="ss-email-subject"><span>Subject</span>${escape(current.subject)}</div><div class="ss-email-body">${current.paragraphs.map((paragraph) => `<p>${escape(paragraph)}</p>`).join("")}</div>`
          : `<dl class="ss-note-rows">${current.rows.map(([label, text]) => `<div class="ss-note-row"><dt>${escape(label)}</dt><dd>${escape(text)}</dd></div>`).join("")}</dl>`}
      </article>`;
    handoff.textContent = selected.handoff;
    const nextRole = PERSONAS[(PERSONAS.indexOf(selected) + 1) % PERSONAS.length];
    const nextRoleButton = root.querySelector('.ss-role-next');
    nextRoleButton.hidden = step !== 2;
    nextRoleButton.dataset.ssHandoff = nextRole.id;
    nextRoleButton.textContent = `Explore ${nextRole.name}’s role →`;
    back.disabled = step === 0;
    next.innerHTML = step === 2 ? 'Replay <span aria-hidden="true">↺</span>' : `${step === 0 ? "View draft" : "Human review"} <span aria-hidden="true">→</span>`;
    next.setAttribute("aria-label", step === 2 ? `Replay ${selected.name}’s sample assignment` : `Show ${selected.name}’s ${STEPS[step + 1].toLowerCase()}`);
    if (announce) announcer.textContent = `${selected.name}, ${selected.role}. ${STEPS[step]}: ${current.title} Illustrative sample only.`;

    // Keep the active person visible on small screens, including the initial
    // Theo selection and handoffs to a role outside the current roster window.
    // Move only the horizontal roster; never move the reader's page position.
    if (roster.scrollWidth > roster.clientWidth) {
      const button = people.find((person) => person.dataset.ssPersona === selected.id);
      const bounds = roster.getBoundingClientRect();
      const item = button.getBoundingClientRect();
      if (item.left < bounds.left + 12) roster.scrollLeft += item.left - bounds.left - 12;
      else if (item.right > bounds.right - 12) roster.scrollLeft += item.right - bounds.right + 12;
    }
  }

  function selectPersona(id) {
    if (destroyed) return false;
    const persona = PERSONAS.find((candidate) => candidate.id === id);
    if (!persona) return false;
    selected = persona;
    step = 1;
    render();
    return true;
  }

  function setStep(value) {
    if (destroyed) return false;
    const index = typeof value === "number" ? value : STEPS.findIndex((label) => label.toLowerCase() === String(value).toLowerCase().replaceAll("-", " "));
    if (!Number.isInteger(index) || index < 0 || index >= STEPS.length) return false;
    step = index;
    render();
    return true;
  }

  function onClick(event) {
    const button = event.target.closest?.("button");
    if (!button || !root.contains(button) || button.disabled) return;
    if (button.dataset.ssHandoff) selectPersona(button.dataset.ssHandoff);
    else if (button.dataset.ssPersona) selectPersona(button.dataset.ssPersona);
    else if (button.dataset.ssStep !== undefined) setStep(Number(button.dataset.ssStep));
    else if (button.dataset.ssAction === "back") setStep(step - 1);
    else if (button.dataset.ssAction === "next") setStep(step === 2 ? 0 : step + 1);
  }

  function onKeyDown(event) {
    const button = event.target.closest?.(".ss-person, .ss-step");
    if (!button || !root.contains(button)) return;
    const collection = button.classList.contains("ss-person") ? people : stepButtons;
    const position = collection.indexOf(button);
    let destination;
    if (event.key === "ArrowRight") destination = (position + 1) % collection.length;
    else if (event.key === "ArrowLeft") destination = (position - 1 + collection.length) % collection.length;
    else if (event.key === "Home") destination = 0;
    else if (event.key === "End") destination = collection.length - 1;
    else return;
    event.preventDefault();
    const target = collection[destination];
    target.focus({ preventScroll: true });
    if (collection === people) {
      selectPersona(target.dataset.ssPersona);
    } else setStep(destination);
  }

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeyDown);
  render(false);
  const api = {
    selectPersona,
    setStep,
    replay: () => setStep(0),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKeyDown);
      root.remove();
      mounts.delete(host);
    },
  };
  mounts.set(host, api);
  return api;
}
