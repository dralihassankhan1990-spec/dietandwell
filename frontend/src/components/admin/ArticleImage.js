import Image from '@tiptap/extension-image';
import { imageUrl } from '../../services/api.js';

export default Image.extend({
  addAttributes() {
    return { ...this.parent?.(),
      caption: { default: '', parseHTML: el => el.getAttribute('data-caption') || '' },
      layout: { default: 'full', parseHTML: el => el.getAttribute('data-layout') || 'full' },
      ratio: { default: 'original', parseHTML: el => el.getAttribute('data-ratio') || 'original' },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-article-image]', getAttrs: el => {
      const img = el.querySelector('img');
      return img ? { src: img.getAttribute('data-source') || img.getAttribute('src'), alt: img.getAttribute('alt') || '', title: img.getAttribute('title') } : false;
    } }, { tag: 'img[src]' }];
  },
  renderHTML({ node }) {
    const { src, alt, title, caption, layout, ratio } = node.attrs;
    return ['figure', { 'data-article-image': '', 'data-caption': caption, 'data-layout': layout, 'data-ratio': ratio },
      ['img', { src: imageUrl(src), 'data-source': src, alt: alt || '', title, loading: 'lazy' }],
      ...(caption ? [['figcaption', {}, caption]] : [])];
  },
});
