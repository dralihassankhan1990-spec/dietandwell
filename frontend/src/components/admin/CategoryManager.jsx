import React, { useState, useEffect, useCallback } from 'react';
import {
  getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, imageUrl,
} from '../../services/api.js';
import { slugify } from '../shop/shopUtils.js';
import './admin-shop.css';

/**
 * CategoryManager — self-contained. Table + create/edit modal
 * (name, slug, image URL with preview, description, sortOrder),
 * delete with confirm; backend 400 (not-empty) error is surfaced.
 */
export default function CategoryManager() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState(null);
  const [modal, setModal]   = useState(null); // null | {category|null}

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getCategories();
      const list = Array.isArray(d) ? d : [];
      setCats(list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch { setCats([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

  const handleDelete = async (c) => {
    if (!confirm(`Delete category "${c.name}"?\n\nThis cannot be undone.`)) return;
    try {
      await adminDeleteCategory(c.id);
      flash(`Category "${c.name}" deleted.`);
      load();
    } catch (e) {
      flash(e.message, false); // surfaces the 400-if-not-empty error
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Categories</h2>
        <button className="admin-btn-edit" onClick={() => setModal({ category: null })}>+ New Category</button>
      </div>

      {msg && <div className={`admin-msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" />Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Description</th><th>Sort</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.length === 0 && <tr><td colSpan={6} className="admin-empty">No categories yet.</td></tr>}
              {cats.map(c => (
                <tr key={c.id}>
                  <td className="shpadmin-cat-imgcell">
                    {c.image ? <img src={imageUrl(c.image) || c.image} alt={c.name} onError={(e) => { e.target.style.display = 'none'; }} /> : '—'}
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td className="td-email">{c.slug}</td>
                  <td>{c.description ? c.description.substring(0, 60) + (c.description.length > 60 ? '…' : '') : '—'}</td>
                  <td className="td-num">{c.sortOrder ?? 0}</td>
                  <td className="admin-actions">
                    <button className="admin-btn-edit" onClick={() => setModal({ category: c })}>Edit</button>
                    <button className="admin-btn-delete" onClick={() => handleDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); flash(`Category ${modal.category ? 'updated' : 'created'}.`); load(); }}
          onError={(e) => flash(e.message, false)}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    name:        category?.name || '',
    slug:        category?.slug || '',
    image:       category?.image || '',
    description: category?.description || '',
    sortOrder:   category?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!category);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleName = (v) => {
    setForm(f => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));
  };

  const save = async () => {
    if (!form.name.trim()) { onError(new Error('Name is required.')); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || slugify(form.name)).trim() || undefined,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (category) await adminUpdateCategory(category.id, payload);
      else          await adminCreateCategory(payload);
      onSaved();
    } catch (e) { onError(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="shpadmin-modal-overlay" onClick={onClose}>
      <div className="shpadmin-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={category ? 'Edit category' : 'New category'}>
        <h3>{category ? 'Edit Category' : 'New Category'}</h3>
        <div className="shpadmin-form-grid">
          <div className="shpadmin-field">
            <label>Name *</label>
            <input className="shpadmin-input" value={form.name} onChange={e => handleName(e.target.value)} placeholder="Digital Books" />
          </div>
          <div className="shpadmin-field">
            <label>Slug</label>
            <input className="shpadmin-input" value={form.slug} onChange={e => { set('slug', e.target.value); setSlugTouched(true); }} placeholder="digital-books" />
          </div>
          <div className="shpadmin-field span2">
            <label>Image URL</label>
            <input className="shpadmin-input" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://… or /images/cat-digital-books.jpg" />
            {form.image && <img className="shpadmin-preview" src={imageUrl(form.image) || form.image} alt="Category preview" onError={(e) => { e.target.style.display = 'none'; }} />}
          </div>
          <div className="shpadmin-field span2">
            <label>Description</label>
            <textarea className="shpadmin-textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description shown on the banner card" />
          </div>
          <div className="shpadmin-field">
            <label>Sort order</label>
            <input className="shpadmin-input" type="number" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} />
          </div>
        </div>
        <div className="shpadmin-modal-actions">
          <button className="shpadmin-mini-btn" onClick={onClose}>Cancel</button>
          <button className="shpadmin-grant-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : category ? 'Save changes' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
