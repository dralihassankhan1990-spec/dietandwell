/* Shared shop helpers — price/stock/badges + graceful image handling. */

export function formatPKR(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'PKR —';
  return 'PKR ' + Math.round(n).toLocaleString('en-PK');
}

/** Lowest purchasable price: first variant's price if variants exist, else base price. */
export function fromPrice(product) {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const prices = product.variants.map(v => Number(v.price)).filter(Number.isFinite);
    if (prices.length) return Math.min(...prices);
  }
  return Number(product.price);
}

export function stockInfo(stock) {
  if (stock === null || stock === undefined || stock === '') return null;
  const s = Number(stock);
  if (!Number.isFinite(s) || s <= 0) return { label: 'Out of stock', tone: 'out' };
  if (s <= 10)                       return { label: 'Low stock',    tone: 'low' };
  return { label: 'In stock', tone: 'in' };
}

export function slugify(text) {
  return (text || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}
