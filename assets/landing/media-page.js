// Each scene remains an isolated explanation. These modules never call a product API.
const demonstrations = [
  ['#social-demo', './social-work.js', 'mountSocialDemo'],
  ['#commerce-demo', './commerce-work.js', 'mountCommerceDemo'],
  ['#memory-demo', './memory-work.js', 'mountMemoryDemo'],
  ['#judgment-demo', './foundation-work.js', 'mountJudgmentDemo'],
  ['#delivery-demo', './foundation-work.js', 'mountDeliveryDemo'],
];
await Promise.all(demonstrations.map(async ([selector, source, method]) => {
  const host = document.querySelector(selector);
  const fallback = [...host.childNodes];
  try {
    const demonstration = await import(source);
    host.replaceChildren();
    demonstration[method](host);
    host.dataset.mounted = 'true';
  } catch (error) {
    host.replaceChildren(...fallback);
    host.dataset.mounted = 'error';
    console.error(`Could not mount ${selector}`, error);
  }
}));
