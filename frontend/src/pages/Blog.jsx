import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Badge from '../components/UI/Badge.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useSEO, SEO } from '../hooks/useSEO.js';
import { getBlogs, getBlogTags, imageUrl, subscribeNewsletter } from '../services/api.js';
import '../styles/blog.css';
import '../styles/editorial-polish.css';
import '../styles/blog-sidebar.css';
import DepthBackdrop from '../components/layout/DepthBackdrop.jsx';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80';

const stripTags = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const readMinutes = (content) =>
  Math.max(1, Math.ceil((stripTags(content).split(' ').filter(Boolean).length || 400) / 200));

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts,      setPosts]      = useState([]);
  const [tags,       setTags]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [email,      setEmail]      = useState('');
  const [subDone,    setSubDone]    = useState(false);
  const [subError,   setSubError]   = useState('');

  const page   = parseInt(searchParams.get('page')   || '1');
  const search = searchParams.get('search') || '';
  const tag    = searchParams.get('tag')    || '';

  useSEO({
    ...SEO.blog,
    title: page > 1 ? `${SEO.blog.title} — Page ${page}` : SEO.blog.title,
    noIndex: !!search || !!tag,
    url: `${import.meta.env.VITE_SITE_URL || 'https://www.dietandwell.com'}/blog${page>1?`?page=${page}`:''}`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'DietAndWell Nutrition Blog',
      description: SEO.blog.description,
      url: 'https://www.dietandwell.com/blog',
      publisher: { '@type': 'Organization', name: 'DietAndWell', url: 'https://www.dietandwell.com' },
    },
  });
  useReveal();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlogs({ page, limit: 9, search, tag });
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setError('Could not load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, tag]);

  useEffect(() => {
    getBlogTags().then(t => setTags(t || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ── Hero: layered gradient + /images/blog-hero.jpg with a gradient
             fallback underneath — the gradient paints even if the photo
             layer is absent. ── */}
      <header className="blog-hero-new">
        <DepthBackdrop image="/images/blog-hero.jpg" />
        <Container>
          <div className="blog-hero-new-content reveal">
            <Badge variant="primary">Wellness Blog</Badge>
            <h1 className="blog-hero-new-title">Nutrition Insights &amp; Health Tips</h1>
            <p className="blog-hero-new-subtitle">
              Evidence-based articles on nutrition, metabolism, gut health, and performance —
              written by a certified nutritionist with 10+ years of clinical practice.
            </p>
          </div>
        </Container>
      </header>

      <SectionWrapper bg="lowest">
        <Container>
          <div className="blog-controls reveal">
            <form className="blog-search"
              onSubmit={e => { e.preventDefault(); setParam('search', e.target.s.value); }}>
              <input name="s" defaultValue={search} placeholder="Search articles…"
                className="blog-search-input" aria-label="Search blog articles" />
              <button type="submit" className="blog-search-btn" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
              </button>
            </form>
            <p className="blog-total">{total} article{total !== 1 ? 's' : ''}</p>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper bg="container">
        <Container>
          <div className="blog-editorial-layout"><aside className="blog-topic-sidebar"><p className="blog-topic-eyebrow">EXPLORE THE JOURNAL</p><h2>Browse by topic</h2><p>Find ideas for your everyday wellbeing.</p>
            <div className="blog-filters" role="group" aria-label="Filter by tag">
              <button className={`filter-chip ${!tag ? 'active' : ''}`}
                onClick={() => setParam('tag', '')}>All</button>
              {tags.map(t => (
                <button key={t.id}
                  className={`filter-chip ${tag === t.slug ? 'active' : ''}`}
                  onClick={() => setParam('tag', t.slug)}>
                  {t.name}
                </button>
              ))}
            </div>
</aside><div className="blog-results">
          {error && (
            <div className="blog-error reveal">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchPosts}>Retry</Button>
            </div>
          )}

          {loading ? (
            <div className="blog-grid">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="no-posts reveal">
              <p>No articles found{search ? ` for "${search}"` : ''}{tag ? ' with this tag' : ''}.</p>
              <Button variant="primary" onClick={() => setSearchParams({})}>Clear Filters</Button>
            </div>
          ) : (
            <div className="blog-grid reveal reveal-delay-1">
              {posts.map(post => <BlogCard key={post.id} post={post} />)}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <nav className="blog-pagination reveal" aria-label="Blog pagination">
              <button className="page-btn" disabled={page <= 1}
                onClick={() => goPage(page - 1)} aria-label="Previous page">← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => goPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >{p}</button>
              ))}
              <button className="page-btn" disabled={page >= totalPages}
                onClick={() => goPage(page + 1)} aria-label="Next page">Next →</button>
            </nav>
          )}
          </div></div>
        </Container>
      </SectionWrapper>

      <SectionWrapper bg="primary">
        <Container>
          <div className="blog-newsletter reveal">
            <h2>Get Weekly Wellness Tips</h2>
            <p>Evidence-based nutrition advice, delivered to your inbox every Thursday.</p>
            {subDone ? (
              <p className="sub-success">You&apos;re subscribed!</p>
            ) : (
              <>
              <form className="newsletter-form" onSubmit={async e => {
                e.preventDefault(); setSubError('');
                try { await subscribeNewsletter(email); setSubDone(true); }
                catch (err) { setSubError(err.message); }
              }}>
                <input type="email" required placeholder="Your email address"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="newsletter-input" aria-label="Email address" />
                <Button variant="accent" type="submit">Subscribe</Button>
              </form>
              {subError && <p className="sub-error">{subError}</p>}
              </>
            )}
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}

function BlogCard({ post }) {
  const cover    = imageUrl(post.coverImage || post.featuredImage) || FALLBACK_COVER;
  const category = post.categories?.[0]?.name || 'Nutrition';
  const author   = post.author ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'DietAndWell' : 'DietAndWell';
  const date     = (post.publishedAt || post.createdAt)
    ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : '';

  return (
    <Link to={`/blog/${post.slug}`} className="blog-card-link">
      <article className="blog-card card-3d" itemScope itemType="https://schema.org/Article">
        <div className="blog-card-img-wrap">
          <img src={cover} alt={post.title} className="blog-card-img" loading="lazy"
            itemProp="image" />
          <div className="blog-card-img-overlay" />
          <span className="blog-card-category" itemProp="articleSection">{category}</span>
        </div>
        <div className="blog-card-body">
          <h3 className="blog-card-title" itemProp="headline">{post.title}</h3>
          <p className="blog-card-excerpt" itemProp="description">{post.excerpt}</p>
          {post.tags?.length > 0 && (
            <div className="blog-card-tags">
              {post.tags.slice(0, 3).map(t => (
                <span key={t.id} className="blog-card-tag">{t.name}</span>
              ))}
            </div>
          )}
          <div className="blog-card-footer">
            <div className="blog-card-author" itemProp="author">
              <div className="author-avatar">{author.charAt(0)}</div>
              <span>{author}</span>
            </div>
            <div className="blog-card-meta">
              {date && <time itemProp="datePublished" dateTime={post.publishedAt || post.createdAt}>{date}</time>}
              <span>·</span>
              <span>{readMinutes(post.content)} min read</span>
              {post.views > 0 && <><span>·</span><span>{post.views} views</span></>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="blog-card-skeleton">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line xshort" />
    </div>
  );
}
