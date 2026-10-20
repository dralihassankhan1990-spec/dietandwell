import { articleHtml } from '../utils/articleHtml.js';
import { useSEO } from '../hooks/useSEO.js';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SafeImg from '../components/shop/SafeImg.jsx';
import BookCover from '../components/shop/BookCover.jsx';
import ProductPhoto from '../components/shop/ProductPhoto.jsx';
import { formatPKR, stockInfo } from '../components/shop/shopUtils.js';
import {
  getProductBySlug, getPublicSettings, submitDigitalOrder,
  addToCart, getCurrentUser, isLoggedIn,
} from '../services/api.js';
import '../styles/product-detail-v2.css';

export default function ProductDetail() {
  useSEO({"title":"Product Details","description":"Explore DietAndWell product details and availability.","noIndex":false});
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [imgIdx, setImgIdx]     = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty]           = useState(1);
  const [cartMsg, setCartMsg]   = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getProductBySlug(slug)
      .then(d => { if (alive) setProduct(d.product || d); })
      .catch(() => { if (alive) setError('Product not found or unavailable.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isLoggedIn()) { navigate('/login', { state: { from: { pathname: `/shop/${slug}` } } }); return; }
    try {
      await addToCart(product.id, qty, selectedVariant?.label);
      setCartMsg(`Added ${qty} × ${product.name} to your cart.`);
      setTimeout(() => setCartMsg(null), 3000);
    } catch (e) {
      setCartMsg(e.message);
    }
  };

  if (loading) {
    return (
      <div className="pdv-loading" aria-live="polite">
        <div className="shp-spinner" /><p>Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="shp-container">
        <div className="shp-alert shp-alert-error" style={{ margin: '3rem 0' }}>
          {error || 'Product not found.'} <Link to="/shop">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant = variants[variantIdx] || null;
  const price = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const stock = stockInfo(product.stock);
  const isDigital = product.type === 'digital';
  const catSlug = product.category?.slug;

  return (
    <div className="pdv-page">
      <div className="shp-container">
        <nav className="pdv-breadcrumb" aria-label="Breadcrumb">
          <Link to="/shop">Shop</Link>
          {catSlug && <><span>/</span><Link to={`/shop?category=${catSlug}`}>{product.category.name}</Link></>}
          <span>/</span><span>{product.name}</span>
        </nav>

        <div className="pdv-layout">
          {/* ── Gallery ── */}
          <div className="pdv-gallery">
            <div className="pdv-main-media">
              {images.length > 0 ? (
                <SafeImg src={images[imgIdx]} alt={product.name} eager className="pdv-main-img" fallbackLabel={product.name} />
              ) : (
                <ProductPhoto product={product} />
              )}
            </div>
            {images.length > 1 && (
              <div className="pdv-thumbs">
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pdv-thumb ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <SafeImg src={src} alt="" fallbackLabel={product.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="pdv-info">
            <span className={`shp-type-badge ${isDigital ? 'digital' : 'physical'}`}>
              {isDigital ? 'Digital' : 'Physical'}
            </span>
            <h1 className="pdv-title">{product.name}</h1>
            {product.category?.name && (
              <p className="pdv-category">
                Category: <Link to={`/shop?category=${catSlug}`}>{product.category.name}</Link>
              </p>
            )}

            {variants.length > 0 && (
              <div className="pdv-variants">
                <p className="pdv-label">Choose an option</p>
                <div className="pdv-variant-pills">
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pdv-variant-pill ${i === variantIdx ? 'active' : ''}`}
                      onClick={() => setVariantIdx(i)}
                    >
                      <span className="pdv-pill-label">{v.label}</span>
                      <span className="pdv-pill-price">{formatPKR(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdv-price-row">
              <span className="pdv-price">{formatPKR(price)}</span>
              {selectedVariant && <span className="pdv-price-note">— {selectedVariant.label}</span>}
            </div>

            {stock && <p className={`shp-stock shp-stock-${stock.tone} shp-stock-lg`}>{stock.label}</p>}

            {isDigital ? (
              <DigitalRequestForm product={product} />
            ) : (
              <div className="pdv-buy">
                <div className="pdv-qty">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
                </div>
                <button
                  type="button"
                  className="pdv-add-btn"
                  onClick={handleAddToCart}
                  disabled={stock?.tone === 'out'}
                >
                  {stock?.tone === 'out' ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            )}

            {cartMsg && <p className="pdv-cart-msg">{cartMsg}</p>}
            {!isDigital && <Link className="pdv-cart-link" to="/cart">View your cart →</Link>}
          </div>
        </div>

        {/* ── Description ── */}
        {product.description && (
          <div className="pdv-desc">
            <h2 className="shp-h2">About this {isDigital ? 'guide' : 'product'}</h2>
            <div className="pdv-desc-body" dangerouslySetInnerHTML={{ __html: articleHtml(product.description) }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Digital product request form ──────────────────────────── */
function DigitalRequestForm({ product }) {
  const user = getCurrentUser() || {};
  const [form, setForm]     = useState({
    name:    [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
    contact: user.phone || '',
    email:   user.email || '',
    paymentMethod: 'request',
  });
  const [settings, setSettings] = useState(null);
  const [sending, setSending]    = useState(false);
  const [msg, setMsg]            = useState(null);
  const [done, setDone]          = useState(false);

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim() || !form.contact.trim() || !form.email.trim()) {
      setMsg({ ok: false, text: 'Please fill in your name, contact and email.' });
      return;
    }
    setSending(true);
    try {
      await submitDigitalOrder({
        productId: product.id,
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        paymentMethod: form.paymentMethod, // 'request' | 'bank_transfer'
      });
      setDone(true);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="pdv-success" role="status">
        <h3>Request received</h3>
        <p>
          Thank you, {form.name.split(' ')[0] || 'friend'}. The admin will grant download
          access after verifying your request{form.paymentMethod === 'bank_transfer' ? ' / payment' : ''}.
        </p>
        <p>You can track the status in your <Link to="/library">Library</Link>.</p>
      </div>
    );
  }

  return (
    <form className="pdv-request" onSubmit={submit}>
      <h3 className="pdv-request-title">Request this guide</h3>
      <p className="pdv-request-note">
        The admin will grant download access after verifying your request/payment.
      </p>

      <label className="pdv-field">
        <span>Name</span>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" autoComplete="name" />
      </label>
      <label className="pdv-field">
        <span>Contact</span>
        <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Phone or WhatsApp" autoComplete="tel" />
      </label>
      <label className="pdv-field">
        <span>Email</span>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </label>

      <div className="pdv-field">
        <span>Payment method</span>
        <div className="pdv-radio-group" role="radiogroup" aria-label="Payment method">
          <label className={`pdv-radio ${form.paymentMethod === 'request' ? 'active' : ''}`}>
            <input
              type="radio" name="paymentMethod" value="request"
              checked={form.paymentMethod === 'request'}
              onChange={() => set('paymentMethod', 'request')}
            />
            Request access
          </label>
          <label className={`pdv-radio ${form.paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
            <input
              type="radio" name="paymentMethod" value="bank_transfer"
              checked={form.paymentMethod === 'bank_transfer'}
              onChange={() => set('paymentMethod', 'bank_transfer')}
            />
            Bank transfer
          </label>
        </div>
      </div>

      {form.paymentMethod === 'bank_transfer' && (
        <div className="pdv-bank" aria-live="polite">
          <h4>Bank transfer details</h4>
          {settings?.bank_account_details
            ? <pre className="pdv-bank-details">{settings.bank_account_details}</pre>
            : <p className="pdv-bank-details">Bank details will be shared after your request is reviewed.</p>}
          {(settings?.support_phone || settings?.support_email) && (
            <p className="pdv-support">
              Questions? {settings.support_phone && <span>Phone: {settings.support_phone} </span>}
              {settings.support_email && <span>Email: {settings.support_email}</span>}
            </p>
          )}
        </div>
      )}

      {msg && <p className="pdv-form-error">{msg.text}</p>}

      <button type="submit" className="pdv-add-btn" disabled={sending}>
        {sending ? 'Sending…' : 'Submit Request'}
      </button>
      {!isLoggedIn() && (
        <p className="pdv-login-hint">
          Have an account? <Link to="/login">Log in</Link> to track your request in your Library.
        </p>
      )}
    </form>
  );
}
