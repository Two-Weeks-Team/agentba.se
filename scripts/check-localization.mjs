import assert from 'node:assert/strict';

/** Inspect each state through checkWalkthroughStates, not only the initial tabs. */
export async function checkKoreanCopy(page, id) {
  const untranslated = await page.evaluate(id => {
    const root = id ? document.getElementById(id) : document.body;
    const allow = new Set(['AgentBase', 'AgentBase LLC', 'Social Seeding', 'Social Seeding ↗',
      'Memex', 'Memex ↗', 'kbeauty.market', 'kbeauty.market ↗', 'Glasshat', 'PreviewForge',
      'LunchPull', 'Run', 'Build', 'Prove', 'Run · Build · Prove', 'Google Gemini', 'OpenAI',
      'Sangguen Chang', 'Sejun Kim', 'Remi', 'June', 'Theo', 'Mina', 'Diego', 'Aria', 'Noor',
      'contact@agentba.se', 'llms.txt', 'Markdown', 'English', 'chosen_preview.json']);
    const missing = [];
    const check = (text, context) => {
      const value = text.replace(/\s+/g, ' ').trim();
      if (!/[A-Za-z]{3}/.test(value) || /[가-힣]/.test(value) || allow.has(value)) return;
      if (/^[a-z]+\.[a-zA-Z]+$/.test(value)) return; // Actual tool identifiers.
      missing.push({value,context});
    };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const el = walker.currentNode.parentElement;
      if (!el || el.closest('script,style,pre,code,[translate="no"],[hidden]') || !el.getClientRects().length || getComputedStyle(el).visibility !== 'visible') continue;
      check(walker.currentNode.nodeValue,el.className || el.tagName);
    }
    for (const el of [root,...root.querySelectorAll('[aria-label],[alt],[title]')]) {
      if (!el.getClientRects().length || getComputedStyle(el).visibility !== 'visible') continue;
      for (const attr of ['aria-label','alt','title']) if (el.hasAttribute(attr)) check(el.getAttribute(attr),`${el.tagName}[${attr}]`);
    }
    return missing;
  }, id || null);
  assert.deepEqual(untranslated, [], `${id || 'page'} has untranslated Korean UI: ${JSON.stringify(untranslated)}`);
}
