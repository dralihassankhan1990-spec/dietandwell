import { useEffect, useState } from 'react';
import { adminGetContacts, adminMarkContactRead, adminReplyContact } from '../../services/api.js';

export default function ContactManager() {
  const [data, setData] = useState({ inquiries: [], totalPages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [sending, setSending] = useState(null);
  const [notice, setNotice] = useState('');
  useEffect(() => { let active = true; setLoading(true); adminGetContacts({ page }).then(d => { if(active) { setData(d); setError(''); } }).catch(e => active && setError(e.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [page]);
  const replace = inquiry => setData(d => ({ ...d, inquiries: d.inquiries.map(c => c.id === inquiry.id ? inquiry : c) }));
  const read = async id => { try { replace(await adminMarkContactRead(id)); } catch(e) { setError(e.message); } };
  const send = async c => {
    if (!drafts[c.id]?.trim() || sending) return;
    if (!window.confirm(`Send this email reply to ${c.email}?`)) return;
    setSending(c.id); setError(''); setNotice('');
    try { replace(await adminReplyContact(c.id, drafts[c.id])); setDrafts(d => ({ ...d, [c.id]: '' })); setNotice('Reply accepted by the email provider and saved.'); }
    catch(e) { setError(e.message); } finally { setSending(null); }
  };
  return <section className="admin-section"><h2>Contact inbox</h2>
    <p>Review enquiries and keep replies with the original conversation.</p>
    {error && <p role="alert" className="admin-msg error">{error}</p>}{notice && <p role="status" className="admin-msg success">{notice}</p>}
    {!loading && !data.replyAvailable && <p className="admin-msg">Website email replies need a configured email provider and verified sender. Enquiries are still saved. You can use your email app below.</p>}
    {loading ? <p>Loading enquiries…</p> : data.inquiries.length === 0 ? <p>No enquiries on this page.</p> : data.inquiries.map(c => <article className="contact-card" key={c.id}>
      <div className="contact-card-header"><div><strong>{c.name}</strong><a className="contact-email" href={`mailto:${c.email}`}>{c.email}</a>{c.phone && <span>{c.phone}</span>}</div><span>{c.status} · {new Date(c.createdAt).toLocaleDateString()}</span></div>
      <p className="contact-message" style={{ whiteSpace: 'pre-wrap' }}>{c.message}</p>
      {c.status === 'new' && <button className="admin-btn-edit" onClick={() => read(c.id)}>Mark read</button>}
      {c.notes && <details><summary>Reply history / notes</summary><p style={{ whiteSpace: 'pre-wrap' }}>{c.notes}</p></details>}
      <label style={{ display: 'grid', gap: 8, marginTop: 16 }}>Your reply<textarea className="bm-input" rows={4} maxLength={10000} value={drafts[c.id] || ''} onChange={e => setDrafts(d => ({ ...d, [c.id]: e.target.value }))} placeholder="Write a thoughtful response…" /></label>
      <button className="contact-reply-btn" disabled={!data.replyAvailable || !!sending || !drafts[c.id]?.trim()} onClick={() => send(c)}>{sending === c.id ? 'Sending…' : 'Send email reply'}</button>{' '}
      <a href={`mailto:${c.email}?subject=Re%3A%20DietAndWell%20enquiry&body=${encodeURIComponent(drafts[c.id] || '')}`}>Open in email app</a>
    </article>)}
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 24 }}><button disabled={loading || page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {Math.max(1, data.totalPages)}</span><button disabled={loading || page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</button></div>
  </section>;
}
