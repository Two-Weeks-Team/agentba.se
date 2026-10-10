/**
 * Independent, local-only foundation demonstrations. No automatic mounting,
 * model calls, telemetry, persistence, or deployments.
 *
 * Glasshat a7f3302: hats.py:24-31; adk_agents.py:117-151;
 * engine.py:354-438; audit.py:313-352. The trace below explains architecture;
 * it is not a captured evaluation, a score, or a production status.
 * PreviewForge 84c4415: generate-gallery.sh:195-283;
 * dispatch-spec-cycle.sh:29-69. LunchPull's original gallery is the visual
 * reference. These three new sample concepts are not historical outputs.
 */

import { createAutoAdvance } from './auto-advance.js';

const mounted = new WeakMap();
let serial = 0;

function element(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svg(doc, viewBox, paths, className) {
  const node = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', viewBox);
  node.setAttribute('class', className);
  node.setAttribute('aria-hidden', 'true');
  node.setAttribute('focusable', 'false');
  for (const d of paths) {
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    node.append(path);
  }
  return node;
}

function prepare(host, className, label) {
  if (!host?.ownerDocument || typeof host.replaceChildren !== 'function') {
    throw new TypeError('A demo host must be a DOM element.');
  }
  mounted.get(host)?.destroy();
  const doc = host.ownerDocument;
  const root = element(doc, 'section', className);
  root.setAttribute('aria-label', label);
  const cleanups = [];
  let alive = true;
  const listen = (node, type, fn) => {
    node.addEventListener(type, fn);
    cleanups.push(() => node.removeEventListener(type, fn));
  };
  const emit = (state) => {
    const EventClass = doc.defaultView?.CustomEvent;
    if (EventClass) {
      host.dispatchEvent(new EventClass('foundation:change', {
        bubbles: true,
        detail: state,
      }));
    }
  };
  const destroy = () => {
    if (!alive) return;
    alive = false;
    cleanups.forEach((cleanup) => cleanup());
    if (root.parentNode === host) root.remove();
    mounted.delete(host);
  };
  return { doc, root, listen, emit, destroy, cleanups, isAlive: () => alive };
}

const PERSPECTIVES = [
  { id: 'facts', name: 'Facts', lens: 'Concrete evidence', note: 'Cite facts and supporting material.' },
  { id: 'intuition', name: 'Intuition', lens: 'An intuitive read', note: 'Consider the emotional and intuitive response.' },
  { id: 'upside', name: 'Upside', lens: 'Potential value', note: 'Look for value and the optimistic upside.' },
  { id: 'risks', name: 'Risks', lens: 'A critical review', note: 'Inspect weaknesses, risks and missing rigor.' },
  { id: 'alternatives', name: 'Ideas', lens: 'Other possibilities', note: 'Propose alternatives and creative angles.' },
  { id: 'synthesis', name: 'Synthesis', lens: 'A balanced view', note: 'Bring the perspectives into a balanced judgment.' },
];

const REVIEW_STEPS = ['evidence', 'perspectives', 'audit', 'report'];
const REVIEW_TRACES = {
  evidence: {
    path: 'ingest → plan', title: 'Start with something to inspect.',
    rows: [['Input', 'Submission + evaluation rubric'], ['Output', 'Evidence references + review criteria']],
  },
  audit: {
    path: 'assessments → audit', title: 'Check the judgment itself.',
    rows: [['Check', 'Evidence thresholds + calibration'], ['Output', 'Bounded corrections when supported']],
  },
  report: {
    path: 'audit → report', title: 'Keep the reasons with the result.',
    rows: [['Input', 'Audited assessments'], ['Output', 'Report + inspectable decision trace']],
  },
};

/**
 * Mount Glasshat's architectural walkthrough.
 * Returns { root, getState(), setStep(id, perspective?), follow(), destroy() }.
 * setStep accepts evidence | perspectives | audit | report. User interaction
 * and programmatic transitions emit foundation:change on the supplied host.
 */
export function mountJudgmentDemo(host) {
  const ctx = prepare(host, 'judgment-demo', 'Glasshat interactive architecture');
  const { doc, root, listen, emit } = ctx;
  const traceId = `gh-trace-${++serial}`;
  let step = 'evidence';
  let perspective = 'facts';

  const shell = element(doc, 'div', 'gh-shell');
  const label = element(doc, 'p', 'gh-label', 'Interactive architecture · evaluation prototype');
  const diagram = element(doc, 'div', 'gh-diagram');
  diagram.setAttribute('role', 'group');
  diagram.setAttribute('aria-label', 'Select a review stage or specialist perspective');
  diagram.append(element(doc, 'span', 'gh-wire'));

  const icons = {
    evidence: ['M7 8H23V28H7Z M11 4H27V24 M11 14H19 M11 19H19 M11 24H16'],
    audit: ['M16 3L28 9V19L16 29L4 19V9Z M10 16L14 20L22 12'],
    report: ['M6 4H21L27 10V28H6Z M21 4V11H27 M11 16H22 M11 21H22'],
  };
  const phaseButtons = new Map();
  function phaseButton(id, name, detail) {
    const button = element(doc, 'button', `gh-node gh-phase gh-${id}`);
    button.type = 'button';
    button.setAttribute('aria-controls', traceId);
    button.setAttribute('aria-label', `Inspect ${name.toLowerCase()} stage`);
    button.append(svg(doc, '0 0 32 32', icons[id], 'gh-icon'));
    button.append(element(doc, 'span', 'gh-node-name', name));
    button.append(element(doc, 'span', 'gh-node-detail', detail));
    listen(button, 'click', () => setStep(id));
    phaseButtons.set(id, button);
    return button;
  }

  const evidence = phaseButton('evidence', 'Evidence', 'Material + rubric');
  const group = element(doc, 'div', 'gh-specialists');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Parallel specialist perspectives');
  const perspectiveButtons = new Map();
  for (const item of PERSPECTIVES) {
    const button = element(doc, 'button', 'gh-node gh-perspective', item.name);
    button.type = 'button';
    button.setAttribute('aria-label', `Inspect ${item.name.toLowerCase()} perspective`);
    button.setAttribute('aria-controls', traceId);
    listen(button, 'click', () => setStep('perspectives', item.id));
    group.append(button);
    perspectiveButtons.set(item.id, button);
  }
  diagram.append(evidence, group, phaseButton('audit', 'Audit', 'Review + correct'), phaseButton('report', 'Report', 'Result + reasons'));

  const trace = element(doc, 'div', 'gh-trace');
  trace.id = traceId;
  trace.setAttribute('role', 'region');
  trace.setAttribute('aria-label', 'Illustrated architecture trace');
  trace.setAttribute('aria-live', 'polite');
  trace.setAttribute('aria-atomic', 'true');
  trace.tabIndex = 0;
  const traceHead = element(doc, 'div', 'gh-trace-head');
  const tracePath = element(doc, 'code', 'gh-trace-path');
  traceHead.append(element(doc, 'span', 'gh-trace-label', 'Illustrated trace'), tracePath);
  const traceTitle = element(doc, 'p', 'gh-trace-title');
  const traceRows = element(doc, 'dl', 'gh-trace-rows');
  trace.append(traceHead, traceTitle, traceRows);

  const footer = element(doc, 'div', 'gh-controls');
  const hint = element(doc, 'span', 'gh-hint', 'Select any node to inspect it.');
  const follow = element(doc, 'button', 'gh-follow', 'Follow the review');
  follow.type = 'button';
  follow.setAttribute('aria-controls', traceId);
  listen(follow, 'click', () => advance());
  footer.append(hint, follow);
  shell.append(label, diagram, trace, footer);
  root.append(shell);

  function getState() {
    return { kind: 'judgment', step, perspective: step === 'perspectives' ? perspective : null, illustrative: true };
  }
  function render(announce = true) {
    trace.setAttribute('aria-live', announce ? 'polite' : 'off');
    root.dataset.step = step;
    group.dataset.active = String(step === 'perspectives');
    for (const [id, button] of phaseButtons) button.setAttribute('aria-pressed', String(step === id));
    for (const [id, button] of perspectiveButtons) {
      button.setAttribute('aria-pressed', String(step === 'perspectives' && perspective === id));
    }
    const item = PERSPECTIVES.find((entry) => entry.id === perspective);
    const view = step === 'perspectives' ? {
      path: `parallel review / ${item.name.toLowerCase()}`,
      title: item.lens,
      rows: [['Review', item.note], ['Output', 'Assessment + supporting rationale']],
    } : REVIEW_TRACES[step];
    tracePath.textContent = view.path;
    traceTitle.textContent = view.title;
    traceRows.replaceChildren();
    for (const [key, value] of view.rows) {
      traceRows.append(element(doc, 'dt', 'gh-trace-key', key), element(doc, 'dd', 'gh-trace-value', value));
    }
    follow.textContent = step === 'report' ? 'Review again ↺' : 'Follow the review →';
  }
  function setStep(next, nextPerspective = perspective) {
    if (!ctx.isAlive()) return getState();
    if (!REVIEW_STEPS.includes(next)) throw new RangeError(`Unknown review stage: ${next}`);
    if (!PERSPECTIVES.some((item) => item.id === nextPerspective)) throw new RangeError(`Unknown perspective: ${nextPerspective}`);
    step = next;
    perspective = nextPerspective;
    render();
    emit(getState());
    return getState();
  }
  function advance() {
    return setStep(REVIEW_STEPS[(REVIEW_STEPS.indexOf(step) + 1) % REVIEW_STEPS.length]);
  }

  render();
  host.replaceChildren(root);
  const tour = createAutoAdvance({
    host, label: 'Glasshat',
    advance() {
      const index = PERSPECTIVES.findIndex(item => item.id === perspective);
      if (step === 'evidence') { step = 'perspectives'; perspective = PERSPECTIVES[0].id; }
      else if (step === 'perspectives' && index < PERSPECTIVES.length - 1) perspective = PERSPECTIVES[index + 1].id;
      else step = REVIEW_STEPS[(REVIEW_STEPS.indexOf(step) + 1) % REVIEW_STEPS.length];
      render(false);
      emit(getState());
    },
  });
  ctx.cleanups.push(() => tour.destroy());
  const controller = { root, getState, setStep, follow: advance, destroy: ctx.destroy };
  mounted.set(host, controller);
  return controller;
}

const DIRECTIONS = [
  { id: 'editorial', name: 'Editorial', brief: 'Define the mood question, recommendation card and reading order.' },
  { id: 'terminal', name: 'Terminal', brief: 'Define the prompt, input states and recommendation response.' },
  { id: 'playful', name: 'Playful', brief: 'Define the mood selector, reveal state and motion fallback.' },
];

function lunchConcept(doc, direction) {
  const scene = element(doc, 'div', `pf-concept pf-concept-${direction}`);
  scene.setAttribute('aria-label', `${direction} LunchPull sample interface`);
  const masthead = element(doc, 'div', 'pf-concept-masthead');
  masthead.append(element(doc, 'span', 'pf-wordmark', 'LunchPull'), element(doc, 'span', 'pf-sample', 'Sample interface'));
  scene.append(masthead);
  const body = element(doc, 'div', 'pf-concept-body');
  if (direction === 'editorial') {
    const words = element(doc, 'div', 'pf-editorial-words');
    words.append(element(doc, 'span', 'pf-concept-kicker', 'A little less deciding.'), element(doc, 'p', 'pf-editorial-title', 'Make room\nfor lunch.'), element(doc, 'span', 'pf-concept-note', 'Something warm. Something simple.'));
    const plate = element(doc, 'div', 'pf-editorial-plate');
    plate.append(svg(doc, '0 0 180 150', ['M24 69H156C150 110 124 131 90 131S30 110 24 69Z M20 69C20 58 160 58 160 69 M49 140H131 M64 49C46 28 79 31 65 9 M91 46C75 22 108 24 96 4 M116 49C103 32 132 24 121 12'], 'pf-bowl'));
    plate.append(element(doc, 'span', 'pf-plate-label', 'The warm bowl'));
    body.append(words, plate);
  } else if (direction === 'terminal') {
    const commands = element(doc, 'div', 'pf-terminal-commands');
    commands.append(element(doc, 'p', 'pf-command', '> mood: low effort'), element(doc, 'p', 'pf-command', '> preference: something warm'), element(doc, 'p', 'pf-terminal-title', 'Lunch,\nsorted.'));
    const output = element(doc, 'div', 'pf-terminal-output');
    output.append(element(doc, 'span', 'pf-concept-kicker', 'Recommendation'), element(doc, 'p', 'pf-terminal-result', 'Noodle\nbowl.'), element(doc, 'span', 'pf-concept-note', 'One idea to take away.'));
    body.append(commands, output);
  } else {
    const words = element(doc, 'div', 'pf-playful-words');
    words.append(element(doc, 'span', 'pf-concept-kicker', 'Let your mood choose.'), element(doc, 'p', 'pf-playful-title', 'A good\nlunch hunch.'), element(doc, 'span', 'pf-mood', 'Today feels cozy'));
    const oracle = element(doc, 'div', 'pf-oracle');
    oracle.append(svg(doc, '0 0 180 180', ['M90 5L107 27L134 17L137 47L167 49L156 77L178 94L153 111L160 140L130 140L117 168L94 150L69 172L56 145L26 148L31 118L7 101L28 81L16 54L47 51L47 21L73 31Z'], 'pf-star'));
    const oracleWords = element(doc, 'div', 'pf-oracle-words');
    oracleWords.append(element(doc, 'span', 'pf-oracle-kicker', 'Your lunch hunch'), element(doc, 'strong', 'pf-oracle-pick', 'Warm\n& bowlful'), element(doc, 'span', 'pf-oracle-sign', '✳'));
    oracle.append(oracleWords);
    body.append(words, oracle);
  }
  scene.append(body);
  return scene;
}

/**
 * Mount three clearly labelled, newly made LunchPull sample directions.
 * Returns { root, getState(), selectDirection(id), destroy() }.
 * getState includes the exact downloadable choice record and specification
 * handoff text. Selecting a direction does not approve/build/deploy anything.
 */
export function mountDeliveryDemo(host) {
  const ctx = prepare(host, 'delivery-demo', 'PreviewForge interactive design selection');
  const { doc, root, listen, emit } = ctx;
  const id = ++serial;
  let direction = 'editorial';
  const shell = element(doc, 'div', 'pf-shell');
  const header = element(doc, 'p', 'pf-label', 'Interactive design study · LunchPull sample concepts');
  const tabs = element(doc, 'div', 'pf-directions');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Choose a LunchPull visual direction');
  const preview = element(doc, 'div', 'pf-preview');
  preview.id = `pf-preview-${id}`;
  preview.setAttribute('role', 'tabpanel');
  preview.tabIndex = 0;
  const buttons = new Map();
  for (const item of DIRECTIONS) {
    const button = element(doc, 'button', 'pf-direction', item.name);
    button.type = 'button';
    button.id = `pf-${item.id}-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', preview.id);
    listen(button, 'click', () => selectDirection(item.id));
    listen(button, 'keydown', (event) => {
      const index = DIRECTIONS.findIndex((entry) => entry.id === item.id);
      const next = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const nextId = DIRECTIONS[next].id;
      selectDirection(nextId);
      buttons.get(nextId).focus();
    });
    tabs.append(button);
    buttons.set(item.id, button);
  }

  const handoff = element(doc, 'div', 'pf-handoff');
  const record = element(doc, 'div', 'pf-record');
  const file = element(doc, 'code', 'pf-filename', 'chosen_preview.json');
  const recordBody = element(doc, 'pre', 'pf-record-body');
  recordBody.setAttribute('aria-label', 'Illustrative choice record');
  record.append(file, recordBody);
  const spec = element(doc, 'div', 'pf-spec');
  const specText = element(doc, 'p', 'pf-spec-text');
  spec.append(element(doc, 'span', 'pf-spec-label', 'Next → specification'), specText);
  handoff.append(record, spec);

  const footer = element(doc, 'div', 'pf-controls');
  const status = element(doc, 'span', 'pf-status', 'Sample choice record');
  const download = element(doc, 'button', 'pf-download', 'Download choice ↓');
  download.type = 'button';
  download.setAttribute('aria-label', 'Download the sample chosen_preview.json file');
  const announcement = element(doc, 'span', 'pf-announcement');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  const downloads = new Map();
  ctx.cleanups.push(() => {
    for (const [url, timer] of downloads) {
      doc.defaultView.clearTimeout(timer);
      doc.defaultView.URL.revokeObjectURL(url);
    }
    downloads.clear();
  });
  listen(download, 'click', () => {
    const view = doc.defaultView;
    if (!view?.URL?.createObjectURL || !view.Blob) {
      announcement.textContent = 'This browser cannot download the file. The complete sample record is displayed above.';
      return;
    }
    const blob = new view.Blob([JSON.stringify(getState().choiceRecord, null, 2) + '\n'], { type: 'application/json' });
    const url = view.URL.createObjectURL(blob);
    const anchor = element(doc, 'a', 'pf-download-anchor');
    anchor.href = url;
    anchor.download = 'chosen_preview.json';
    root.append(anchor);
    anchor.click();
    anchor.remove();
    const timer = view.setTimeout(() => {
      view.URL.revokeObjectURL(url);
      downloads.delete(url);
    }, 1000);
    downloads.set(url, timer);
    announcement.textContent = 'Sample choice record prepared for download.';
  });
  footer.append(status, download, announcement);
  shell.append(header, tabs, preview, handoff, footer);
  root.append(shell);

  function getState() {
    return {
      kind: 'delivery', direction, sample: true,
      choiceFilename: 'chosen_preview.json',
      choiceRecord: { concept: direction, sample: true },
      nextStep: { name: 'Specification', brief: DIRECTIONS.find((item) => item.id === direction).brief },
    };
  }
  function render(announce = false) {
    const item = DIRECTIONS.find((entry) => entry.id === direction);
    root.dataset.direction = direction;
    for (const [key, button] of buttons) {
      button.setAttribute('aria-selected', String(key === direction));
      button.tabIndex = key === direction ? 0 : -1;
    }
    preview.setAttribute('aria-labelledby', buttons.get(direction).id);
    preview.replaceChildren(lunchConcept(doc, direction));
    recordBody.textContent = JSON.stringify(getState().choiceRecord, null, 2);
    specText.textContent = item.brief;
    if (announce) announcement.textContent = `${item.name} selected. The sample choice record and specification handoff are updated.`;
  }
  function selectDirection(next) {
    if (!ctx.isAlive()) return getState();
    if (!DIRECTIONS.some((item) => item.id === next)) throw new RangeError(`Unknown design direction: ${next}`);
    direction = next;
    render(true);
    emit(getState());
    return getState();
  }

  render();
  host.replaceChildren(root);
  const tour = createAutoAdvance({
    host, label: 'PreviewForge',
    advance() {
      const index = DIRECTIONS.findIndex(item => item.id === direction);
      direction = DIRECTIONS[(index + 1) % DIRECTIONS.length].id;
      render(false);
      emit(getState());
    },
  });
  ctx.cleanups.push(() => tour.destroy());
  const controller = { root, getState, selectDirection, destroy: ctx.destroy };
  mounted.set(host, controller);
  return controller;
}
