import { useSEO } from '../hooks/useSEO.js';
import { useState } from 'react';
import PageHero from '../components/layout/PageHero.jsx';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Card, { CardContent } from '../components/UI/Card.jsx';
import Badge from '../components/UI/Badge.jsx';
import { useReveal } from '../hooks/useReveal';
import '../styles/services.css';

/* ── Services data (realistic, 10+ yr expert copy) ─────────── */
const SERVICES = [
  {
    id: 1,
    icon: '🧬',
    name: '1-on-1 Nutrition Coaching',
    tag: 'Most Popular',
    tagColor: 'primary',
    price: 'PKR 12,000',
    period: '/month',
    duration: 'Ongoing · cancel anytime',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    shortDesc: 'Comprehensive, evidence-based coaching built around your biochemistry, lifestyle, and goals.',
    fullDesc: "After 10+ years working with clients ranging from sedentary office workers to competitive athletes, I've learned that sustainable results come from understanding the individual — not applying a template. In our first 60-minute assessment call, I conduct a full dietary history, lifestyle audit, and goal clarification. Every subsequent week, you receive a revised nutrition protocol based on your actual food logs, biometric data, and energy feedback. This is not a meal plan you follow blindly — it's a clinical coaching relationship.",
    features: [
      '60-min onboarding assessment call',
      'Weekly 30-min video check-ins',
      'Custom nutrition protocol (updated weekly)',
      'Food log review & pattern analysis',
      'Micronutrient gap assessment',
      'Supplement recommendations (evidence-based only)',
      'WhatsApp support between sessions',
      'Monthly biometric progress report',
    ],
    bestFor: 'Individuals serious about lasting body composition change, hormonal health, or managing a chronic condition through diet.',
    result: '87% of coaching clients achieve their primary goal within 12 weeks.',
  },
  {
    id: 2,
    icon: '📋',
    name: 'Personalised Meal Planning',
    tag: 'Great Value',
    tagColor: 'success',
    price: 'PKR 6,000',
    period: '/month',
    duration: '4 weekly plans delivered',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    shortDesc: 'Clinically designed meal plans built around your preferences, allergies, and calorie targets — not copied from the internet.',
    fullDesc: "Every plan I write starts with your TDEE, macro targets, dietary preferences, food intolerances, and budget. I use the same macro-periodisation principles I apply with professional athletes — cycling carbohydrates around your activity days, front-loading protein in the morning to support satiety hormones, and building in strategic flexibility so you can eat out without derailing progress. Each plan comes with a consolidated weekly shopping list, prep instructions, and macro breakdowns per meal.",
    features: [
      '4 fully customised weekly meal plans',
      'Macro breakdown per meal and per day',
      'Consolidated shopping list with quantities',
      'Batch prep instructions',
      'Dietary restriction & allergy accommodation',
      'Restaurant & dining-out guides',
      'Seasonal ingredient substitutions',
      'Email support for questions',
    ],
    bestFor: 'Busy professionals and families who want the precision of clinical nutrition without the time investment of self-planning.',
    result: 'Clients report 40% less decision fatigue around food within the first two weeks.',
  },
  {
    id: 3,
    icon: '🔬',
    name: 'Blood Work & Lab Interpretation',
    tag: 'Diagnostic',
    tagColor: 'warning',
    price: 'PKR 18,000',
    period: ' one-time',
    duration: 'Includes 1 follow-up session',
    image: 'https://images.unsplash.com/photo-1576091160550-112173f31c77?w=600&q=80',
    shortDesc: 'A clinician-level analysis of your blood panel with dietary and lifestyle interventions — not a generic PDF from a lab.',
    fullDesc: "Most people receive their blood results with a two-word verdict: 'normal' or 'borderline.' That tells you nothing. I review your full panel — lipid profile, thyroid markers (TSH, free T3/T4), iron studies, HbA1c, vitamin D, B12, CRP, homocysteine, and more — and identify patterns that indicate subclinical dysfunction before they become diagnosable conditions. You receive a 15–20 page written report with dietary protocols, supplement protocols (with doses and forms), and lifestyle modifications ranked by impact. A 45-minute video debrief is included.",
    features: [
      'Comprehensive panel review (30+ biomarkers)',
      'Optimal vs. lab-reference range comparison',
      '15–20 page personalised written report',
      'Dietary interventions per biomarker',
      'Supplement protocol with exact doses & forms',
      '45-minute video debrief session',
      'Liaison with your GP if requested',
      '30-day follow-up email support',
    ],
    bestFor: 'Anyone experiencing unexplained fatigue, hormonal issues, digestive dysfunction, or wanting to optimise performance beyond "normal" results.',
    result: 'Clients who implement lab-based protocols report energy improvements within 6–8 weeks.',
  },
  {
    id: 4,
    icon: '🏋️',
    name: 'Sports & Performance Nutrition',
    tag: 'For Athletes',
    tagColor: 'info',
    price: 'PKR 15,000',
    period: '/month',
    duration: 'In-season & off-season protocols',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    shortDesc: 'Periodised nutrition protocols aligned to your training blocks — fuelling for performance, recovery, and body composition simultaneously.',
    fullDesc: "Sport nutrition is not simply 'eat more protein.' I design protocols that integrate with your training periodisation — progressive carbohydrate loading during high-volume blocks, strategic energy restriction during low-intensity phases, and precision peri-workout nutrition timed to the type of session. I've worked with cricketers, powerlifters, marathon runners, and martial artists. The approach is always the same: evidence first, food second, supplements last. I will not recommend a supplement that doesn't have at least 3 quality RCTs behind it.",
    features: [
      'Training load × nutrition periodisation',
      'Pre/intra/post-workout nutrition protocols',
      'Competition-day fuelling strategy',
      'Hydration & electrolyte planning',
      'Evidence-based supplement stack (Grade A only)',
      'Body composition target-setting with DEXA analysis guidance',
      'Weekly check-ins during competition block',
      'Travel & away-game nutrition guides',
    ],
    bestFor: 'Competitive athletes, gym enthusiasts training 5+ days per week, and anyone whose performance is directly linked to their dietary strategy.',
    result: '12% average improvement in training-session output reported by clients within 8 weeks.',
  },
  {
    id: 5,
    icon: '🤰',
    name: 'Prenatal & Postnatal Nutrition',
    tag: "Women's Health",
    tagColor: 'secondary',
    price: 'PKR 10,000',
    period: '/month',
    duration: 'Trimester-specific protocols',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    shortDesc: 'Trimester-by-trimester nutrition support that prioritises maternal micronutrient status and foetal development — grounded in obstetric research.',
    fullDesc: "Pregnancy is not the time for generic 'eat for two' advice. Foetal neurodevelopment, skeletal formation, and immune programming are all directly dependent on maternal nutritional status in specific windows. I create trimester-specific protocols addressing the critical nutrients at each stage — choline and DHA in the first trimester, iron and calcium in the second, vitamin K2 and magnesium in the third — while managing common issues like nausea, heartburn, and gestational glucose intolerance. Postnatal protocols focus on breastfeeding support, tissue repair, and postpartum mood regulation.",
    features: [
      'Trimester-specific macro and micronutrient targets',
      'Nausea & food aversion management protocols',
      'Gestational weight gain monitoring',
      'Iron & folate status optimisation',
      'Gestational diabetes dietary management',
      'Breastfeeding nutritional support',
      'Postpartum recovery nutrition plan',
      'Coordination with midwife/OB team',
    ],
    bestFor: 'Women trying to conceive, currently pregnant, or in the postpartum period who want clinical nutritional support beyond general pregnancy advice.',
    result: "All prenatal clients receive care aligned to ACOG and WHO prenatal nutrition guidelines.",
  },
  {
    id: 6,
    icon: '🏢',
    name: 'Corporate Wellness Programmes',
    tag: 'For Teams',
    tagColor: 'neutral',
    price: 'From PKR 95,000',
    period: '/programme',
    duration: 'Minimum 3-month engagement',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    shortDesc: 'Nutrition education and wellness strategy for organisations — reducing sick days, improving focus, and building a performance culture.',
    fullDesc: "Workplace nutrition is a measurable business investment. Research consistently shows that employees with good nutritional habits take 27% fewer sick days and report significantly higher concentration and energy levels. My corporate programmes begin with a team health audit, followed by a bespoke curriculum delivered via monthly live workshops, resource libraries, and optional 1-on-1 coaching credits for team members. I can work on-site or fully remotely. Programmes are designed for HR teams, executive leadership groups, and high-performance team environments.",
    features: [
      'Team nutrition needs assessment',
      'Monthly group workshops (live or remote)',
      'Canteen & catering audit and recommendations',
      'Stress & energy management nutrition guide',
      'Custom resource library for team',
      '1-on-1 coaching credits for individuals',
      'Quarterly biometric screening coordination',
      'ROI reporting & engagement metrics',
    ],
    bestFor: 'HR departments, team leaders, and executives who understand that workforce health directly drives productivity and retention.',
    result: 'Corporate clients report 22% reduction in employee sick days after 6-month programmes.',
  },
];

/* ── Home page preview (4 cards) ─────────────────────────────── */
export const HOME_SERVICES_PREVIEW = SERVICES.slice(0, 4);

/* ═══════════════════════════════════════════════════════════════ */
export default function Services() {
  useSEO({"title":"Nutrition Coaching Services","description":"Explore nutrition coaching, meal planning and wellness services.","noIndex":false});
  const [expanded, setExpanded] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  useReveal();

  return (
    <div>
      {/* Hero */}
      <PageHero image="https://images.unsplash.com/photo-1505576399279-565b52ce32f0?w=1400&q=80"
                overlay="rgba(15,35,25,0.62)">
        <div className="services-hero-content">
          <Badge variant="primary">10+ Years Clinical Experience</Badge>
          <h1 className="services-hero-title">Evidence-Based Nutrition,<br/>Personalised for You</h1>
          <p className="services-hero-subtitle">
            Every service is built on peer-reviewed research, not trends. Whether you're managing a chronic
            condition, optimising athletic performance, or simply wanting to feel better — there is a protocol for you.
          </p>
          <div className="services-hero-ctas">
            <Button variant="primary" size="lg" href="/contact">Book Free Discovery Call</Button>
            <Button variant="outline-white" size="lg" href="#services">View All Services ↓</Button>
          </div>
        </div>
      </PageHero>

      {/* Trust bar */}
      <div className="services-trust-bar">
        {[
          { icon: '🏆', label: '666+ clients served' },
          { icon: '📚', label: '10+ years clinical practice' },
          { icon: '🔬', label: 'Evidence-based protocols only' },
          { icon: '⭐', label: '4.9 / 5 average rating' },
          { icon: '🌍', label: 'Serving clients in 12 countries' },
        ].map(t => (
          <div key={t.label} className="trust-pill">
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <SectionWrapper bg="container" id="services">
        <Container>
          <div className="reveal services-centered-wide">
            <h2 className="section-heading">Choose Your Path to Optimal Health</h2>
            <p className="services-lead">
              No one-size-fits-all solutions. Every programme begins with a discovery call to confirm we're the right fit.
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map((svc, idx) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                expanded={expanded === svc.id}
                onToggle={() => setExpanded(expanded === svc.id ? null : svc.id)}
                delay={idx}
              />
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Process Section */}
      <SectionWrapper bg="default">
        <Container>
          <div className="reveal services-centered-wide">
            <h2 className="section-heading">How We Work Together</h2>
            <p className="services-lead-narrow">
              A straightforward, transparent process from first contact to lasting results.
            </p>
          </div>
          <div className="process-steps reveal reveal-delay-1">
            {[
              { num:'01', title:'Discovery Call',   body:'A free 20-minute call to understand your goals, current challenges, and which service fits. No sales pressure — if we are not a good match, I will tell you.' },
              { num:'02', title:'Assessment',        body:'A thorough dietary history, lifestyle questionnaire, and goal-setting session. For coaching clients, we review any existing lab work or biometric data.' },
              { num:'03', title:'Your Protocol',     body:'A written nutrition protocol delivered within 48 hours of your assessment. Not a template — a document specific to your physiology, schedule, and preferences.' },
              { num:'04', title:'Implementation',    body:'You execute the plan with my ongoing support. Weekly check-ins, food log reviews, and protocol adjustments based on how your body is responding.' },
              { num:'05', title:'Review & Evolve',   body:'Monthly progress reviews with updated targets. Nutrition protocols evolve as you do — what works in week 4 is rarely still optimal in week 16.' },
            ].map((step, i) => (
              <div key={step.num} className={`process-step reveal reveal-delay-${Math.min(i+1,4)}`}>
                <div className="process-num">{step.num}</div>
                <div className={`process-connector${i === 4 ? ' process-connector--last' : ''}`} aria-hidden="true" />
                <div className="process-body">
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Comparison Table */}
      <SectionWrapper bg="container">
        <Container>
          <div className="reveal services-centered-medium">
            <h2 className="section-heading">Service Comparison</h2>
          </div>
          <div className="comparison-table reveal reveal-delay-1">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Coaching</th>
                  <th>Meal Plans</th>
                  <th>Lab Analysis</th>
                  <th>Performance</th>
                  <th>Corporate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Personalised Protocol',    '✓','✓','✓','✓','Group'],
                  ['Weekly Check-ins',         '✓','—','—','✓','Monthly'],
                  ['Blood Work Review',        'Optional','—','✓','Optional','✓'],
                  ['Supplement Protocol',      '✓','—','✓','✓','—'],
                  ['Meal Plans Included',      '✓','✓','Guidance','✓','—'],
                  ['WhatsApp Support',         '✓','Email','30 days','✓','Slack'],
                  ['Suitable From Age',        '16+','All','18+','14+','All'],
                  ['Typical Duration',         'Ongoing','Monthly','One-time','Seasonal','3 months+'],
                ].map(([feat, ...vals]) => (
                  <tr key={feat}>
                    <td className="feature-name">{feat}</td>
                    {vals.map((v, i) => <td key={i}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="reveal services-faq-head">
            <h2 className="section-heading section-heading-on-primary">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid reveal reveal-delay-1">
            {[
              ['How quickly will I see results?',
               'Most clients notice changes in energy and digestion within 2–3 weeks. Body composition changes become measurable at 6–8 weeks with consistent adherence. I will set realistic, evidence-based expectations in your assessment call.'],
              ['Do I need to cook elaborate meals?',
               "No. Sustainable nutrition is built around your actual life. I regularly work with people who have minimal cooking skills or time, and design protocols accordingly — including quick-prep options and smart convenience choices."],
              ["Can you work with my doctor's advice?",
               "Absolutely. I work alongside GPs, endocrinologists, and physiotherapists routinely. With your consent, I can communicate directly with your healthcare team and integrate their recommendations."],
              ['Do you work with vegetarians and vegans?',
               'Yes. I have worked with plant-based clients at every level, including elite vegan athletes. There is no dietary pattern I cannot work with — I simply ensure your protocol addresses the specific nutrient considerations of your chosen approach.'],
              ['What if I do not see results?',
               "First, we investigate why — often the answer is in the data. If after 8 weeks of adherence you are genuinely not progressing, I will review your protocol at no additional charge. My reputation depends on your results."],
              ['Is there a minimum commitment?',
               'No long-term contracts. Month-to-month for ongoing services, but I recommend a minimum of 8 weeks to see meaningful, measurable change. Most clients continue well beyond that.'],
            ].map(([q, a], i) => (
              <FAQItem key={i} question={q} answer={a}
                open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Bottom CTA */}
      <SectionWrapper bg="container">
        <Container>
          <div className="services-cta reveal">
            <h2 className="section-heading">Ready to start?</h2>
            <p className="services-cta-text">
              The discovery call is free, takes 20 minutes, and you leave with clarity on exactly what your body needs — regardless of whether we work together.
            </p>
            <div className="cta-buttons">
              <Button variant="primary" size="lg" href="/contact">Book Your Free Call</Button>
              <Button variant="outline" size="lg" href="/calculators">Try Free Calculators First</Button>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}

/* ── Service Card ────────────────────────────────────────────── */
function ServiceCard({ service: svc, expanded, onToggle, delay }) {
  return (
    <div className={`service-card-detail card-3d reveal reveal-delay-${Math.min(delay+1,4)}`}>
      <div className="svc-img-wrap">
        <img src={svc.image} alt={svc.name} className="svc-img" />
        <div className="svc-img-overlay" />
        <div className="svc-price-badge">
          <span className="svc-price-amount">{svc.price}</span>
          <span className="svc-price-period">{svc.period}</span>
        </div>
      </div>
      <div className="service-detail-content">
        <div className="svc-top">
          <span className={`svc-icon-circle icon-${svc.tagColor}`}>{svc.icon}</span>
          {svc.tag && <Badge variant={svc.tagColor === 'neutral' ? 'default' : svc.tagColor}>{svc.tag}</Badge>}
        </div>
        <h3>{svc.name}</h3>
        <p className="svc-duration">{svc.duration}</p>
        <p className="service-desc">{svc.shortDesc}</p>

        <ul className="service-features">
          {svc.features.slice(0, expanded ? svc.features.length : 4).map((f, i) => (
            <li key={i}><span className="svc-check">✓</span>{f}</li>
          ))}
        </ul>

        {expanded && (
          <div className="svc-expanded">
            <div className="svc-full-desc">
              <h5>In Detail</h5>
              <p>{svc.fullDesc}</p>
            </div>
            <div className="svc-best-for">
              <h5>Best For</h5>
              <p>{svc.bestFor}</p>
            </div>
            <div className="svc-result">
              <span className="svc-result-icon">📊</span>
              <p>{svc.result}</p>
            </div>
          </div>
        )}

        <div className="svc-actions">
          <Button variant="primary" size="sm" href="/contact">Book a Call</Button>
          <button className="svc-more-btn" onClick={onToggle}>
            {expanded ? 'Show less ↑' : 'Full details ↓'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, open, onToggle }) {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onToggle}>
        <span>{question}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
}
