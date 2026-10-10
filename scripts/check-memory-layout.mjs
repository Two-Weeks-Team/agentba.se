// Run with an ego-browser Page on the landing page. No browser is launched here.
import assert from 'node:assert/strict';

const titles = [
  'The build is stuck. Again.',
  'A similar run has a way forward.',
  'The action. The record. The result.',
];

async function snapshot(page) {
  return page.evaluate(() => {
    const host = document.querySelector('#memory-demo');
    const panels = [...host.querySelectorAll('.mm-frame')];
    const visible = panels.filter(panel => getComputedStyle(panel).visibility === 'visible' && panel.getBoundingClientRect().height > 0);
    return {
      step: Number(host.dataset.step),
      frames: panels.length,
      visible: visible.map(panel => panel.querySelector('h4').textContent),
      accessible: panels.filter(panel => panel.getAttribute('aria-hidden') === 'false').length,
      height: host.getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

function validate(result, step) {
  assert.equal(result.frames, titles.length, 'Missing walkthrough frame');
  assert.equal(result.step, step);
  assert.deepEqual(result.visible, [titles[step]], 'Exactly the selected step must be visible');
  assert.equal(result.accessible, 1, 'Only the selected step belongs in the accessibility tree');
  assert.equal(result.overflow, false, 'The walkthrough must fit the viewport');
}

export async function checkMemoryLayout(page, { staleStyles = false, legacyModule = false, testFailure = false } = {}) {
  await page.waitForSelector('#memory-demo .mm-frame[aria-hidden="false"]');
  if (staleStyles) {
    await page.evaluate(() => {
      const sheet = [...document.styleSheets].find(item => item.href?.split('?')[0].endsWith('/memory-work.css'));
      if (!sheet) throw new Error('Memory stylesheet is missing');
      // Model the previous CSS, which had no frame stacking or hiding rules.
      for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
        const rule = sheet.cssRules[i];
        if (rule.selectorText?.includes('.mm-frame')) sheet.deleteRule(i);
        else if (rule.selectorText === '.mm-terminal-body') rule.style.removeProperty('display');
      }
    });
  }
  const results = [];
  for (let step = 0; step < titles.length; step++) {
    await page.click(`[data-memory-step="${step}"]`);
    if (legacyModule) {
      await page.evaluate(() => {
        document.querySelector('.mm-terminal-body').style.removeProperty('display');
        document.querySelectorAll('.mm-frame').forEach(panel => panel.removeAttribute('style'));
      });
    }
    const result = await snapshot(page);
    validate(result, step);
    results.push(result);
  }
  const heights = results.map(result => result.height);
  assert.ok(Math.max(...heights) - Math.min(...heights) < 2, 'Switching steps must not move the controls');

  if (testFailure) {
    await page.evaluate(() => {
      document.querySelector('.mm-terminal-body').style.display = 'block';
      document.querySelectorAll('.mm-frame').forEach(panel => { panel.style.visibility = 'visible'; });
    });
    const broken = await snapshot(page);
    assert.throws(() => validate(broken, 2), /Exactly the selected step must be visible/);
    // Restore the real implementation and original styles after the failure case.
    await page.reload();
  }
  return { staleStyles, legacyModule, rejectedStackedFrames: testFailure, results };
}
