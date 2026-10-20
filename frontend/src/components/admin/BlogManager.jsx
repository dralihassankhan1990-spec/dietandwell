/* ================================================================
   BlogManager — self-contained admin blog manager (TipTap editor).
   No props. Does its own API calls via services/api.js (JWT handled
   there). The admin shell wires this component in; it is not imported
   anywhere else, so changes here cannot affect the dashboard shell.
   ================================================================ */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from './ArticleImage.js';
import '../../styles/article-images.css';
import Link from '@tiptap/extension-link';
import Button from '../UI/Button.jsx';
import Badge from '../UI/Badge.jsx';
import {
  adminGetBlogs,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog,
  uploadBlogCoverImage,
  uploadBlogContentImages,
  imageUrl,
} from '../../services/api.js';
import '../../styles/blog-manager.css';
import '../../styles/blog-sidebar.css';

const slugify = (s = '') =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);

const stripHtml = (html = '') => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || '').replace(/\s+/g, ' ').trim();
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function BlogManager() {
  const [view, setView]       = useState('list'); // 'list' | 'editor'
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState({ text: '', kind: '' });
  const [editing, setEditing] = useState(null);   // post object or null for new

  const flash = (text, kind = 'success') => {
    setMsg({ text, kind });
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setMsg({ text: '', kind: '' }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminGetBlogs({ limit: 200 });
      setPosts(d.posts || []);
    } catch (e) {
      flash(e.message || 'Could not load posts', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setView('editor'); };
  const openEdit = (post) => { setEditing(post); setView('editor'); };
  const backToList = () => { setView('list'); setEditing(null); load(); };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?\n\nThis cannot be undone.`)) return;
    try {
      await adminDeleteBlog(post.id);
      flash('Post deleted.');
      load();
    } catch (e) {
      flash(e.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="bm-wrap">
      <div className="bm-header">
        <div>
          <h2 className="bm-title">Blog Manager</h2>
          <p className="bm-subtitle">
            {posts.length} article{posts.length !== 1 ? 's' : ''} ·{' '}
            {posts.filter(p => p.published).length} published ·{' '}
            {posts.filter(p => !p.published).length} draft
          </p>
        </div>
        {view === 'list' && (
          <Button variant="primary" onClick={openNew}>New Post</Button>
        )}
      </div>

      {msg.text && <div className={`bm-msg bm-msg-${msg.kind}`}>{msg.text}</div>}

      {view === 'list' ? (
        loading ? (
          <div className="bm-loading">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="bm-empty">
            <h3>No blog posts yet</h3>
            <p>Write your first article to get the blog started.</p>
            <Button variant="primary" onClick={openNew}>Write First Post</Button>
          </div>
        ) : (
          <div className="bm-table-wrap">
            <table className="bm-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th className="bm-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      {(p.coverImage || p.featuredImage) ? (
                        <img className="bm-thumb" src={imageUrl(p.coverImage || p.featuredImage)} alt="" loading="lazy" />
                      ) : (
                        <span className="bm-thumb bm-thumb-empty">No image</span>
                      )}
                    </td>
                    <td className="bm-cell-title">{p.title}</td>
                    <td>
                      <Badge variant={p.published ? 'success' : 'warning'}>
                        {p.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="bm-cell-date">{fmtDate(p.publishedAt || p.createdAt)}</td>
                    <td className="bm-actions-col">
                      <div className="bm-row-actions">
                        <button className="bm-link-btn" onClick={() => openEdit(p)}>Edit</button>
                        <button className="bm-link-btn bm-danger" onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <PostEditor
          key={editing ? editing.id : 'new'}
          post={editing}
          onDone={backToList}
          onCancel={backToList}
          flash={flash}
        />
      )}
    </div>
  );
}

/* ── PostEditor ──────────────────────────────────────────────── */
function PostEditor({ post, onDone, onCancel, flash }) {
  const isEdit = !!post;
  const [title, setTitle]           = useState(post?.title || '');
  const [slug, setSlug]             = useState(post?.slug || '');
  const [slugTouched, setSlugTouched] = useState(!!post?.slug);
  const [excerpt, setExcerpt]       = useState(post?.excerpt || '');
  const [tags, setTags]             = useState(post?.tags?.map(t => t.name).join(', ') || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || post?.featuredImage || '');
  const [published, setPublished]   = useState(post?.published ?? false);
  const [content, setContent]       = useState(post?.content || '');
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [bodyUploading, setBodyUploading] = useState(false);
  const fileRef = useRef();

  const onTitleChange = (v) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const d = await uploadBlogCoverImage(file);
      setCoverImage(d.url);
      flash('Cover image uploaded.');
    } catch (err) {
      flash(err.message || 'Cover upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  const readTime  = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async (asPublished) => {
    if (uploading || bodyUploading) { flash('Wait for image uploads to finish before saving.', 'error'); return; }
    const text = stripHtml(content);
    if (!title.trim())   { flash('A title is required.', 'error'); return; }
    if (!text)           { flash('The article body cannot be empty.', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim() || `${text.substring(0, 200)}…`,
        content,
        coverImage: coverImage || '',
        featuredImage: coverImage || '', // explicit empty value removes an existing cover
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        categories: isEdit ? (post.categories || []).map(c => c.name) : [],
        published: asPublished,
        status: asPublished ? 'published' : 'draft',
      };
      if (isEdit) {
        await adminUpdateBlog(post.id, payload);
        flash('Post updated.');
      } else {
        await adminCreateBlog(payload);
        flash('Post created.');
      }
      onDone();
    } catch (err) {
      flash(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bm-editor">
      <div className="bm-editor-top">
        <button className="bm-link-btn" onClick={onCancel}>&larr; Back to posts</button>
        <div className="bm-editor-actions">
          <label className="bm-toggle">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
            />
            <span className="bm-toggle-track"><span className="bm-toggle-thumb" /></span>
            <span className="bm-toggle-label">{published ? 'Published' : 'Draft'}</span>
          </label>
          <Button variant="outline" size="sm" disabled={saving} onClick={() => handleSave(false)}>
            {saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => handleSave(true)}>
            {saving ? 'Publishing…' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      <div className="bm-form-grid">
        <div className="bm-field bm-field-full">
          <label className="bm-label" htmlFor="bm-title">Title</label>
          <input
            id="bm-title"
            className="bm-input bm-input-title"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="A clear, compelling headline…"
            maxLength={160}
          />
        </div>

        <div className="bm-field">
          <label className="bm-label" htmlFor="bm-slug">URL slug</label>
          <div className="bm-slug-row">
            <span className="bm-slug-prefix">/blog/</span>
            <input
              id="bm-slug"
              className="bm-input bm-input-mono"
              value={slug}
              onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
              placeholder="auto-generated-from-title"
            />
          </div>
          <p className="bm-hint">Auto-generated from the title. A number is appended if the slug is taken.</p>
        </div>

        <div className="bm-field">
          <label className="bm-label">Cover image</label>
          <div className="bm-cover-row">
            {coverImage ? (
              <img className="bm-cover-preview" src={imageUrl(coverImage)} alt="Cover preview" />
            ) : (
              <div className="bm-cover-empty">No cover yet</div>
            )}
            <div className="bm-cover-actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="bm-file"
                onChange={handleCoverUpload}
                aria-label="Upload cover image"
              />
              {coverImage && (
                <button className="bm-link-btn bm-danger" onClick={() => setCoverImage('')}>
                  Remove
                </button>
              )}
              {uploading && <span className="bm-hint">Uploading…</span>}
            </div>
          </div>
        </div>

        <div className="bm-field bm-field-full">
          <label className="bm-label" htmlFor="bm-excerpt">Excerpt</label>
          <textarea
            id="bm-excerpt"
            className="bm-input bm-textarea"
            rows={2}
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="One or two sentences shown on cards and in search results…"
            maxLength={320}
          />
        </div>

        <div className="bm-field bm-field-full">
          <label className="bm-label" htmlFor="bm-tags">Tags</label>
          <input
            id="bm-tags"
            className="bm-input"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="gut health, fibre, immunity  (comma-separated)"
          />
        </div>

        <div className="bm-field bm-field-full">
          <div className="bm-label-row">
            <label className="bm-label">Article body</label>
            <span className="bm-hint">{wordCount} words · ~{readTime} min read</span>
          </div>
          <RichEditor initial={content} onChange={setContent} flash={flash} onUploadChange={setBodyUploading} />
        </div>
      </div>
    </div>
  );
}
/* ── RichEditor (TipTap) ─────────────────────────────────────── */
function RichEditor({ initial, onChange, flash, onUploadChange }) {
  const [imgPanel, setImgPanel] = useState(true);
  const [imgUrl, setImgUrl]     = useState('');
  const [imageDetails, setImageDetails] = useState({ alt: '', caption: '', layout: 'full', ratio: 'original' });
  const [imgUploading, setImgUploading] = useState(false);
  const imgFileRef = useRef();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: initial || '',
    editorProps: {
      attributes: { class: 'bm-tiptap', 'aria-label': 'Article body editor' },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  if (!editor) return <div className="bm-loading">Loading editor…</div>;

  const btn = (label, active, onClick, title) => (
    <button
      key={label}
      type="button"
      className={`bm-tb-btn${active ? ' is-active' : ''}`}
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      onMouseDown={e => e.preventDefault()}
    >
      {label}
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove):', prev);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const insertImageUrl = () => {
    const url = imgUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !/^\/uploads\//.test(url)) { flash('Use an HTTPS image URL or upload a file.', 'error'); return; }
    editor.chain().focus().setImage({ src: url, ...imageDetails }).run();
    setImgUrl('');
    setImgPanel(false);
  };

  const insertImageFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.length > 10 || files.some(f => f.size > 5 * 1024 * 1024)) { flash('Choose up to 10 images, each under 5 MB.', 'error'); return; }
    setImgUploading(true);
    onUploadChange(true);
    try {
      const d = await uploadBlogContentImages(files);
      const urls = (d.files || []).map(f => f.url).filter(Boolean);
      if (!urls.length) throw new Error('The upload returned no images. Please try again.');
      editor.chain().focus().insertContent(urls.flatMap(src => [
        { type: 'image', attrs: { src, ...imageDetails } },
        { type: 'paragraph' },
      ])).run();
      flash(`${urls.length} image(s) inserted.`);
    } catch (err) {
      flash(err.message || 'Image upload failed', 'error');
    } finally {
      setImgUploading(false);
      onUploadChange(false);
      setImgPanel(false);
      if (imgFileRef.current) imgFileRef.current.value = '';
    }
  };

  return (
    <div className="bm-tiptap-wrap">
      <div className="bm-inline-image-intro"><strong>Images inside your article</strong><p>Click between paragraphs, then upload one or several images below. Each image appears in the article body for readers. Select an image to edit its caption, crop and layout.</p><button type="button" className="bm-upload-btn" onClick={() => setImgPanel(true)}>+ Add images to article</button></div>
      <div className="bm-toolbar" role="toolbar" aria-label="Formatting toolbar">
        {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold')}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic')}
        <span className="bm-tb-sep" />
        {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading 2')}
        {btn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Heading 3')}
        <span className="bm-tb-sep" />
        {btn('Bullets', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet list')}
        {btn('Numbers', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list')}
        {btn('Quote', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Quote')}
        <span className="bm-tb-sep" />
        {btn('Link', editor.isActive('link'), setLink, 'Add or edit link')}
        {btn('Image', editor.isActive('image'), () => { if (editor.isActive('image')) { const a = editor.getAttributes('image'); setImageDetails({ alt: a.alt || '', caption: a.caption || '', layout: a.layout || 'full', ratio: a.ratio || 'original' }); } setImgPanel(v => !v); }, 'Insert or edit image')}
        <span className="bm-tb-sep" />
        {btn('Undo', false, () => editor.chain().focus().undo().run(), 'Undo')}
        {btn('Redo', false, () => editor.chain().focus().redo().run(), 'Redo')}
      </div>

      {imgPanel && (
        <div className="bm-img-panel">
          <label>Alternative text<input className="bm-input" value={imageDetails.alt} onChange={e => setImageDetails(v => ({ ...v, alt: e.target.value }))} placeholder="Describe what the image shows" /></label>
          <label>Caption<input className="bm-input" value={imageDetails.caption} onChange={e => setImageDetails(v => ({ ...v, caption: e.target.value }))} placeholder="Caption or photo credit" /></label>
          <label>Layout<select className="bm-input" value={imageDetails.layout} onChange={e => setImageDetails(v => ({ ...v, layout: e.target.value }))}><option value="full">Full width</option><option value="compact">Centred / compact</option><option value="left">Left / wrap text</option><option value="right">Right / wrap text</option></select></label>
          <label>Image crop<select className="bm-input" value={imageDetails.ratio} onChange={e => setImageDetails(v => ({ ...v, ratio: e.target.value }))}><option value="original">Original proportions</option><option value="landscape">Landscape · 16:9</option><option value="square">Square · 1:1</option><option value="portrait">Portrait · 3:4</option></select></label>
          {editor.isActive('image') && <Button variant="outline" size="sm" onClick={() => { editor.chain().focus().updateAttributes('image', imageDetails).run(); setImgPanel(false); }}>Apply to selected image</Button>}
          <input
            className="bm-input"
            value={imgUrl}
            onChange={e => setImgUrl(e.target.value)}
            placeholder="https://… image URL"
            aria-label="Image URL"
          />
          <Button variant="outline" size="sm" onClick={insertImageUrl} disabled={!imgUrl.trim()}>
            Insert
          </Button>
          <span className="bm-hint">or</span>
          <label className="bm-upload-label">
            <input
              ref={imgFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="bm-file-hidden"
              onChange={insertImageFile}
              aria-label="Upload images"
            />
            <span className="bm-upload-btn">{imgUploading ? 'Uploading…' : 'Upload…'}</span>
          </label>
        </div>
      )}

      <EditorContent editor={editor} />
      <p className="bm-hint">Place your cursor between paragraphs to insert images. Select an existing image and open Image to change its caption, crop or layout. Cropping never changes the original file.</p>
    </div>
  );
}
