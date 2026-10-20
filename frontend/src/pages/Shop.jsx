import { useSEO } from '../hooks/useSEO.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard.jsx';
import ProductPhoto from '../components/shop/ProductPhoto.jsx';
import { getCategories, getProducts, imageUrl } from '../services/api.js';
import '../styles/shop-v2.css';
import DepthBackdrop from '../components/layout/DepthBackdrop.jsx';

export default function Shop() {
  useSEO({"title":"Nutrition & Wellness Shop","description":"Browse available DietAndWell nutrition and wellness products.","noIndex":false});
  const [searchParams] = useSearchParams();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory]     = useState(searchParams.get('category') || 'all');
  const [type, setType]             = useState('all'); // all | digital | physical
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    getCategories().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        limit: 48,
        ...(category !== 'all' ? { category } : {}),
        ...(type !== 'all' ? { type } : {}),
      });
      setProducts(data.products || (Array.isArray(data) ? data : []));
    } catch {
      setError('Could not load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, type]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const sortedCats = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="shp-page">
      {/* ── Hero: layered gradient + shop-hero.jpg (gradient keeps layout intact if the file is missing) ── */}
      <section
        className="shp-hero depth-header"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(10,102,64,0.92) 0%, rgba(6,64,40,0.82) 55%, rgba(180,83,9,0.72) 100%), url('/images/shop-hero.jpg')",
        }}
      >
        <DepthBackdrop image="/images/shop-hero.jpg" />
        <div className="shp-hero-inner">
          <p className="shp-hero-kicker">DietAndWell Store</p>
          <h1 className="shp-hero-title">Shop</h1>
          <p className="shp-hero-sub">
            Digital guides and carefully selected physical products to support your nutrition goals.
          </p>
        </div>
      </section>

      {/* ── Category banner cards ── */}
      {sortedCats.length > 0 && (
        <section className="shp-section">
          <div className="shp-container">
            <h2 className="shp-h2">Browse by category</h2>
            <div className="shp-cat-banners">
              {sortedCats.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  className={`shp-cat-banner ${category === c.slug ? 'active' : ''}`}
                  style={{
                    backgroundImage:
                      `linear-gradient(135deg, rgba(10,102,64,0.78), rgba(180,83,9,0.62))${c.image ? `, url('${imageUrl(c.image)}')` : ''}`,
                  }}
                >
                  {(!c.image || c.image.startsWith('/images/')) && <ProductPhoto product={c} category />}
                  <span className="shp-cat-banner-name">{c.name}</span>
                  {c.description && <span className="shp-cat-banner-desc">{c.description}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Filters + grid ── */}
      <section className="shp-section">
        <div className="shp-container">
          <div className="shp-filters">
            <div className="shp-tabs" role="tablist" aria-label="Category filter">
              <button
                type="button"
                className={`shp-tab ${category === 'all' ? 'active' : ''}`}
                onClick={() => setCategory('all')}
              >
                All Products
              </button>
              {sortedCats.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`shp-tab ${category === c.slug ? 'active' : ''}`}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="shp-tabs shp-type-tabs" aria-label="Product type filter">
              {[
                { v: 'all', l: 'All types' },
                { v: 'digital', l: 'Digital' },
                { v: 'physical', l: 'Physical' },
              ].map(t => (
                <button
                  key={t.v}
                  type="button"
                  className={`shp-tab shp-tab-sm ${type === t.v ? 'active' : ''}`}
                  onClick={() => setType(t.v)}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="shp-alert shp-alert-error">{error}</div>}

          {loading ? (
            <div className="shp-loading" aria-live="polite">
              <div className="shp-spinner" />
              <p>Loading products…</p>
            </div>
          ) : products.length === 0 && !error ? (
            <div className="shp-empty">
              <h3>No products found</h3>
              <p>Try a different category, or check back soon — new products are added regularly.</p>
            </div>
          ) : (
            <div className="shp-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Trust row ── */}
      <section className="shp-section shp-section-light">
        <div className="shp-container">
          <div className="shp-trust">
            {[
              { t: 'Quality Assured', d: 'Vetted products and professionally written guides' },
              { t: 'Instant Delivery', d: 'Digital products download right after approval' },
              { t: 'Secure Request', d: 'Your details are only used to process your order' },
              { t: 'Expert Support', d: 'Talk to a real nutrition professional' },
            ].map(b => (
              <div key={b.t} className="shp-trust-card">
                <h4 className="shp-trust-title">{b.t}</h4>
                <p className="shp-trust-desc">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
