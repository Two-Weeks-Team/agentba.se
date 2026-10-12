import { translateText } from './locale-core.mjs';

export const t = text => translateText(text, document.documentElement.lang);

/** Apply at render boundaries, including measurement clones. No observer or
 * delayed translation: visible copy is Korean before the next browser paint.
 */
export function localize(root) {
  if (document.documentElement.lang !== 'ko' || !root) return root;
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest('script, style, [translate="no"]')) continue;
    const next = t(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }
  for (const el of [root, ...root.querySelectorAll('*')]) {
    for (const name of ['aria-label', 'title', 'alt', 'placeholder']) {
      if (el.hasAttribute?.(name)) el.setAttribute(name, t(el.getAttribute(name)));
    }
  }
  return root;
}
