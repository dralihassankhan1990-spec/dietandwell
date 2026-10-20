import { useSEO } from '../hooks/useSEO.js';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Badge from '../components/UI/Badge.jsx';
import VitalityRing from '../components/data-viz/VitalityRing.jsx';
import { useReveal } from '../hooks/useReveal';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getMyOrders, getMyCalculatorResults, updateProfile, logout as apiLogout } from '../services/api.js';
import '../styles/Profile.css';

/* ── route: /profile  (protected — requires accessToken) ─────
   Data is real: the logged-in user from AuthContext, orders from
   GET /orders, saved calculator results from
   GET /calculators/my-results. Empty states render when there is
   no data yet — no placeholder/mock user, orders or metrics.
   ─────────────────────────────────────────────────────────── */

export default function Profile() {
  useSEO({"title":"My Profile","description":"Manage your DietAndWell profile.","noIndex":true});
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [savedResults, setSavedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  useReveal();

  useEffect(() => {
    Promise.all([
      getMyOrders().then(d => d.orders || []).catch(() => []),
      getMyCalculatorResults().then(d => (Array.isArray(d) ? d : [])).catch(() => []),
    ]).then(([o, r]) => {
      setOrders(o);
      setSavedResults(r);
      setLoading(false);
    });
  }, []);

  const displayUser = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role === 'admin' ? 'Admin' : 'Member',
    joinedDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '',
    avatar: `${(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}`.toUpperCase() || '•',
  };

  const latestBmi = savedResults.find(r => r.calculatorType === 'bmi');

  const tabs = [
    { id: 'overview',  label: 'Overview',      icon: '🏠' },
    { id: 'health',    label: 'Health Data',    icon: '💓' },
    { id: 'orders',    label: 'My Orders',      icon: '📦' },
    { id: 'settings',  label: 'Settings',       icon: '⚙️' },
  ];

  return (
    <div className="profile-page">

      {/* Profile Hero */}
      <div className="profile-hero">
        <Container>
          <div className="profile-hero-inner reveal">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {displayUser.avatar}
              </div>
              <div className="profile-avatar-ring" />
            </div>
            <div className="profile-hero-info">
              <div className="profile-badge-row">
                <Badge variant="primary">{displayUser.role}</Badge>
                {displayUser.joinedDate && (
                  <span className="profile-joined">Member since {displayUser.joinedDate}</span>
                )}
              </div>
              <h1 className="profile-name">{displayUser.firstName} {displayUser.lastName}</h1>
              <p className="profile-email">{displayUser.email}</p>
            </div>
            <div className="profile-hero-actions">
              <Button variant="primary" size="sm" onClick={() => setActiveTab('settings')}>Edit Profile</Button>
              <Button variant="outline-white" size="sm" href="/calculators">Run Health Check</Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Tab Bar */}
      <div className="profile-tabbar">
        <Container>
          <div className="profile-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`profile-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Tab Content */}
      <SectionWrapper bg="container">
        <Container>
          {activeTab === 'overview' && <OverviewTab user={displayUser} savedResults={savedResults} loading={loading} />}
          {activeTab === 'health'   && <HealthTab savedResults={savedResults} loading={loading} />}
          {activeTab === 'orders'   && <OrdersTab orders={orders} loading={loading} />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </Container>
      </SectionWrapper>
    </div>
  );
}

function OverviewTab({ user, savedResults, loading }) {
  const latest = savedResults[0];
  return (
    <div className="profile-grid-3 reveal">
      {/* Latest saved result */}
      <div className="profile-card card-3d span-2">
        <h3 className="profile-card-title">Your Latest Saved Result</h3>
        {loading ? (
          <p>Loading…</p>
        ) : latest ? (
          <div className="profile-metrics-row">
            <VitalityRing
              value={Math.round(Number(latest.results?.bmi ?? latest.results?.tdee ?? latest.results?.bodyFat ?? 0)) || 0}
              max={100}
              label={latest.calculatorType}
              size={110}
            />
            <div className="profile-metric-list">
              <div className="profile-metric-row">
                <span className="pm-label">Calculator</span>
                <span className="pm-value good">{latest.calculatorType}</span>
              </div>
              <div className="profile-metric-row">
                <span className="pm-label">Saved</span>
                <span className="pm-value good">
                  {latest.createdAt ? new Date(latest.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="profile-metric-row">
                <span className="pm-label">Results</span>
                <span className="pm-value good">{JSON.stringify(latest.results)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="profile-empty-text">
              No saved results yet. Run a calculator and press “Save Result” to track your progress here.
            </p>
            <Button variant="primary" href="/calculators">Open Health Calculators</Button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="profile-card card-3d">
        <h3 className="profile-card-title">Quick Actions</h3>
        <div className="profile-quick-grid">
          {[
            { icon: '🧬', label: 'Run All Calculators',    href: '/calculators' },
            { icon: '📋', label: 'View My Meal Plan',      href: '/subscriptions' },
            { icon: '📞', label: 'Book a Coaching Call',   href: '/contact' },
            { icon: '🛒', label: 'Shop Supplements',       href: '/shop' },
          ].map(q => (
            <a key={q.label} href={q.href} className="profile-quick-card">
              <span className="pq-icon">{q.icon}</span>
              <span className="pq-label">{q.label}</span>
              <span className="pq-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthTab({ savedResults, loading }) {
  return (
    <div className="reveal">
      <div className="profile-card card-3d">
        <h3 className="profile-card-title">Saved Calculator Results</h3>
        {loading ? (
          <p>Loading…</p>
        ) : savedResults.length === 0 ? (
          <div>
            <p className="profile-empty-text">
              No saved results yet. Run a calculator and press “Save Result” to see your history here.
            </p>
            <Button variant="primary" href="/calculators">Open Health Calculators</Button>
          </div>
        ) : (
          <div className="orders-list">
            {savedResults.map(r => (
              <div key={r.id} className="order-row">
                <div className="order-id">{r.calculatorType}</div>
                <div className="order-meta">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                </div>
                <div className="order-total">{JSON.stringify(r.results)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-card card-3d profile-card-spaced">
        <h3 className="profile-card-title">Run a Fresh Assessment</h3>
        <p className="profile-card-lead">
          Health metrics change as your body changes. Re-run your calculations every 4–6 weeks for accurate targets.
        </p>
        <Button variant="primary" href="/calculators">Open Health Calculators</Button>
      </div>
    </div>
  );
}

function OrdersTab({ orders, loading }) {
  return (
    <div className="profile-card card-3d reveal">
      <h3 className="profile-card-title">Order History</h3>
      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span>📦</span>
          <p>No orders yet. <Link to="/shop">Browse our shop</Link></p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(o => (
            <div key={o.id} className="order-row">
              <div className="order-id">#{String(o.id).slice(0, 8)}</div>
              <div className="order-meta">
                {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'} · {(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}
              </div>
              <div className="order-total">PKR {Number(o.total).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <Badge variant={o.status === 'completed' ? 'success' : 'warning'}>{o.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user }) {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const updated = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      updateUser(updated);
      setNotice('Profile updated successfully.');
    } catch (error) {
      setNotice(error.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card card-3d reveal profile-card-narrow">
      <h3 className="profile-card-title">Profile Settings</h3>
      <form onSubmit={save} className="settings-form">
        <div className="settings-row">
          <div className="settings-field">
            <label>First Name</label>
            <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="settings-field">
            <label>Last Name</label>
            <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div className="settings-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="settings-field">
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 000 0000" />
        </div>
        <div className="settings-actions">
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          {notice && <span className="settings-notice" role="status">{notice}</span>}
        </div>
      </form>

      <div className="settings-danger">
        <h4>Danger Zone</h4>
        <Button variant="outline" size="sm" onClick={async () => { await apiLogout(); window.location.href = '/'; }}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
