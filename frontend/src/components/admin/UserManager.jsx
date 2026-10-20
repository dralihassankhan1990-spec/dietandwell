import React, { useState, useEffect, useCallback } from 'react';
import { adminGetUsers, adminCreateUser, adminUpdateUser } from '../../services/api.js';
import Badge from '../UI/Badge.jsx';
import './admin-shop.css';

const ROLES = ['admin', 'editor', 'user', 'customer', 'visitor'];

/**
 * UserManager — self-contained. Table (email, name, role, active),
 * create form (email, password, first name, last name, role),
 * activate/deactivate toggle, role change select.
 */
export default function UserManager() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser]   = useState({ email: '', password: '', firstName: '', lastName: '', role: 'customer' });
  const [acting, setActing]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminGetUsers();
      setUsers(Array.isArray(d) ? d : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const patch = async (id, payload) => {
    setActing(id);
    try {
      await adminUpdateUser(id, payload);
      flash('User updated.');
      load();
    } catch (e) { flash(e.message, false); }
    finally { setActing(null); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!newUser.email.trim() || !newUser.password) { flash('Email and password are required.', false); return; }
    if (!newUser.firstName.trim()) { flash('First name is required.', false); return; }
    setCreating(true);
    try {
      await adminCreateUser({
        email:     newUser.email.trim(),
        password:  newUser.password,
        firstName: newUser.firstName.trim(),
        lastName:  newUser.lastName.trim(),
        role:      newUser.role,
      });
      flash('User created.');
      setShowCreate(false);
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'customer' });
      load();
    } catch (err) { flash(err.message, false); }
    finally { setCreating(false); }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Users</h2>
        <button className="admin-btn-edit" onClick={() => setShowCreate(s => !s)}>
          {showCreate ? 'Close' : '+ New User'}
        </button>
      </div>

      {msg && <div className={`admin-msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}

      {showCreate && (
        <form className="editor-card" style={{ marginBottom: 16 }} onSubmit={create}>
          <h4 style={{ margin: '0 0 12px' }}>Create user</h4>
          <div className="shpadmin-form-grid">
            <div className="shpadmin-field">
              <label>Email *</label>
              <input className="shpadmin-input" type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} placeholder="user@example.com" />
            </div>
            <div className="shpadmin-field">
              <label>Password *</label>
              <input className="shpadmin-input" type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} placeholder="Minimum length per backend rules" autoComplete="new-password" />
            </div>
            <div className="shpadmin-field">
              <label>First name *</label>
              <input className="shpadmin-input" value={newUser.firstName} onChange={e => setNewUser(u => ({ ...u, firstName: e.target.value }))} />
            </div>
            <div className="shpadmin-field">
              <label>Last name</label>
              <input className="shpadmin-input" value={newUser.lastName} onChange={e => setNewUser(u => ({ ...u, lastName: e.target.value }))} />
            </div>
            <div className="shpadmin-field">
              <label>Role</label>
              <select className="shpadmin-select" value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="shpadmin-modal-actions">
            <button type="submit" className="shpadmin-grant-btn" disabled={creating}>{creating ? 'Creating…' : 'Create user'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" />Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan={5} className="admin-empty">No users found.</td></tr>}
              {users.map(u => (
                <tr key={u.id}>
                  <td className="td-email">{u.email}</td>
                  <td>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td>
                    <select
                      className="shpadmin-select"
                      style={{ width: 'auto' }}
                      value={u.role}
                      disabled={acting === u.id}
                      onChange={e => patch(u.id, { role: e.target.value })}
                      aria-label={`Change role for ${u.email}`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td><Badge variant={u.isActive ? 'success' : 'warning'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="admin-actions">
                    <button
                      className={u.isActive ? 'admin-btn-delete' : 'admin-btn-edit'}
                      disabled={acting === u.id}
                      onClick={() => patch(u.id, { isActive: !u.isActive })}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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
