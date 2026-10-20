import { useState, useEffect, lazy, Suspense } from 'react';
import { CalcIcon, CALC_ICON_NAMES } from '../components/calculators/CalcUI.jsx';
import { Link } from 'react-router-dom';
import PageHero from '../components/layout/PageHero.jsx';
import Carousel from '../components/Carousel.jsx';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Card, { CardContent } from '../components/UI/Card.jsx';
import Badge from '../components/UI/Badge.jsx';
import { useReveal, useCountUp } from '../hooks/useReveal.js';
import { useSEO, SEO } from '../hooks/useSEO.js';
import { getBlogs, imageUrl, subscribeNewsletter } from '../services/api.js';
/* Three.js is heavy (~600KB) — lazy-load so it doesn't bloat the first paint. */
const Hero3D = lazy(() => import('../components/three/PhotographicScene.jsx'));
const NutritionJourney3D = lazy(() => import('../components/three/NutritionJourney.jsx'));
import '../styles/home.css';
import '../styles/nutrition-experience.css';

/* ── Services — EXACT match with Services.jsx SERVICES array ── */
const HOME_SERVICES = [
  {
    id: 1, icon: '🧬',
    name: '1-on-1 Nutrition Coaching',
    price: 'PKR 12,000/month',
    shortDesc: 'Comprehensive, evidence-based coaching built around your biochemistry, lifestyle, and goals.',
    features: ['Weekly 1-on-1 video coaching', 'Custom weekly nutrition protocol', 'WhatsApp support Mon–Sat'],
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    tag: 'Most Popular',
  },
  {
    id: 2, icon: '📋',
    name: 'Personalised Meal Planning',
    price: 'PKR 6,000/month',
    shortDesc: 'Clinically designed meal plans built around your preferences, allergies, and calorie targets.',
    features: ['4 weekly meal plans', 'Shopping lists & prep guides', 'Dietary restriction accommodation'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    tag: 'Great Value',
  },
  {
    id: 3, icon: '🔬',
    name: 'Blood Work & Lab Interpretation',
    price: 'PKR 18,000 one-time',
    shortDesc: 'A clinician-level analysis of your blood panel with targeted dietary and lifestyle interventions.',
    features: ['30+ biomarker review', '15–20 page written report', '45-min video debrief'],
    image: 'https://images.unsplash.com/photo-1576091160550-112173f31c77?w=600&q=80',
    tag: 'Diagnostic',
  },
  {
    id: 4, icon: '🏋️',
    name: 'Sports & Performance Nutrition',
    price: 'PKR 15,000/month',
    shortDesc: 'Periodised nutrition protocols aligned to your training blocks — fuel performance and recovery.',
    features: ['Training-load periodisation', 'Pre/intra/post-workout nutrition', 'Competition-day strategy'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    tag: 'For Athletes',
  },
];

const NUTRITION_ITEMS = [
  { name: 'Chia Seeds',    img: 'https://plus.unsplash.com/premium_photo-1726729281152-4d3d387baf87?q=80&w=880&auto=format&fit=crop',  details: 'High in fibre, omega-3s & protein. Great for digestion and satiety.' },
  { name: 'Almonds',       img: 'https://images.unsplash.com/photo-1626196340006-f89d9bedf1c6?q=80&w=1074&auto=format&fit=crop',        details: 'Rich in healthy fats, vitamin E, and magnesium. Supports heart health.' },
  { name: 'Greek Yogurt',  img: 'https://plus.unsplash.com/premium_photo-1668615553418-36ecec70eccb?q=80&w=687&auto=format&fit=crop',   details: 'High-protein dairy with probiotics for gut health and muscle recovery.' },
  { name: 'Blueberries',   img: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=1169&auto=format&fit=crop',        details: 'Antioxidant-packed berries supporting cognitive function & inflammation control.' },
  { name: 'Spinach',       img: 'https://images.unsplash.com/photo-1580910365203-91ea9115a319?q=80&w=1170&auto=format&fit=crop',        details: 'Leafy green packed with iron, calcium, and phytonutrients for cellular health.' },
  { name: 'Salmon',        img: 'https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?q=80&w=1332&auto=format&fit=crop',        details: 'Omega-3 rich fatty fish that supports cardiovascular and brain health.' },
];

export default function Home() {
  const [blogs,   setBlogs]   = useState([]);
  const [flipped, setFlipped] = useState({});
  const [email,   setEmail]   = useState('');
  const [subDone, setSubDone] = useState(false);

  useSEO(SEO.home);
  useReveal();
  useCountUp(800);

  useEffect(() => {
    getBlogs({ limit: 3 }).then(d => setBlogs(d.posts || [])).catch(() => {});
  }, []);

  const toggleFlip = (i) => setFlipped(p => ({ ...p, [i]: !p[i] }));

  const [subError, setSubError] = useState('');
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubError('');
    try {
      await subscribeNewsletter(email);
      setSubDone(true);
    } catch (err) {
      setSubError(err.message);
    }
  };

  return (
    <div className="nutrition-home">

      {/* ── Hero Section ── */}
      <div className="nutrition-hero-track" data-nutrition-track>
      <SectionWrapper bg="primary" className="nutrition-hero-pin">
        <Container>
          <div className="hero-overlap">
            <div className="hero-left">
              <Badge variant="primary" className="hero-tag">Metabolic Intelligence</Badge>
              <h1 className="hero-title">Precision Nutrition<br /><em>Perfected.</em></h1>
              <p className="hero-subtitle">
                Transform your health with evidence-based nutrition coaching, personalised meal plans,
                and precision science. Join 666+ happy clients who've achieved lasting results.
              </p>
              <div className="hero-ctas">
                <Button variant="primary" size="lg" to="/contact">Book Free Call</Button>
                <Button variant="outline-white" size="lg" to="/services">Explore Services</Button>
              </div>
              <div className="hero-trust-row">
                {['666+ Clients Served','10+ Years Experience','Evidence-Based Only','PKR 6,000/mo from'].map(t => (
                  <div key={t} className="hero-trust-item">
                    <span className="hero-trust-dot" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-right" aria-hidden="true">
              <div className="hero-image-container">
                <Suspense fallback={<div className="hero-3d-wrap"><div className="hero-orb" aria-hidden="true" /></div>}>
                  <Hero3D />
                </Suspense>
                <div className="hero-badge-top">
                  <span className="badge-emoji">🥗</span>
                  <span className="badge-label">Nutrient Dense</span>
                  <span className="badge-value">94%</span>
                </div>
                <div className="hero-badge-bottom">
                  <div className="badge-icon">⚡</div>
                  <div>
                    <span className="badge-label">Energy Boost</span>
                    <span className="badge-value">+120 kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </SectionWrapper>
      </div>
      <Carousel />

      {/* ── Free Health Calculators ── */}
      <SectionWrapper bg="container" id="calculators">
        <Container>
          <div className="reveal home-centered-tight">
            <Badge variant="secondary" className="section-tag">Free Tools</Badge>
            <h2 className="section-heading">Your Health, Quantified</h2>
            <p className="home-section-lead">
              Science-backed calculators used by registered dietitians. No sign-up needed.
            </p>
          </div>
          <div className="calc-grid reveal reveal-delay-1">
            {[
              { id:'bmi',          icon:'📏', name:'BMI Calculator',         desc:'Body Mass Index' },
              { id:'tdee',         icon:'⚡', name:'Calorie (TDEE)',          desc:'Daily energy needs' },
              { id:'body_fat',     icon:'🔬', name:'Body Fat %',              desc:'Navy method estimate' },
              { id:'macros',       icon:'🧬', name:'Macro Calculator',        desc:'Protein, carbs & fats' },
              { id:'water',        icon:'💧', name:'Water Intake',            desc:'Daily hydration target' },
              { id:'ideal_weight', icon:'🎯', name:'Ideal Weight',            desc:'Devine formula' },
            ].map(calc => (
              <Link key={calc.id} to="/calculators" className="home-calc-card card-3d" state={{ openCalc: calc.id }}>
                  <div className="calc-icon"><CalcIcon name={CALC_ICON_NAMES[calc.id]} size={36} /></div>
                <h4>{calc.name}</h4>
                <p>{calc.desc}</p>
                <span className="calc-cta">Calculate →</span>
              </Link>
            ))}
          </div>
          <div className="text-center-cta reveal reveal-delay-2">
            <Button variant="primary" to="/calculators">View All 32 Health Calculators</Button>
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Nutrition Journey — scroll-driven 3D (Round 1) ── */}
      <Suspense fallback={null}>
        <NutritionJourney3D />
      </Suspense>

      {/* ── Nutrition Powerhouses ── */}
      <SectionWrapper bg="default">
        <Container>
          <div className="reveal">
            <h2 className="section-heading">Nutrition Powerhouses</h2>
            <p className="section-sub">Foods we recommend — backed by clinical evidence.</p>
          </div>
          <div className="nutrition-grid reveal reveal-delay-1">
            {NUTRITION_ITEMS.map((item, idx) => (
              <div key={idx} className="nutrition-item card-3d">
                <div
                  className={`flip-card ${flipped[idx] ? 'is-flipped' : ''}`}
                  onClick={() => toggleFlip(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Learn about ${item.name}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleFlip(idx); }}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <img src={item.img} alt={item.name} className="flip-img" loading="lazy" />
                      <div className="flip-front-body"><h4>{item.name}</h4></div>
                    </div>
                    <div className="flip-card-back">
                      <div className="flip-back-body">
                        <h4>{item.name}</h4>
                        <p className="flip-detail">{item.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Blog Preview — fetched from API ── */}
      <SectionWrapper bg="container">
        <Container>
          <div className="reveal home-blog-head">
            <div>
              <Badge variant="secondary">Evidence-Based Articles</Badge>
              <h2 className="section-heading home-blog-heading">
                Learn About Healthy Nutrition
              </h2>
            </div>
            <Link to="/blog" className="view-all-link">View All Articles →</Link>
          </div>

          {blogs.length > 0 ? (
            <div className="blog-preview reveal reveal-delay-1">
              {/* Featured post */}
              <Link to={`/blog/${blogs[0].slug}`} className="blog-featured-link">
                <div className="blog-featured-card card-3d">
                  <div className="blog-featured-img-wrap">
                    <img
                      src={imageUrl(blogs[0].coverImage || blogs[0].featuredImage) || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'}
                      alt={blogs[0].title}
                      loading="lazy"
                    />
                  </div>
                  <div className="blog-featured-body">
                    <div className="blog-cat">{blogs[0].categories?.[0]?.name || 'Nutrition'}</div>
                    <h3>{blogs[0].title}</h3>
                    <p>{blogs[0].excerpt}</p>
                    <span className="read-more">Read Article →</span>
                  </div>
                </div>
              </Link>

              {/* Side posts */}
              <div className="blog-side">
                {blogs.slice(1).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="blog-side-link">
                    <div className="blog-side-card card-3d">
                      <img
                        src={imageUrl(post.coverImage || post.featuredImage) || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80'}
                        alt={post.title}
                        loading="lazy"
                      />
                      <div>
                        <div className="blog-cat-sm">{post.categories?.[0]?.name || 'Health'}</div>
                        <h4>{post.title}</h4>
                        <p className="text-sm">{post.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Fallback if no blogs yet */
            <div className="blog-preview reveal reveal-delay-1">
              {[
                { img:'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80', title:'The Complete Guide to Macro Tracking', cat:'Nutrition', excerpt:'Learn to optimise your protein, carbs and fats for maximum results.', slug:'complete-guide-macro-tracking' },
                { img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80', title:'5 Supplements Worth Taking',            cat:'Supplements', excerpt:'Science-backed supplements for health and performance.', slug:'5-supplements-worth-taking' },
                { img:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&q=80', title:'Hydration: The Foundation of Wellness',  cat:'Health',      excerpt:'Why water is your secret weapon for better health.',   slug:'hydration-foundation-wellness' },
              ].map((post, i) => i === 0 ? (
                <Link key={post.slug} to="/blog" className="blog-featured-link">
                  <div className="blog-featured-card card-3d">
                    <div className="blog-featured-img-wrap"><img src={post.img} alt={post.title} loading="lazy" /></div>
                    <div className="blog-featured-body">
                      <div className="blog-cat">{post.cat}</div>
                      <h3>{post.title}</h3><p>{post.excerpt}</p>
                      <span className="read-more">Read Article →</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link key={post.slug} to="/blog" className="blog-side-link" >
                  <div className="blog-side-card card-3d">
                    <img src={post.img} alt={post.title} loading="lazy" />
                    <div><div className="blog-cat-sm">{post.cat}</div><h4>{post.title}</h4><p className="text-sm">{post.excerpt}</p></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </SectionWrapper>

      {/* ── Services (MATCHED to Services page) ── */}
      <SectionWrapper bg="default">
        <Container>
          <div className="reveal home-centered-medium">
            <Badge variant="secondary">10+ Years Clinical Experience</Badge>
            <h2 className="section-heading">Our Wellness Services</h2>
            <p className="home-section-lead home-section-lead-spaced">
              Every service is evidence-based, personalised, and measurable. No templates, no guesswork.
            </p>
          </div>
          <div className="home-services-grid reveal reveal-delay-1">
            {HOME_SERVICES.map(svc => (
              <Link key={svc.id} to="/services" className="home-svc-card card-3d">
                <div className="home-svc-img-wrap">
                  <img src={svc.image} alt={svc.name} className="home-svc-img" loading="lazy" />
                  <div className="home-svc-overlay" />
                  <div className="home-svc-tag">{svc.tag}</div>
                  <div className="home-svc-price">{svc.price}</div>
                </div>
                <div className="home-svc-body">
                  <span className="home-svc-icon">{svc.icon}</span>
                  <h4>{svc.name}</h4>
                  <p>{svc.shortDesc}</p>
                  <ul className="home-svc-features">
                    {svc.features.map(f => <li key={f}><span>✓</span>{f}</li>)}
                  </ul>
                  <span className="home-svc-cta">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center-cta reveal reveal-delay-2">
            <Button variant="primary" size="lg" to="/services">View All 6 Services</Button>
            <Button variant="ghost" to="/contact" className="home-cta-spaced">Book Free Discovery Call →</Button>
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Stats ── */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="stats-grid">
            {[
              { value:'666', suffix:'+', label:'Happy Clients' },
              { value:'13',  suffix:'%', label:'Avg Fat Loss' },
              { value:'10',  suffix:'+', label:'Years Experience' },
              { value:'26',  suffix:'+', label:'Articles Published' },
            ].map((s, idx) => (
              <div key={s.label} className={`stat-item reveal reveal-delay-${idx+1}`}>
                <span className="count-up-value stat-number" data-value={s.value}>0</span>
                <span className="stat-suffix">{s.suffix}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Testimonials ── */}
      <SectionWrapper bg="container">
        <Container>
          <div className="reveal home-centered-wide">
            <h2 className="section-heading">What Clients Say</h2>
          </div>
          <div className="testimonial-grid reveal reveal-delay-1">
            {[
              { initials:'JD', quote:'Lost 15kg and finally understood what my body needed. Worth every rupee.', name:'John D.', role:'Weight Loss Client', rating:5 },
              { initials:'SJ', quote:'My blood work completely transformed after 3 months of coaching. The lab interpretation was eye-opening.', name:'Sarah J.', role:'Lab Analysis Client', rating:5 },
              { initials:'AK', quote:'As a cricketer, I needed sports-specific nutrition. The performance protocol improved my endurance noticeably.', name:'Ahmed K.', role:'Athlete Client', rating:5 },
            ].map((t, idx) => (
              <div key={idx} className="testimonial-card card-3d">
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Newsletter ── */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="newsletter-content reveal">
            <h2 className="newsletter-heading">Get Weekly Wellness Tips</h2>
            <p className="newsletter-subheading">Evidence-based nutrition advice, every Thursday. No spam.</p>
            {subDone ? (
              <p className="sub-success">You're subscribed! 🎉 First email arrives Thursday.</p>
            ) : (
              <>
              {subError && <p className="sub-error">{subError}</p>}
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email" required placeholder="Enter your email"
                  className="newsletter-input" value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button variant="accent" type="submit">Subscribe</Button>
              </form>
              </>
            )}
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Final CTA ── */}
      <SectionWrapper bg="default">
        <Container>
          <div className="reveal text-center">
            <h2 className="section-heading">Ready to Transform Your Health?</h2>
            <p className="home-section-lead home-section-lead-wide">
              The discovery call is free, takes 20 minutes, and leaves you with clarity on exactly what your body needs.
            </p>
            <div className="final-cta-buttons">
              <Button variant="primary" size="lg" to="/contact">Book Free Consultation</Button>
              <Button variant="outline" size="lg" to="/calculators">Try Free Tools First</Button>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
