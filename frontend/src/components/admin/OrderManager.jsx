import React, { useState, useEffect, useCallback } from 'react';
import {
  adminGetDigitalOrders,
  adminUpdateDigitalOrder,
  adminGetPhysicalOrders,
  adminUpdatePhysicalOrder,
} from '../../services/api.js';
import './admin-shop.css';

const TABS = [
  { id: 'pending',  label: 'Pending' },
  { id: 'granted',  label: 'Granted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all',      label: 'All' },
];

/**
 * OrderManager — self-contained. Filter tabs (Pending/Granted/Rejected/All),
 * rows with product, customer (name/contact/email), payment method and date;
 * one-click Grant / Reject with confirm; refreshes after each action.
 */
export default function OrderManager() {
  const [kind, setKind] = useState('physical');
  return (
    <div>
      <div className="admin-filter-tabs" aria-label="Order type">
        <button className={`admin-filter-tab ${kind === 'physical' ? 'active' : ''}`} onClick={() => setKind('physical')}>
          Physical orders
        </button>
        <button className={`admin-filter-tab ${kind === 'digital' ? 'active' : ''}`} onClick={() => setKind('digital')}>
          Digital requests
        </button>
      </div>
      {kind === 'physical' ? <PhysicalOrdersManager /> : <DigitalOrdersManager />}
    </div>
  );
}

function DigitalOrdersManager() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('pending');
  const [msg, setMsg]         = useState(null);
  const [acting, setActing]    = useState(null);

  const load = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      const d = await adminGetDigitalOrders(f === 'all' ? 'all' : f);
      setOrders(Array.isArray(d) ? d : d.orders || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(filter); }, [load, filter]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const decide = async (order, status) => {
    const verb = status === 'granted' ? 'Grant' : 'Reject';
    if (!confirm(`${verb} download access for "${order.product?.name}" requested by ${order.name}?`)) return;
    setActing(order.id);
    try {
      await adminUpdateDigitalOrder(order.id, status);
      flash(`Order ${status === 'granted' ? 'granted' : 'rejected'}.`);
      load();
    } catch (e) { flash(e.message, false); }
    finally { setActing(null); }
  };

  const fmtDate = (ts) => ts
    ? new Date(ts).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Digital Orders</h2>
        <span className="admin-count">{orders.length} shown</span>
      </div>

      {msg && <div className={`admin-msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="admin-filter-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`admin-filter-tab ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" />Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Customer</th><th>Contact</th><th>Payment</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={7} className="admin-empty">No {filter !== 'all' ? filter : ''} orders.</td></tr>}
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.product?.name || '—'}</strong></td>
                  <td>
                    <div>{o.name}</div>
                    <div className="td-email">{o.email}</div>
                  </td>
                  <td>{o.contact || '—'}</td>
                  <td>
                    <span className="shpadmin-payment-badge">
                      {o.paymentMethod === 'bank_transfer' ? 'Bank transfer' : 'Request access'}
                    </span>
                  </td>
                  <td className="td-date">{fmtDate(o.createdAt)}</td>
                  <td><span className={`shpadmin-payment-badge`}>{o.status}</span></td>
                  <td>
                    {o.status === 'pending' ? (
                      <div className="shpadmin-action-row">
                        <button className="shpadmin-grant-btn" disabled={acting === o.id} onClick={() => decide(o, 'granted')}>
                          {acting === o.id ? '…' : 'Grant'}
                        </button>
                        <button className="shpadmin-reject-btn" disabled={acting === o.id} onClick={() => decide(o, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const PHYSICAL_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

function PhysicalOrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [acting, setActing] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async (status = filter) => {
    setLoading(true);
    try {
      const data = await adminGetPhysicalOrders(status);
      setOrders(data.orders || []);
    } catch (error) {
      setOrders([]);
      setMsg({ ok: false, text: error.message });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(filter); }, [load, filter]);

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    if (!confirm(`Change order #${String(order.id).slice(0, 8)} to ${status}?`)) return;
    setActing(order.id);
    try {
      await adminUpdatePhysicalOrder(order.id, status);
      setMsg({ ok: true, text: `Order marked ${status}.` });
      await load();
    } catch (error) {
      setMsg({ ok: false, text: error.message });
    } finally {
      setActing(null);
    }
  };

  const fmtDate = (ts) => ts
    ? new Date(ts).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Physical Orders</h2>
        <span className="admin-count">{orders.length} shown</span>
      </div>

      {msg && <div className={`admin-msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="admin-filter-tabs">
        {['all', ...PHYSICAL_STATUSES].map(status => (
          <button key={status} className={`admin-filter-tab ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" />Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={7} className="admin-empty">No physical orders found.</td></tr>}
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>#{String(order.id).slice(0, 8)}</strong></td>
                  <td>
                    <div>{[order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ') || 'Customer'}</div>
                    <div className="td-email">{order.user?.email || '—'}</div>
                    <div className="td-email">{order.user?.phone || ''}</div>
                  </td>
                  <td>{(order.items || []).map(item => `${item.product?.name || 'Product'} × ${item.quantity}`).join(', ') || '—'}</td>
                  <td>{order.shippingAddress || '—'}</td>
                  <td className="td-num">PKR {Number(order.total).toLocaleString('en-PK')}</td>
                  <td className="td-date">{fmtDate(order.createdAt)}</td>
                  <td>
                    <select
                      className="shpadmin-select"
                      value={order.status}
                      disabled={acting === order.id}
                      onChange={event => changeStatus(order, event.target.value)}
                      aria-label={`Status for order ${order.id}`}
                    >
                      {PHYSICAL_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
