import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getProducts, getCategories, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, imageUrl,
} from '../../services/api.js';
import { slugify, formatPKR } from '../shop/shopUtils.js';
import './admin-shop.css';

/**
 * ProductManager — self-contained. Table (type/stock columns) + create/edit
 * form: name, slug, category, type toggle, PKR price, dynamic variant rows,
 * stock, images (file upload + URL add, removable thumbnails), description
 * (textarea), digital file upload (pdf/doc/epub/zip) for digital products.
 *
 * Upload contract: when files are present the form is sent as multipart with
 * `images[]` (each entry a file or a kept image URL) and `digitalFile`;
 * scalars + `variants` (JSON string) ride along. With no new files the same
 * payload is sent as JSON (images as URL array).
 */
export default function ProductManager() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getProducts({ limit: 200 });
      setProducts(d.products || (Array.isArray(d) ? d : []));
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    getCategories().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, [load]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

  const handleDelete = async (p) => {
    if (!confirm(`Delete product "${p.name}"?\n\nThis cannot be undone.`)) return;
    try { await adminDeleteProduct(p.id); flash(`"${p.name}" deleted.`); load(); }
    catch (e) { flash(e.message, false); }
  };

  const startEdit = (p) => { setEditing(p); setFormOpen(true); };
  const startCreate = () => { setEditing(null); setFormOpen(true); };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Products</h2>
        <button className="admin-btn-edit" onClick={startCreate}>+ New Product</button>
      </div>

      {msg && <div className={`admin-msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}

      {formOpen && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); setEditing(null); flash(`Product ${editing ? 'updated' : 'created'}.`); load(); }}
          onError={(e) => flash(e.message, false)}
        />
      )}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" />Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Type</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={6} className="admin-empty">No products yet.</td></tr>}
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><div className="post-slug-text">/shop/{p.slug}</div></td>
                  <td><span className={`shpadmin-payment-badge ${p.type === 'digital' ? '' : ''}`}>{p.type === 'digital' ? 'Digital' : 'Physical'}</span></td>
                  <td>{p.category?.name || '—'}</td>
                  <td className="td-num">{formatPKR(p.price)}</td>
                  <td className="td-num">{p.stock ?? '—'}</td>
                  <td className="admin-actions">
                    <button className="admin-btn-edit" onClick={() => startEdit(p)}>Edit</button>
                    <a href={`/shop/${p.slug}`} target="_blank" rel="noreferrer" className="admin-btn-view">View</a>
                    <button className="admin-btn-delete" onClick={() => handleDelete(p)}>Delete</button>
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

function ProductForm({ product, categories, onClose, onSaved, onError }) {
  const imgRef = useRef();
  const fileRef = useRef();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name:        product?.name || '',
    slug:        product?.slug || '',
    categoryId:  product?.categoryId || product?.category?.id || '',
    type:        product?.type || 'physical',
    price:       product?.price ?? '',
    stock:       product?.stock ?? '',
    description: product?.description || '',
    variants:    product?.variants?.length ? product.variants.map(v => ({ label: v.label, price: v.price })) : [{ label: '', price: '' }],
  });
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [keptImages, setKeptImages]   = useState(Array.isArray(product?.images) ? product.images.filter(Boolean) : []);
  const [newFiles, setNewFiles]       = useState([]);
  const [urlInput, setUrlInput]       = useState('');
  const [digitalFile, setDigitalFile] = useState(null);
  const [saving, setSaving]           = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleName = (v) => setForm(f => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    setKeptImages(prev => [...prev, u]);
    setUrlInput('');
  };
  const addFiles = (e) => {
    setNewFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    e.target.value = '';
  };
  const removeKept = (i) => setKeptImages(prev => prev.filter((_, x) => x !== i));
  const removeNew = (i) => setNewFiles(prev => prev.filter((_, x) => x !== i));

  const setVariant = (i, k, v) =>
    set('variants', form.variants.map((row, x) => (x === i ? { ...row, [k]: v } : row)));
  const addVariant = () => set('variants', [...form.variants, { label: '', price: '' }]);
  const removeVariant = (i) => set('variants', form.variants.filter((_, x) => x !== i));

  const save = async () => {
    if (!form.name.trim())      { onError(new Error('Name is required.')); return; }
    if (!form.categoryId)       { onError(new Error('Please choose a category.')); return; }
    const price = Math.round(Number(form.price));
    if (!Number.isFinite(price) || price < 0) { onError(new Error('Price must be a valid PKR amount.')); return; }

    const variants = form.variants
      .filter(v => v.label.trim())
      .map(v => ({ label: v.label.trim(), price: Math.round(Number(v.price)) || 0 }));

    const base = {
      name:        form.name.trim(),
      slug:        (form.slug || slugify(form.name)).trim(),
      // Category IDs are PostgreSQL UUIDs. Number(uuid) becomes NaN/null
      // and leaves newly-created products detached from their category.
      categoryId:  form.categoryId,
      type:        form.type,
      price,
      stock:       form.stock === '' ? null : Number(form.stock),
      description: form.description.trim() || undefined,
      variants,
    };

    setSaving(true);
    try {
      let payload;
      if (newFiles.length > 0 || digitalFile) {
        const fd = new FormData();
        Object.entries(base).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          fd.append(k, k === 'variants' ? JSON.stringify(v) : String(v));
        });
        keptImages.forEach(u => fd.append('images[]', u));
        newFiles.forEach(f => fd.append('images[]', f));
        if (digitalFile) fd.append('digitalFile', digitalFile);
        payload = fd;
      } else {
        payload = { ...base, images: keptImages };
      }
      if (isEdit) await adminUpdateProduct(product.id, payload);
      else        await adminCreateProduct(payload);
      onSaved();
    } catch (e) { onError(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="shpadmin-modal-overlay" onClick={onClose}>
      <div className="shpadmin-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit product' : 'New product'}>
        <h3>{isEdit ? `Edit: ${product.name}` : 'New Product'}</h3>

        <div className="shpadmin-form-grid">
          <div className="shpadmin-field">
            <label>Name *</label>
            <input className="shpadmin-input" value={form.name} onChange={e => handleName(e.target.value)} placeholder="High-Protein Meal Guide" />
          </div>
          <div className="shpadmin-field">
            <label>Slug</label>
            <input className="shpadmin-input" value={form.slug} onChange={e => { set('slug', e.target.value); setSlugTouched(true); }} placeholder="high-protein-meal-guide" />
          </div>
          <div className="shpadmin-field">
            <label>Category *</label>
            <select className="shpadmin-select" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="">— Select —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="shpadmin-field">
            <label>Type</label>
            <div className="shpadmin-type-toggle" role="group" aria-label="Product type">
              {['physical', 'digital'].map(t => (
                <button key={t} type="button" className={form.type === t ? 'active' : ''} onClick={() => set('type', t)}>
                  {t === 'digital' ? 'Digital' : 'Physical'}
                </button>
              ))}
            </div>
          </div>
          <div className="shpadmin-field">
            <label>Price (PKR) *</label>
            <input className="shpadmin-input" type="number" min="0" step="1" value={form.price} onChange={e => set('price', e.target.value)} placeholder="2500" />
          </div>
          <div className="shpadmin-field">
            <label>Stock</label>
            <input className="shpadmin-input" type="number" min="0" step="1" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="Leave blank for digital" />
          </div>

          <div className="shpadmin-field span2">
            <label>Variants <span className="field-hint">— e.g. pack sizes; first price drives the “from” label</span></label>
            {form.variants.map((v, i) => (
              <div key={i} className="shpadmin-variant-row">
                <input className="shpadmin-input" value={v.label} onChange={e => setVariant(i, 'label', e.target.value)} placeholder="500g pack" />
                <input className="shpadmin-input" type="number" min="0" step="1" value={v.price} onChange={e => setVariant(i, 'price', e.target.value)} placeholder="PKR" />
                <button type="button" className="shpadmin-mini-btn danger" onClick={() => removeVariant(i)} aria-label="Remove variant">✕</button>
              </div>
            ))}
            <button type="button" className="shpadmin-mini-btn" onClick={addVariant}>+ Add variant</button>
          </div>

          <div className="shpadmin-field span2">
            <label>Images</label>
            <div className="shpadmin-thumbs">
              {keptImages.map((u, i) => (
                <div key={`k${i}`} className="shpadmin-img-thumb">
                  <img src={imageUrl(u) || u} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                  <button type="button" className="shpadmin-thumb-remove" onClick={() => removeKept(i)} aria-label="Remove image">✕</button>
                </div>
              ))}
              {newFiles.map((f, i) => (
                <div key={`n${i}`} className="shpadmin-img-thumb">
                  <img src={URL.createObjectURL(f)} alt={f.name} />
                  <button type="button" className="shpadmin-thumb-remove" onClick={() => removeNew(i)} aria-label="Remove image">✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input className="shpadmin-input" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Paste image URL…" style={{ flex: 1 }} />
              <button type="button" className="shpadmin-mini-btn" onClick={addUrl}>Add URL</button>
              <button type="button" className="shpadmin-mini-btn" onClick={() => imgRef.current?.click()}>Upload files</button>
              <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addFiles} />
            </div>
          </div>

          {form.type === 'digital' && (
            <div className="shpadmin-field span2">
              <label>Digital file <span className="field-hint">— pdf, doc, epub or zip</span></label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button type="button" className="shpadmin-mini-btn" onClick={() => fileRef.current?.click()}>
                  {digitalFile ? 'Replace file' : 'Choose file'}
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.epub,.zip" style={{ display: 'none' }} onChange={e => setDigitalFile(e.target.files?.[0] || null)} />
                {digitalFile && <span className="field-hint">{digitalFile.name} ({Math.round(digitalFile.size / 1024)} KB)</span>}
              </div>
            </div>
          )}

          <div className="shpadmin-field span2">
            <label>Description <span className="field-hint">— HTML is rendered on the product page</span></label>
            <textarea className="shpadmin-textarea" rows={6} value={form.description} onChange={e => set('description', e.target.value)} placeholder="<p>Rich product description…</p>" />
          </div>
        </div>

        <div className="shpadmin-modal-actions">
          <button className="shpadmin-mini-btn" onClick={onClose}>Cancel</button>
          <button className="shpadmin-grant-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}</button>
        </div>
      </div>
    </div>
  );
}
