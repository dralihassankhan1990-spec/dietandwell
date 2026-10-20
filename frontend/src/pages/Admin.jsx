import { useState, useEffect, useRef, useCallback } from 'react';
import ContactManager from '../components/admin/ContactManager.jsx';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button.jsx';
import Badge from '../components/UI/Badge.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSEO, SEO } from '../hooks/useSEO.js';
import {
  getBlogs, adminGetBlogs, adminCreateBlog, adminUpdateBlog, adminDeleteBlog,
  uploadBlogFeaturedImage, uploadBlogContentImages,
  adminGetContacts, adminMarkContactRead,
  adminGetUsers, adminGetSubscribers, adminDeleteSubscriber,
  getMetrics, imageUrl, logout,
} from '../services/api.js';
import '../styles/admin.css';
import '../components/admin/admin-shop.css';
import BlogManager from '../components/admin/BlogManager.jsx';
import CategoryManager from '../components/admin/CategoryManager.jsx';
import ProductManager from '../components/admin/ProductManager.jsx';
import OrderManager from '../components/admin/OrderManager.jsx';
import SettingsManager from '../components/admin/SettingsManager.jsx';
import UserManager from '../components/admin/UserManager.jsx';

export default function Admin() {
  const { isAdmin, canManageBlog } = useAuth();
  const navigate    = useNavigate();
  const [tab, setTab] = useState('posts');
  useSEO(SEO.admin);

  useEffect(() => {
    if (!canManageBlog) navigate('/profile', { replace: true });
  }, [canManageBlog, navigate]);

  const tabs = [
    { id: 'posts',    icon: '📝', label: 'Blog Posts' },
    ...(isAdmin ? [
      { id: 'shop',     icon: '🛍', label: 'Shop' },
      { id: 'orders',   icon: '📦', label: 'Orders' },
      { id: 'contacts', icon: '📩', label: 'Contacts' },
      { id: 'users',    icon: '👥', label: 'Users' },
      { id: 'settings', icon: '⚙', label: 'Settings' },
      { id: 'subscribers', icon: '📬', label: 'Subscribers' },
      { id: 'metrics',  icon: '📊', label: 'Dashboard' },
    ] : []),
  ];

  const activeTab = typeof tab === 'string' ? tab : tab?.id;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="admin-logo">🥗 DietAndWell Admin</div>
        <div className="admin-topbar-actions">
          <a href="/" className="admin-site-link" target="_blank" rel="noreferrer">↗ View Site</a>
          <button className="admin-logout-btn" onClick={async () => { await logout(); navigate('/login'); }}>Log Out</button>
        </div>
      </div>

      {/* ── Admin banner (Round 1 hero audit: page had no hero) ── */}
      <div className="admin-hero-slim">
        <PageHero
          title="Site Administration"
          subtitle={isAdmin ? 'Manage blog posts, orders, users, and site settings.' : 'Manage blog posts and published articles.'}
        />
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          {tabs.map(t => (
            <button key={t.id} className={`admin-nav-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
          <button className="admin-nav-btn admin-nav-new" onClick={() => setTab('posts')}>
            + New Blog Post
          </button>
        </aside>

        <main className="admin-main">
          {activeTab === 'posts'    && <BlogManager />}
          {activeTab === 'shop'     && (<>
            <CategoryManager />
            <ProductManager />
          </>)}
          {activeTab === 'orders'   && <OrderManager />}
          {activeTab === 'contacts' && <ContactManager />}
          {activeTab === 'users'    && <UserManager />}
          {activeTab === 'settings' && <SettingsManager />}
          {activeTab === 'subscribers' && <SubscribersList />}
          {activeTab === 'metrics'  && <Dashboard setTab={setTab} />}
        </main>
      </div>
    </div>
  );
}

/* ── PostsList ───────────────────────────────────────────────── */
function PostsList({ onEdit }) {
  const [posts,  setPosts]  = useState([]);
  const [loading,setLoading]= useState(true);
  const [msg,    setMsg]    = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminGetBlogs({ limit: 200 }); setPosts(d.posts || []); }
    catch { setPosts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const togglePublish = async (post) => {
    try {
      await adminUpdateBlog(post.id, { published: !post.published });
      flash(`✓ "${post.title.substring(0,30)}" ${!post.published ? 'published' : 'moved to draft'}`);
      load();
    } catch (e) { flash('✗ ' + e.message); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;
    try { await adminDeleteBlog(id); flash('✓ Deleted'); load(); }
    catch (e) { flash('✗ ' + e.message); }
  };

  const counts = { all: posts.length, published: posts.filter(p=>p.published).length, draft: posts.filter(p=>!p.published).length };
  const filtered = filter === 'all' ? posts : posts.filter(p => filter === 'published' ? p.published : !p.published);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Blog Posts</h2>
        <Button variant="primary" size="sm" onClick={() => onEdit(null)}>+ New Post</Button>
      </div>

      {msg && <div className={`admin-msg ${msg.startsWith('✓') ? 'success' : 'error'}`}>{msg}</div>}

      <div className="admin-filter-tabs">
        {['all','published','draft'].map(f => (
          <button key={f} className={`admin-filter-tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)} <span className="admin-filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="admin-loading"><div className="admin-spinner"/>Loading…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="admin-empty">No {filter!=='all'?filter:''} posts yet.</td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="post-title-cell">
                    <div className="post-title-text">{p.title}</div>
                    <div className="post-slug-text">/blog/{p.slug}</div>
                  </td>
                  <td>
                    <button className={`status-toggle ${p.published?'published':'draft'}`}
                      onClick={() => togglePublish(p)} title={p.published?'Click to unpublish':'Click to publish'}>
                      {p.published ? '● Live' : '○ Draft'}
                    </button>
                  </td>
                  <td className="td-cat">{p.categories?.map(c=>c.name).join(', ')||'—'}</td>
                  <td className="td-num">{p.views||0}</td>
                  <td className="td-date">{p.createdAt?new Date(p.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'}):'—'}</td>
                  <td className="admin-actions">
                    <button className="admin-btn-edit" onClick={()=>onEdit(p)}>Edit</button>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="admin-btn-view">View</a>
                    <button className="admin-btn-delete" onClick={()=>handleDelete(p.id,p.title)}>Delete</button>
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

/* ── BlogEditor ──────────────────────────────────────────────── */
function BlogEditor({ post: ep = null, onDone }) {
  const isEdit   = !!ep;
  const featRef  = useRef();
  const contRef  = useRef();
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');
  const [uploading, setUploading] = useState(false);
  const [contUp,    setContUp]    = useState(false);
  const [imgPreview,setImgPreview]= useState(ep?.featuredImage ? imageUrl(ep.featuredImage) : null);
  const [contImgs,  setContImgs]  = useState(ep?.contentImages?.filter(Boolean).map(u=>imageUrl(u))||[]);

  const [form, setForm] = useState({
    title:           ep?.title           || '',
    excerpt:         ep?.excerpt          || '',
    content:         ep?.content          || '',
    featuredImage:   ep?.featuredImage    || '',
    contentImages:   ep?.contentImages?.filter(Boolean) || [],
    metaTitle:       ep?.metaTitle        || '',
    metaDescription: ep?.metaDescription  || '',
    categories:      ep?.categories?.map(c=>c.name).join(', ') || '',
    tags:            ep?.tags?.map(t=>t.name).join(', ')       || '',
    published:       ep?.published        ?? false,
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const wc  = form.content.split(/\s+/).filter(Boolean).length;
  const rt  = Math.max(1, Math.ceil(wc/200));
  const autoSlug = form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0,60);

  const handleFeatUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const d = await uploadBlogFeaturedImage(file);
      set('featuredImage', d.url); setImgPreview(imageUrl(d.url)); setMsg('✓ Image uploaded');
    } catch (err) { setMsg('✗ '+err.message); }
    finally { setUploading(false); featRef.current.value=''; }
  };

  const handleContUpload = async (e) => {
    const files = Array.from(e.target.files||[]); if (!files.length) return;
    setContUp(true);
    try {
      const d = await uploadBlogContentImages(files);
      const urls = (d.files||[]).map(f=>f.url);
      setContImgs(prev=>[...prev,...urls.map(u=>imageUrl(u))]);
      set('contentImages',[...form.contentImages,...urls]);
      setMsg(`✓ ${urls.length} image(s) uploaded`);
    } catch (err) { setMsg('✗ '+err.message); }
    finally { setContUp(false); if(contRef.current) contRef.current.value=''; }
  };

  const removeContImg = (idx) => {
    setContImgs(prev=>prev.filter((_,i)=>i!==idx));
    set('contentImages', form.contentImages.filter((_,i)=>i!==idx));
  };

  const handleSave = async (pub=null) => {
    const willPub = pub!==null ? pub : form.published;
    if (!form.title.trim()) { setMsg('✗ Title is required.'); return; }
    if (!form.content.trim()) { setMsg('✗ Content is required.'); return; }
    setSaving(true); setMsg('');
    try {
      const payload = {
        title:           form.title.trim(),
        excerpt:         form.excerpt.trim()||form.content.trim().substring(0,200)+'…',
        content:         form.content.trim(),
        featuredImage:   form.featuredImage||undefined,
        contentImages:   form.contentImages.filter(Boolean),
        metaTitle:       form.metaTitle||form.title,
        metaDescription: form.metaDescription||(form.excerpt||form.content).substring(0,160),
        categories:      form.categories.split(',').map(s=>s.trim()).filter(Boolean),
        tags:            form.tags.split(',').map(s=>s.trim()).filter(Boolean),
        published:       willPub,
      };
      if (isEdit) { await adminUpdateBlog(ep.id, payload); setMsg('✓ Updated!'); }
      else        { await adminCreateBlog(payload);         setMsg('✓ Created!'); }
      setTimeout(onDone, 1200);
    } catch (err) { setMsg('✗ '+err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>{isEdit ? `Edit: ${ep.title.substring(0,35)}…` : 'New Blog Post'}</h2>
        <div className="editor-header-actions">
          <Button variant="outline" size="sm" onClick={onDone}>← Back</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={()=>handleSave(false)}>
            {saving?'Saving…':'Save Draft'}
          </Button>
          <Button variant="accent" size="sm" disabled={saving} onClick={()=>handleSave(true)}>
            {saving?'Publishing…':'Publish'}
          </Button>
        </div>
      </div>

      {msg && <div className={`admin-msg ${msg.startsWith('✓')?'success':'error'}`}>{msg}</div>}

      <div className="editor-layout">
        {/* Main */}
        <div className="editor-main">
          <div className="editor-field">
            <label>Post Title <span className="req">*</span></label>
            <input className="editor-input editor-title-input" placeholder="Write a clear, specific headline…"
              value={form.title} onChange={e=>set('title',e.target.value)} />
            {form.title && <div className="slug-preview">URL: /blog/<strong>{autoSlug}</strong></div>}
          </div>

          <div className="editor-field">
            <label>Excerpt <span className="field-hint">— shown on blog listing (max 300)</span></label>
            <textarea className="editor-textarea editor-excerpt" rows={3}
              placeholder="A compelling 1–2 sentence summary…" maxLength={300}
              value={form.excerpt} onChange={e=>set('excerpt',e.target.value)} />
            <div className="char-count">{form.excerpt.length}/300</div>
          </div>

          <div className="editor-field">
            <label>Content <span className="req">*</span>
              <span className="field-hint"> — Markdown: ## Heading, **bold**, - list, &gt; quote</span>
            </label>
            <textarea className="editor-textarea editor-content" rows={28}
              placeholder={`## Introduction\n\nHook your reader immediately.\n\n## Main Section\n\nDevelop your key points.\n\n- Point one\n- Point two\n\n**Bold** for emphasis.\n\n> Important callout in a blockquote.`}
              value={form.content} onChange={e=>set('content',e.target.value)} />
            <div className="char-count">{wc} words · {rt} min read</div>
          </div>

          {/* Content images */}
          <div className="editor-field">
            <label>Content Images <span className="field-hint">— shown below article</span></label>
            <div className="cont-images-grid">
              {contImgs.map((url,i)=>(
                <div key={i} className="cont-image-item">
                  <img src={url} alt={`Image ${i+1}`} />
                  <button className="cont-image-remove" onClick={()=>removeContImg(i)}>✕</button>
                </div>
              ))}
              <div className="img-upload-zone cont-upload" onClick={()=>contRef.current?.click()}>
                <input ref={contRef} type="file" accept="image/*" multiple
                  className="admin-hidden-input" onChange={handleContUpload} />
                {contUp ? <div className="uploading-indicator">Uploading…</div>
                  : <><div className="upload-icon">🖼️</div><p>Add images</p><p className="upload-hint">Multiple OK · Max 5MB</p></>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          <div className="editor-card">
            <h4>Status</h4>
            <label className="editor-toggle">
              <input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} />
              <span className="toggle-track" />
              <span className={`toggle-label ${form.published?'pub':'draft'}`}>
                {form.published ? '● Published' : '○ Draft'}
              </span>
            </label>
            <p className="field-hint field-hint-spaced">
              {form.published ? 'Visible to all visitors on /blog.' : 'Not visible on /blog — only you can see it.'}
            </p>
          </div>

          <div className="editor-card">
            <h4>Featured Image</h4>
            {imgPreview ? (
              <div className="featured-img-preview">
                <img src={imgPreview} alt="Featured" />
                <button className="remove-img-btn" onClick={()=>{set('featuredImage','');setImgPreview(null);}}>✕ Remove</button>
              </div>
            ) : (
              <div className="img-upload-zone" onClick={()=>featRef.current?.click()}>
                <input ref={featRef} type="file" accept="image/*" className="admin-hidden-input" onChange={handleFeatUpload} />
                {uploading ? <div className="uploading-indicator">Uploading…</div>
                  : <><div className="upload-icon">📷</div><p>Click to upload</p><p className="upload-hint">JPEG, PNG, WebP · Max 5MB</p></>}
              </div>
            )}
            <div className="editor-field editor-field-spaced">
              <label className="editor-label-sm">Or paste URL</label>
              <input className="editor-input" placeholder="https://…" value={form.featuredImage}
                onChange={e=>{set('featuredImage',e.target.value);setImgPreview(e.target.value||null);}} />
            </div>
          </div>

          <div className="editor-card">
            <h4>Categories</h4>
            <input className="editor-input" placeholder="Nutrition, Weight Loss"
              value={form.categories} onChange={e=>set('categories',e.target.value)} />
            <p className="field-hint">Comma-separated. Auto-created.</p>
          </div>

          <div className="editor-card">
            <h4>Tags</h4>
            <input className="editor-input" placeholder="protein, gut-health"
              value={form.tags} onChange={e=>set('tags',e.target.value)} />
            <p className="field-hint">Comma-separated.</p>
          </div>

          <div className="editor-card">
            <h4>SEO</h4>
            <div className="editor-field">
              <label>Meta Title <span className="field-hint">(≤60)</span></label>
              <input className="editor-input" placeholder="Uses post title if blank"
                value={form.metaTitle} maxLength={60} onChange={e=>set('metaTitle',e.target.value)} />
              <div className="char-count">{form.metaTitle.length}/60</div>
            </div>
            <div className="editor-field editor-field-spaced">
              <label>Meta Description <span className="field-hint">(≤160)</span></label>
              <textarea className="editor-textarea" rows={3} placeholder="Uses excerpt if blank"
                value={form.metaDescription} maxLength={160} onChange={e=>set('metaDescription',e.target.value)} />
              <div className="char-count">{form.metaDescription.length}/160</div>
            </div>
            <div className="seo-preview">
              <div className="seo-preview-url">dietandwell.com/blog/{autoSlug}</div>
              <div className="seo-preview-title">{(form.metaTitle||form.title||'Post Title').substring(0,60)}</div>
              <div className="seo-preview-desc">{(form.metaDescription||form.excerpt||'Description…').substring(0,160)}</div>
            </div>
          </div>

          <div className="editor-card editor-stats">
            <div className="stat-row"><span>Words</span><strong>{wc}</strong></div>
            <div className="stat-row"><span>Read time</span><strong>{rt} min</strong></div>
            <div className="stat-row"><span>Chars</span><strong>{form.content.length}</strong></div>
            <div className="stat-row"><span>Images</span><strong>{contImgs.length}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Contacts ────────────────────────────────────────────────── */
function ContactsList() {
  const [contacts,setContacts]=useState([]); const [loading,setLoading]=useState(true); const [msg,setMsg]=useState('');
  const load=async()=>{setLoading(true);try{const d=await adminGetContacts();setContacts(d.inquiries||[]);}catch{setContacts([]);}finally{setLoading(false);};};
  useEffect(()=>{load();},[]);
  const markRead=async(id)=>{try{await adminMarkContactRead(id);load();setMsg('✓ Marked as read');setTimeout(()=>setMsg(''),2000);}catch{}};
  const newCount=contacts.filter(c=>c.status==='new').length;
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Contact Submissions {newCount>0&&<span className="admin-badge-new">{newCount} new</span>}</h2>
      </div>
      {msg&&<div className="admin-msg success">{msg}</div>}
      {loading?<div className="admin-loading"><div className="admin-spinner"/>Loading…</div>:(
        <div className="contacts-list">
          {contacts.length===0&&<p className="admin-empty">No contact submissions yet.</p>}
          {contacts.map(c=>(
            <div key={c.id} className={`contact-card ${c.status==='new'?'contact-card--new':''}`}>
              <div className="contact-card-header">
                <div>
                  <strong>{c.name}</strong>
                  <a href={`mailto:${c.email}`} className="contact-email">{c.email}</a>
                  {c.phone&&<span className="contact-phone">📱 {c.phone}</span>}
                </div>
                <div className="contact-card-meta">
                  <Badge variant={c.status==='new'?'warning':'success'}>{c.status}</Badge>
                  <span className="contact-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                  {c.status==='new'&&<button className="admin-btn-edit" onClick={()=>markRead(c.id)}>Mark Read</button>}
                </div>
              </div>
              <p className="contact-message">{c.message}</p>
              <a href={`mailto:${c.email}?subject=Re: DietAndWell Enquiry`} className="contact-reply-btn">✉️ Reply →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Users ───────────────────────────────────────────────────── */
function UsersList() {
  const [users,setUsers]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{adminGetUsers().then(d=>setUsers(Array.isArray(d)?d:[])).catch(()=>setUsers([])).finally(()=>setLoading(false));}, []);
  return (
    <div className="admin-section">
      <div className="admin-section-header"><h2>Users</h2><span className="admin-count">{users.length} total</span></div>
      {loading?<div className="admin-loading"><div className="admin-spinner"/>Loading…</div>:(
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {users.length===0&&<tr><td colSpan={5} className="admin-empty">No users found.</td></tr>}
              {users.map(u=>(
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td className="td-email">{u.email}</td>
                  <td><Badge variant={u.role==='admin'?'error':'primary'}>{u.role}</Badge></td>
                  <td><Badge variant={u.isActive?'success':'warning'}>{u.isActive?'Active':'Inactive'}</Badge></td>
                  <td className="td-date">{u.createdAt?new Date(u.createdAt).toLocaleDateString():'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Subscribers ───────────────────────────────────────────────
   Real rows from GET /newsletter/subscribers (admin), delete via
   DELETE /newsletter/subscribers/:id. */
function SubscribersList() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminGetSubscribers({ limit: 100 }); setSubs(d.subscribers || []); }
    catch { setSubs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, email) => {
    if (!confirm(`Remove "${email}" from the newsletter?\n\nThis cannot be undone.`)) return;
    try {
      await adminDeleteSubscriber(id);
      setMsg('✓ Subscriber removed');
      setTimeout(() => setMsg(''), 3000);
      load();
    } catch (e) { setMsg('✗ ' + e.message); }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Newsletter Subscribers</h2>
        <span className="admin-count">{subs.length} total</span>
      </div>
      {msg && <div className={`admin-msg ${msg.startsWith('✓') ? 'success' : 'error'}`}>{msg}</div>}
      {loading ? <div className="admin-loading"><div className="admin-spinner" />Loading…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Email</th><th>Subscribed</th><th>Actions</th></tr></thead>
            <tbody>
              {subs.length === 0 && <tr><td colSpan={3} className="admin-empty">No subscribers yet.</td></tr>}
              {subs.map(s => (
                <tr key={s.id}>
                  <td className="td-email">{s.email}</td>
                  <td className="td-date">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="admin-actions">
                    <button className="admin-btn-delete" onClick={() => handleDelete(s.id, s.email)}>Remove</button>
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

/* ── Dashboard ───────────────────────────────────────────────── */
function Dashboard({ setTab }) {
  const [posts,setPosts]=useState([]); const [contacts,setContacts]=useState([]);
  useEffect(()=>{
    getBlogs({limit:5}).then(d=>setPosts(d.posts||[])).catch(()=>{});
    adminGetContacts({limit:5}).then(d=>setContacts(d.inquiries||[])).catch(()=>{});
  },[]);
  const newC=contacts.filter(c=>c.status==='new').length;
  return (
    <div className="admin-section">
      <div className="admin-section-header"><h2>Dashboard</h2></div>
      <div className="dashboard-stats">
        {[
          {icon:'📝',label:'Blog Posts',value:posts.length,action:()=>setTab('posts')},
          {icon:'📩',label:'New Enquiries',value:newC,action:()=>setTab('contacts'),alert:newC>0},
          {icon:'🏆',label:'Happy Clients',value:'666+',action:null},
          {icon:'✅',label:'Published',value:posts.filter(p=>p.published).length,action:()=>setTab('posts')},
        ].map(s=>(
          <div key={s.label} className={`dashboard-stat ${s.action?'clickable cursor-pointer':'cursor-default'} ${s.alert?'alert':''}`}
            onClick={s.action||undefined}>
            <div className="ds-icon">{s.icon}</div>
            <div className="ds-value">{s.value}</div>
            <div className="ds-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-two-col">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header"><h3>Recent Posts</h3><button className="admin-btn-edit" onClick={()=>setTab('posts')}>View All</button></div>
          {posts.map(p=><div key={p.id} className="dashboard-row"><span className="dp-title">{p.title}</span><Badge variant={p.published?'success':'warning'}>{p.published?'Live':'Draft'}</Badge></div>)}
          {!posts.length&&<p className="admin-empty">No posts yet.</p>}
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-header"><h3>Recent Enquiries</h3><button className="admin-btn-edit" onClick={()=>setTab('contacts')}>View All</button></div>
          {contacts.map(c=><div key={c.id} className="dashboard-row"><div><span className="dp-title">{c.name}</span><span className="dp-meta">{c.email}</span></div><Badge variant={c.status==='new'?'warning':'success'}>{c.status}</Badge></div>)}
          {!contacts.length&&<p className="admin-empty">No enquiries yet.</p>}
        </div>
      </div>
    </div>
  );
}
