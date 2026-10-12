import base from './locales/ko-base.mjs';
import social from './locales/ko-social.mjs';
import products from './locales/ko-products.mjs';
import foundation from './locales/ko-foundation.mjs';

export const korean = {};
for (const dictionary of [base, social, products, foundation]) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (korean[key] !== undefined && korean[key] !== value) throw new Error(`Conflicting Korean translation: ${key}`);
    korean[key] = value;
  }
}
export const normalizeText = text => text.replace(/\s+/g, ' ').trim();

/** Exact copy lookup: never replace identifiers, URLs or fragments of code. */
export function translateText(text, locale = 'en') {
  if (locale !== 'ko') return text;
  const translated = korean[normalizeText(text)];
  if (translated === undefined) return text;
  const leading = text.match(/^\s*/)[0];
  const trailing = text.match(/\s*$/)[0];
  return leading + translated + trailing;
}

const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The committed landing fragment contains no scripts/styles or user HTML.
 * Translate only text and human-readable attributes; the DOM stays identical.
 */
export function translateHtml(html, locale = 'en') {
  if (locale !== 'ko') return html;
  // A line break is a layout choice, not a sentence boundary. Allow a whole
  // two-line heading to be rewritten without reusing its first line as nav copy.
  html = html.replace(/>([^<>]+)(<br\s*\/?>)([^<>]+)</g, (source, first, br, second) => {
    const translated = korean[normalizeText(`${decode(first)} ${decode(second)}`)];
    if (!translated) return source;
    const lines = translated.split('\n');
    return lines.length === 2 ? `>${escape(lines[0])}${br}${escape(lines[1])}<` : source;
  });
  const translate = value => {
    const decoded = decode(value);
    const translated = translateText(decoded, locale);
    return translated === decoded ? value : escape(translated);
  };
  return html.replace(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g, token => {
    if (token.startsWith('<!--')) return token;
    if (token.startsWith('<')) return token.replace(/(\b(?:aria-label|title|alt|placeholder)=")([^"]*)(")/g,
      (_, open, text, close) => open + translate(text) + close);
    return translate(token);
  });
}
