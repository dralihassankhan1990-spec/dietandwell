import React, { useState, useEffect, useCallback } from 'react';
import { adminGetSettings, adminUpdateSetting } from '../../services/api.js';
import './admin-shop.css';

const MULTILINE_KEYS = new Set(['bank_account_details']);

/**
 * SettingsManager — self-contained key-value table with inline edit.
 * bank_account_details is edited via textarea.
 */
export default function SettingsManager() {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState(null);
  const [editing, setEditing] = useState(null); // key being edited
  const [draft, setDraft]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminGetSettings();
      setRows(Array.isArray(d) ? d : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const startEdit = (row) => { setEditing(row.key); setDraft(row.value ?? ''); };
  const cancelEdit = () => { setEditing(null); setDraft(''); };

  const save = async (key) => {
    try {
      await adminUpdateSetting(key, draft);
      flash(`"${key}" updated.`);
      setEditing(null);
      setDraft('');
      load();
    } catch (e) { flash(e.message, false); }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Settings</h2>
        <span className="admin-count">{rows.length} keys</span>
      </div>

      {msg && <div className={`admin-msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" />Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Key</th><th>Value</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={3} className="admin-empty">No settings found.</td></tr>}
              {rows.map(r => {
                const isOpen = editing === r.key;
                const multiline = MULTILINE_KEYS.has(r.key);
                return (
                  <tr key={r.key}>
                    <td className="shpadmin-key-cell">{r.key}</td>
                    <td>
                      {isOpen ? (
                        <div className="shpadmin-inline-edit">
                          {multiline ? (
                            <textarea className="shpadmin-textarea" rows={5} value={draft} onChange={e => setDraft(e.target.value)} />
                          ) : (
                            <input className="shpadmin-input" value={draft} onChange={e => setDraft(e.target.value)} />
                          )}
                        </div>
                      ) : (
                        <div className="shpadmin-value-pre">{r.value || '—'}</div>
                      )}
                    </td>
                    <td className="admin-actions">
                      {isOpen ? (
                        <div className="shpadmin-action-row">
                          <button className="shpadmin-grant-btn" onClick={() => save(r.key)}>Save</button>
                          <button className="shpadmin-mini-btn" onClick={cancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        <button className="admin-btn-edit" onClick={() => startEdit(r)}>Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="field-hint" style={{ marginTop: 12 }}>
        bank_account_details is shown to customers who choose the bank-transfer option; support_phone and
        support_email appear alongside it.
      </p>
    </div>
  );
}
