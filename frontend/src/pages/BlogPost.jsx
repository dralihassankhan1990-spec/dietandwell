import { useState, useEffect } from 'react';
import { articleHtml } from '../utils/articleHtml.js';
import '../styles/article-images.css';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Badge from '../components/UI/Badge.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useSEO, buildBlogPostSchema } from '../hooks/useSEO.js';
import { getBlogBySlug, getBlogs, imageUrl, subscribeNewsletter } from '../services/api.js';
import '../styles/blog-post.css';

export default function BlogPost() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [post,     setPost]    = useState(null);
  const [related,  setRelated] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [email,    setEmail]   = useState('');
  const [subDone,  setSubDone] = useState(false);
  const [subError, setSubError] = useState('');
  useReveal();

  useSEO(post ? {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage || post.featuredImage ? imageUrl(post.coverImage || post.featuredImage) : undefined,
    type: 'article',
    url: `https://www.dietandwell.com/blog/${post.slug}`,
    schema: buildBlogPostSchema(post),
  } : {
    title: 'Loading Article…',
    noIndex: true,
  });

  useEffect(() => {
    setLoading(true);
    setPost(null);
    getBlogBySlug(slug)
      .then(async data => {
        setPost(data);
        // Related posts: same tag first, then same category as fallback.
        const tagSlug = data.tags?.[0]?.slug;
        const catSlug = data.categories?.[0]?.slug;
        try {
          let rel = [];
          if (tagSlug) {
            const byTag = await getBlogs({ tag: tagSlug, limit: 4 });
            rel = (byTag.posts || []).filter(p => p.slug !== slug).slice(0, 3);
          }
          if (rel.length === 0 && catSlug) {
            const byCat = await getBlogs({ category: catSlug, limit: 4 });
            rel = (byCat.posts || []).filter(p => p.slug !== slug).slice(0, 3);
          }
          setRelated(rel);
        } catch {}
      })
      .catch(() => navigate('/blog'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return (
    <div className="bp-loading">
      <div className="bp-loading-bar" />
    </div>
  );

  if (!post) return null;

  const cover    = imageUrl(post.coverImage || post.featuredImage) || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80';
  const author   = post.author ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'DietAndWell' : 'DietAndWell';
  const date     = (post.publishedAt || post.createdAt)
    ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    : '';
  const readTime = Math.max(1, Math.ceil((((post.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length) || 400) / 200));
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  /* Content comes only from the admin TipTap editor (trusted), so the stored
     HTML renders directly. Legacy plain-text/markdown-ish posts fall back to
     the old renderer. */
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content || '');

  /* Markdown-ish renderer (legacy posts) */
  const renderContent = (text) => {
    if (!text) return null;
    return text.split(/\n{2,}/).map((block, i) => {
      if (/^### /.test(block)) return <h3 key={i}>{block.replace(/^### /, '')}</h3>;
      if (/^## /.test(block))  return <h2 key={i}>{block.replace(/^## /, '')}</h2>;
      if (/^# /.test(block))   return <h2 key={i}>{block.replace(/^# /, '')}</h2>;
      if (/^[-*] /.test(block)) return (
        <ul key={i}>
          {block.split('\n').filter(Boolean).map((l, j) => (
            <li key={j}>{l.replace(/^[-*] /, '').replace(/\*\*(.+?)\*\*/g, '$1')}</li>
          ))}
        </ul>
      );
      if (/^\d+\. /.test(block)) return (
        <ol key={i}>
          {block.split('\n').filter(Boolean).map((l, j) => (
            <li key={j}>{l.replace(/^\d+\. /, '')}</li>
          ))}
        </ol>
      );
      if (block.startsWith('> ')) {
        return <blockquote key={i}>{block.replace(/^> /, '')}</blockquote>;
      }
      /* Inline bold */
      const parts = block.split(/\*\*(.+?)\*\*/g).map((p, j) =>
        j % 2 === 1 ? <strong key={j}>{p}</strong> : p
      );
      return <p key={i}>{parts}</p>;
    });
  };

  return (
    <article itemScope itemType="https://schema.org/Article">
      {/* Hidden SEO meta for schema */}
      <meta itemProp="author" content={author} />
      <meta itemProp="datePublished" content={post.publishedAt || post.createdAt} />
      <meta itemProp="headline" content={post.title} />

      {/* ── Cover Hero ── */}
      <div className="bp-hero" style={{ backgroundImage: `url(${cover})` }}>
        <div className="bp-hero-overlay" />
        <div className="bp-hero-content">
          {post.categories?.slice(0,2).map(c => (
            <Badge key={c.id} variant="primary" className="bp-cat-badge">{c.name}</Badge>
          ))}
          <h1 className="bp-hero-title" itemProp="name">{post.title}</h1>
          <div className="bp-hero-meta">
            <div className="bp-hero-author">
              <div className="bp-avatar">{author.charAt(0)}</div>
              <span>By {author}</span>
            </div>
            {date && <time itemProp="datePublished">{date}</time>}
            <span>·</span>
            <span>{readTime} min read</span>
            {post.views > 0 && <><span>·</span><span>{post.views} views</span></>}
          </div>
        </div>
      </div>

      {/* ── Article Content ── */}
      <SectionWrapper bg="lowest">
        <Container narrow>
          {post.excerpt && <p className="bp-excerpt reveal">{post.excerpt}</p>}

          {post.tags?.length > 0 && (
            <div className="bp-tags reveal">
              {post.tags.map(t => <span key={t.id} className="bp-tag">{t.name}</span>)}
            </div>
          )}

          {isHtml ? (
            <div className="blog-content bp-content" itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: articleHtml(post.content) }} />
          ) : (
            <div className="bp-content reveal reveal-delay-1" itemProp="articleBody">
              {renderContent(post.content)}
            </div>
          )}

          {/* Multiple content images support */}
          {post.contentImages?.filter(Boolean).length > 0 && (
            <div className="bp-content-images reveal reveal-delay-2">
              {post.contentImages.filter(Boolean).map((img, i) => (
                <figure key={i} className="bp-content-figure">
                  <img src={imageUrl(img)} alt={`${post.title} — image ${i + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          )}

          {/* Share + CTA */}
          <div className="bp-bottom reveal reveal-delay-3">
            <div className="bp-share">
              <span className="bp-share-label">Share</span>
              <div className="bp-share-btns">
                <a className="share-btn fb" target="_blank" rel="noreferrer"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  aria-label="Share on Facebook">f</a>
                <a className="share-btn tw" target="_blank" rel="noreferrer"
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  aria-label="Share on Twitter">𝕏</a>
                <a className="share-btn li" target="_blank" rel="noreferrer"
                  href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(shareUrl)}`}
                  aria-label="Share on LinkedIn">in</a>
                <button className="share-btn em"
                  onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => alert('Link copied!'))}
                  aria-label="Copy link">Copy</button>
              </div>
            </div>
            <Link to="/contact"><Button variant="primary" size="lg">Work With Me →</Button></Link>
          </div>

          {/* Author box */}
          <div className="bp-author-box reveal reveal-delay-4">
            <div className="bp-author-avatar">{author.charAt(0)}</div>
            <div className="bp-author-info">
              <h4 itemProp="author">{author}</h4>
              <p>Registered nutritionist with 10+ years of clinical practice. I write evidence-based articles on metabolism, body composition, and performance nutrition.</p>
              <Link to="/services" className="bp-author-link">View My Services →</Link>
            </div>
          </div>

          <div className="bp-back">
            <Link to="/blog" className="bp-back-link">← Back to All Articles</Link>
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Related Posts ── */}
      {related.length > 0 && (
        <SectionWrapper bg="container">
          <Container>
            <h3 className="bp-related-heading reveal">You Might Also Like</h3>
            <div className="bp-related-grid reveal reveal-delay-1">
              {related.map(rp => {
                const rImg = imageUrl(rp.coverImage || rp.featuredImage) || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80';
                const rDate = (rp.publishedAt || rp.createdAt)
                  ? new Date(rp.publishedAt || rp.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' })
                  : '';
                return (
                  <Link key={rp.id} to={`/blog/${rp.slug}`} className="bp-related-card card-3d">
                    <img src={rImg} alt={rp.title} loading="lazy" />
                    <div className="bp-related-body">
                      <h4>{rp.title}</h4>
                      <p>{rp.excerpt}</p>
                      {rDate && <time>{rDate}</time>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </SectionWrapper>
      )}

      {/* ── Newsletter ── */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="bp-newsletter reveal">
            <h2>Never Miss an Article</h2>
            <p>Get evidence-based nutrition insights delivered every Thursday.</p>
            {subDone ? (
              <p className="sub-success">You&apos;re subscribed!</p>
            ) : (
              <>
              <form className="newsletter-form" onSubmit={async e => {
                e.preventDefault(); setSubError('');
                try { await subscribeNewsletter(email); setSubDone(true); }
                catch (err) { setSubError(err.message); }
              }}>
                <input type="email" required placeholder="Your email" value={email}
                  onChange={e => setEmail(e.target.value)} className="newsletter-input"
                  aria-label="Email address" />
                <Button variant="accent" type="submit">Subscribe</Button>
              </form>
              {subError && <p className="sub-error">{subError}</p>}
              </>
            )}
          </div>
        </Container>
      </SectionWrapper>
    </article>
  );
}
