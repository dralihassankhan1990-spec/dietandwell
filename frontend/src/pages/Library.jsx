import { useSEO } from '../hooks/useSEO.js';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SafeImg from '../components/shop/SafeImg.jsx';
import { getMyDigitalOrders, downloadDigitalOrder } from '../services/api.js';
import '../styles/library.css';

const STATUS_META = {
  granted:  { label: 'Available',              tone: 'granted'  },
  pending:  { label: 'Awaiting admin approval', tone: 'pending' },
  rejected: { label: 'Request declined',        tone: 'rejected' },
};

export default function Library() {
  useSEO({"title":"My Library","description":"Access your DietAndWell purchases.","noIndex":true});
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [dlError, setDlError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getMyDigitalOrders();
      setOrders(Array.isArray(d) ? d : d.orders || []);
    } catch {
      setError('Could not load your library. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Download via fetch so the JWT Authorization header is sent —
      a plain <a href> would NOT include it. */
  const handleDownload = async (order) => {
    setDlError(null);
    setDownloading(order.id);
    try {
      const { blob, filename } = await downloadDigitalOrder(order.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setDlError(e.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="lib-page">
      <div className="shp-container">
        <header className="lib-header">
          <h1 className="lib-title">My Library</h1>
          <p className="lib-sub">Your requested digital guides — download any that have been granted.</p>
        </header>

        {error && <div className="shp-alert shp-alert-error">{error}</div>}
        {dlError && <div className="shp-alert shp-alert-error">Download failed: {dlError}</div>}

        {loading ? (
          <div className="shp-loading" aria-live="polite">
            <div className="shp-spinner" /><p>Loading your library…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="shp-empty">
            <h3>Your library is empty</h3>
            <p>Request a digital guide from the shop and it will appear here once approved.</p>
            <Link to="/shop" className="lib-shop-btn">Browse the Shop</Link>
          </div>
        ) : (
          <div className="lib-grid">
            {orders.map(o => {
              const meta = STATUS_META[o.status] || { label: o.status, tone: o.status };
              const product = o.product || {};
              return (
                <div key={o.id} className="lib-card">
                  <Link to={product.slug ? `/shop/${product.slug}` : '/shop'} className="lib-card-link">
                    <div className="lib-card-media">
                      {product.images?.[0] ? (
                        <SafeImg src={product.images[0]} alt={product.name || 'Product'} fallbackLabel={product.name || 'D'} />
                      ) : (
                        <SafeImg src={null} alt="" fallbackLabel={product.name || 'D'} />
                      )}
                    </div>
                  </Link>
                  <div className="lib-card-body">
                    <h3 className="lib-card-name">{product.name || 'Digital guide'}</h3>
                    <p className="lib-card-date">
                      Requested {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                    <span className={`lib-status lib-status-${meta.tone}`}>{meta.label}</span>
                    {meta.tone === 'granted' && (
                      <button
                        type="button"
                        className="lib-download-btn"
                        onClick={() => handleDownload(o)}
                        disabled={downloading === o.id}
                      >
                        {downloading === o.id ? 'Downloading…' : 'Download'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
