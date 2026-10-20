import { useSEO } from '../hooks/useSEO.js';
import { useState } from 'react';
import PageHero from '../components/layout/PageHero.jsx';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Badge from '../components/UI/Badge.jsx';
import { useReveal } from '../hooks/useReveal';
import '../styles/Subscriptions.css';

/* ── route: /subscriptions  (public) ────────────────────────
   Link in Navbar: "Plans"  or  footer
   ─────────────────────────────────────────────────────────── */

const PLANS = [
  {
    id: 'starter',
    name: 'Foundations',
    tagline: 'Start with the science',
    price: { pkr: 4900, usd: 18 },
    period: 'per month',
    badge: null,
    color: 'teal',
    icon: '🌱',
    description: 'For individuals who want evidence-based tools and guidance without the commitment of full coaching. Everything you need to build a solid nutritional foundation.',
    features: [
      { icon:'📊', text:'Access to all 18 health calculators' },
      { icon:'📋', text:'1 personalised meal plan per month' },
      { icon:'📚', text:'Full nutrition article library' },
      { icon:'🧾', text:'Weekly nutrition tips newsletter' },
      { icon:'💬', text:'Email support within 48 hours' },
      { icon:'🎓', text:'3 recorded educational webinars' },
    ],
    notIncluded: ['1-on-1 coaching calls', 'Custom weekly protocols', 'Lab work analysis'],
    cta: 'Start Foundations',
  },
  {
    id: 'professional',
    name: 'Transformation',
    tagline: 'The full coaching experience',
    price: { pkr: 12000, usd: 44 },
    period: 'per month',
    badge: 'Most Popular',
    color: 'primary',
    icon: '🔬',
    description: 'Our flagship programme. Weekly 1-on-1 coaching, custom evolving protocols, and the full accountability structure that delivers consistent, measurable results.',
    features: [
      { icon:'🧬', text:'Weekly 30-min 1-on-1 video coaching call' },
      { icon:'📋', text:'Custom weekly nutrition protocol (updated every session)' },
      { icon:'📊', text:'Full food log review & pattern analysis' },
      { icon:'💊', text:'Evidence-based supplement recommendations' },
      { icon:'📈', text:'Monthly biometric progress report' },
      { icon:'💬', text:'WhatsApp support Mon–Sat' },
      { icon:'🛒', text:'10% discount on all shop products' },
      { icon:'🎓', text:'Access to all live webinars' },
    ],
    notIncluded: ['Blood work interpretation (add-on available)'],
    cta: 'Start Transformation',
    highlighted: true,
  },
  {
    id: 'elite',
    name: 'Elite Performance',
    tagline: 'For those who demand the best',
    price: { pkr: 24900, usd: 92 },
    period: 'per month',
    badge: 'Premium',
    color: 'dark',
    icon: '🏆',
    description: 'The complete clinical nutrition experience. Daily access, lab analysis, full performance periodisation, and treatment-level precision for individuals with complex health goals or conditions.',
    features: [
      { icon:'📞', text:'Twice-weekly 1-on-1 coaching calls (60 min each)' },
      { icon:'🔬', text:'Quarterly blood panel interpretation included' },
      { icon:'📋', text:'Daily protocol adjustments (reviewed with every food log)' },
      { icon:'💊', text:'Full supplement stack design with dose optimisation' },
      { icon:'🧬', text:'Gut microbiome & hormonal health integration' },
      { icon:'💬', text:'24/7 priority WhatsApp support' },
      { icon:'🛒', text:'20% discount on all shop products' },
      { icon:'🏥', text:'GP/specialist coordination on request' },
      { icon:'🍽️', text:'Family meal plan included at no extra cost' },
    ],
    notIncluded: [],
    cta: 'Apply for Elite',
  },
];

export default function Subscriptions() {
  useSEO({"title":"Nutrition Memberships","description":"Explore DietAndWell membership options and nutrition services.","noIndex":false});
  const [currency, setCurrency] = useState('pkr');
  const [billingCycle, setBillingCycle] = useState('monthly');
  useReveal();

  const getPrice = (plan) => {
    const base = currency === 'pkr' ? plan.price.pkr : plan.price.usd;
    const symbol = currency === 'pkr' ? 'PKR ' : '$';
    if (billingCycle === 'annual') {
      return { display: symbol + Math.round(base * 0.85).toLocaleString(), note: 'Save 15% billed annually' };
    }
    return { display: symbol + base.toLocaleString(), note: 'billed monthly' };
  };

  return (
    <div>
      <PageHero image="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=80"
                overlay="rgba(15,35,25,0.60)">
        <div className="sub-hero-content">
          <Badge variant="primary">Flexible Plans</Badge>
          <h1 className="sub-hero-title">Invest in Your Most<br/>Important Asset</h1>
          <p className="sub-hero-subtitle">
            No contracts, no lock-ins. Cancel or change your plan at any time.
            Every plan includes a 7-day money-back guarantee.
          </p>
        </div>
      </PageHero>

      {/* Billing controls */}
      <SectionWrapper bg="lowest">
        <Container>
          <div className="sub-controls reveal">
            <div className="billing-toggle">
              <button className={`btog-btn ${billingCycle==='monthly' ? 'active':''}`}
                onClick={() => setBillingCycle('monthly')}>Monthly</button>
              <button className={`btog-btn ${billingCycle==='annual' ? 'active':''}`}
                onClick={() => setBillingCycle('annual')}>
                Annual <span className="btog-save">–15%</span>
              </button>
            </div>
            <div className="currency-toggle">
              <button className={`ctog-btn ${currency==='pkr' ? 'active':''}`} onClick={() => setCurrency('pkr')}>PKR</button>
              <button className={`ctog-btn ${currency==='usd' ? 'active':''}`} onClick={() => setCurrency('usd')}>USD</button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="sub-cards-grid">
            {PLANS.map((plan, i) => {
              const price = getPrice(plan);
              return (
                <div key={plan.id}
                  className={`sub-card card-3d reveal reveal-delay-${i+1} ${plan.highlighted ? 'sub-card--featured' : ''}`}>

                  {plan.badge && (
                    <div className="sub-card-badge">{plan.badge}</div>
                  )}

                  {/* Header */}
                  <div className="sub-card-header">
                    <div className="sub-card-icon">{plan.icon}</div>
                    <div>
                      <h3 className="sub-card-name">{plan.name}</h3>
                      <p className="sub-card-tagline">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="sub-card-price">
                    <span className="scp-amount">{price.display}</span>
                    <span className="scp-period">/{plan.period.replace('per ','')}</span>
                  </div>
                  <p className="scp-note">{price.note}</p>

                  {/* Description */}
                  <p className="sub-card-desc">{plan.description}</p>

                  {/* Features */}
                  <ul className="sub-features">
                    {plan.features.map((f,j) => (
                      <li key={j} className="sub-feature">
                        <span className="sf-icon">{f.icon}</span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f,j) => (
                      <li key={`n${j}`} className="sub-feature sub-feature--no">
                        <span className="sf-icon">✗</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    fullWidth
                    href="/contact"
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>
        </Container>
      </SectionWrapper>

      {/* Guarantee banner */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="sub-guarantee reveal">
            <div className="guarantee-icon">🛡️</div>
            <div>
              <h3>7-Day Money-Back Guarantee</h3>
              <p>If you complete your first coaching session and feel it isn't the right fit, we will refund your first month in full. No questions asked.</p>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper bg="lowest">
        <Container>
          <div className="reveal sub-faq-head">
            <h2 className="section-heading">Plan Questions</h2>
          </div>
          <div className="sub-faq-grid reveal reveal-delay-1">
            {[
              ['Can I switch plans?','Yes — upgrade or downgrade at any time. Changes take effect from your next billing cycle.'],
              ['What if I travel frequently?','Coaching sessions are fully remote via video call. Time zones are accommodated.'],
              ['Do you offer student or NHS discounts?','Yes — 20% discount available for verified students and NHS workers. Contact us with proof of status.'],
              ['Is there a setup fee?','No setup fees, ever. Your first charge is your first monthly amount.'],
            ].map(([q,a],i) => (
              <div key={i} className="sub-faq-item">
                <h4>{q}</h4>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}
