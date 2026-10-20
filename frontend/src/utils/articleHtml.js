import { imageUrl } from '../services/api.js';

// An allowlist at the rendering boundary also protects legacy stored articles.
export function articleHtml(html = '') {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tags = new Set('P BR H1 H2 H3 H4 STRONG B EM I U S BLOCKQUOTE UL OL LI A IMG FIGURE FIGCAPTION HR PRE CODE DIV SPAN'.split(' '));
  const attrs = new Set(['href', 'src', 'alt', 'title', 'data-source', 'data-article-image', 'data-caption', 'data-layout', 'data-ratio', 'start']);
  for (const el of [...doc.body.querySelectorAll('*')]) {
    if (!tags.has(el.tagName)) { el.remove(); continue; }
    for (const attr of [...el.attributes]) if (!attrs.has(attr.name)) el.removeAttribute(attr.name);
    if (el.tagName === 'A') {
      if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(el.getAttribute('href') || '')) el.removeAttribute('href');
      el.setAttribute('rel', 'noopener noreferrer');
    }
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('data-source') || el.getAttribute('src') || '';
      if (!/^(https?:\/\/|\/uploads\/)/i.test(src)) { el.remove(); continue; }
      el.setAttribute('src', imageUrl(src));
      el.setAttribute('loading', 'lazy');
      el.setAttribute('decoding', 'async');
    }
  }
  return doc.body.innerHTML;
}
