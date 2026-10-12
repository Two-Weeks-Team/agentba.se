import assert from 'node:assert/strict';

// These specific literal translations were rejected in the Korean copy review.
// This catches regressions, not readability: read the full Korean narrative and
// every demo state without English alongside it before calling the copy ready.
export const rejectedKoreanCopy = [
  '플릿', '브리프', '과업', 'AI 페르소나', '제품 사실', '수신자 맥락',
  '새 약속', '새로운 약속', '원본 맥락', '명세 인계', '점심 예감',
  '다음 세대의 노동력', '완료로 인정할 결과물', '소프트웨어로 이루어진 조직',
];
export const literalCopyIssues = text => rejectedKoreanCopy.filter(phrase => text.includes(phrase));

/** Check coverage and known copy regressions in every state, not just initial tabs. */
export async function checkKoreanCopy(page, id) {
  const untranslated = await page.evaluate(({id, rejected}) => {
    const root = id ? document.getElementById(id) : document.body;
    const allow = new Set(['AgentBase', 'AgentBase LLC', 'Social Seeding', 'Social Seeding ↗',
      'Memex', 'Memex ↗', 'kbeauty.market', 'kbeauty.market ↗', 'Glasshat', 'PreviewForge',
      'LunchPull', 'Run', 'Build', 'Prove', 'Run · Build · Prove', 'Google Gemini', 'OpenAI',
      'Sangguen Chang', 'Sejun Kim', 'Remi', 'June', 'Theo', 'Mina', 'Diego', 'Aria', 'Noor',
      'contact@agentba.se', 'llms.txt', 'Markdown', 'English', 'chosen_preview.json']);
    const missing = [];
    const check = (text, context) => {
      const value = text.replace(/\s+/g, ' ').trim();
      if (rejected.some(phrase => value.includes(phrase))) missing.push({value,context,issue:'rejected literal Korean'});
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
  }, {id: id || null, rejected: rejectedKoreanCopy});
  assert.deepEqual(untranslated, [], `${id || 'page'} has untranslated Korean UI: ${JSON.stringify(untranslated)}`);
}
