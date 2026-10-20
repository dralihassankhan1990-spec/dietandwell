import { useSEO } from '../hooks/useSEO.js';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import Badge from '../components/UI/Badge.jsx';
import VitalityRing from '../components/data-viz/VitalityRing';
import MacroDoughnut from '../components/data-viz/MacroDoughnut.jsx';
import {
  CalcIcon, CalcHeader, FormGroup, SelectField, UnitToggle,
  ResultCard, ResultRow, SaveResult, CalcDisclaimer, CALC_ICON_NAMES,
} from '../components/calculators/CalcUI.jsx';
import { getNewCalcComponent } from '../components/calculators/NewCalculators.jsx';
import Calculators3DBg from '../components/three/Calculators3DBg.jsx';
import {
  calculateBMI, getBMICategory,
  calculateBodyFat,
  calculateIdealWeight,
  calculateWaistToHeight,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateMacros,
  calculateProteinIntake,
  calculateWaterIntake,
  calculateTargetHeartRate,
  calculateVO2Max,
  calculateCholesterolRatio,
  calculateFertilityWindow,
  calculatePregnancyWeightGain,
  calculateChildBMI,
  calculateAlcoholUnits,
  calculatePediatricDosage,
} from '../utils/calculators';
import { useReveal } from '../hooks/useReveal';
import '../styles/calculators.css';

/* ── CALCULATOR REGISTRY — Round 1: 8 categories, 32 calculators ── */
const CATEGORIES = [
  {
    id: 'body', label: 'Body Composition', icon: 'muscle', accent: '#0A6640',
    calculators: [
      { id: 'bmi',          label: 'BMI',              desc: 'Body Mass Index' },
      { id: 'body_fat',     label: 'Body Fat %',       desc: 'US Navy method' },
      { id: 'lean_mass',    label: 'Lean Body Mass',   desc: 'Boer formula' },
      { id: 'ideal_weight', label: 'Ideal Weight',     desc: 'Devine formula' },
      { id: 'waist_hip',    label: 'Waist-Hip Ratio',  desc: 'WHO risk cutoffs' },
      { id: 'waist_height', label: 'Waist-to-Height',  desc: 'Cardiometabolic risk' },
    ],
  },
  {
    id: 'energy', label: 'Energy & Macros', icon: 'flame', accent: '#B45309',
    calculators: [
      { id: 'bmr',            label: 'BMR',              desc: 'Mifflin-St Jeor' },
      { id: 'tdee',           label: 'TDEE / Calories',  desc: 'Total daily energy' },
      { id: 'calorie_target', label: 'Calorie Target',   desc: 'Goal-based targets' },
      { id: 'macros',         label: 'Macronutrients',   desc: 'Protein, carbs, fats' },
      { id: 'protein',        label: 'Protein Needs',    desc: 'Daily protein range' },
      { id: 'fiber',          label: 'Fiber Needs',      desc: 'IOM guidance' },
    ],
  },
  {
    id: 'clinical', label: 'Clinical Nutrition', icon: 'clip', accent: '#1D4ED8',
    calculators: [
      { id: 'must_score',        label: 'MUST Score',           desc: 'Malnutrition screening' },
      { id: 'corrected_calcium',label: 'Corrected Calcium',    desc: "Payne's formula" },
      { id: 'iron',             label: 'Iron Needs',           desc: 'IOM daily RDA' },
      { id: 'breastfeeding',    label: 'Breastfeeding Calories', desc: 'IOM lactation energy' },
      { id: 'cholesterol',      label: 'Cholesterol Ratio',    desc: 'Lipid risk ratios' },
    ],
  },
  {
    id: 'hydration', label: 'Hydration', icon: 'drop', accent: '#0E7490',
    calculators: [
      { id: 'water',       label: 'Water Intake',  desc: 'Daily hydration target' },
      { id: 'sweat_rate',  label: 'Sweat Rate',    desc: 'ACSM fluid loss' },
      { id: 'sodium_loss', label: 'Sodium Loss',   desc: 'Electrolyte replacement' },
      { id: 'urine_check', label: 'Urine Check',   desc: 'Armstrong colour chart' },
    ],
  },
  {
    id: 'maternal', label: 'Maternal & Child', icon: 'heart', accent: '#DB2777',
    calculators: [
      { id: 'pregnancy_weight', label: 'Pregnancy Weight Gain', desc: 'IOM safe ranges' },
      { id: 'child_bmi',        label: 'Child BMI',             desc: 'Ages 2–18 guide' },
      { id: 'infant_formula',   label: 'Infant Formula',        desc: 'mL per kg per day' },
      { id: 'fertility',        label: 'Fertility Window',      desc: 'Ovulation cycle' },
    ],
  },
  {
    id: 'sports', label: 'Sports Performance', icon: 'dumbbell', accent: '#7C3AED',
    calculators: [
      { id: 'athlete_protein',  label: 'Athlete Protein',  desc: 'ISSN ranges' },
      { id: 'carb_loading',     label: 'Carb Loading',     desc: 'Event fuel protocol' },
      { id: 'preworkout_carbs', label: 'Pre-Workout Carbs',desc: 'ACSM timing guide' },
    ],
  },
  {
    id: 'cardio', label: 'Cardiovascular', icon: 'pulse', accent: '#DC2626',
    calculators: [
      { id: 'heart_rate', label: 'Target Heart Rate', desc: 'Training zones' },
      { id: 'vo2max',     label: 'VO₂ Max Estimate',  desc: 'Aerobic capacity' },
    ],
  },
  {
    id: 'more', label: 'More Health Tools', icon: 'plate', accent: '#475569',
    calculators: [
      { id: 'alcohol', label: 'Alcohol Units',    desc: 'UK units & calories' },
      { id: 'dosage',  label: 'Pediatric Dosage', desc: 'Weight-based dosing' },
    ],
  },
];

const ALL_CALCULATORS = CATEGORIES.flatMap(c => c.calculators.map(calc => ({ ...calc, categoryId: c.id })));
/* attach an SVG icon name to every calculator for sidebar/search/panel use */
ALL_CALCULATORS.forEach(c => { c.iconName = CALC_ICON_NAMES[c.id] || 'plate'; });

/* ── Image that never breaks layout: hides itself on load error,
      gradient underneath always carries the design ── */
function SafeImage({ src, alt, className }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setOk(false)} />;
}

/* ── CSS 3D tilt-on-hover card (disabled under reduced motion) ── */
function TiltCard({ children, className = '', onClick, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform =
      `perspective(900px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) translateY(-4px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <button ref={ref} type="button" className={`tilt-card ${className}`}
      style={style} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick}>
      {children}
    </button>
  );
}

/* ── 3D landing hero ── */
function CalculatorsHero({ query, setQuery, onPick }) {
  const q = query.trim().toLowerCase();
  const results = q
    ? ALL_CALCULATORS.filter(c =>
        c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)).slice(0, 8)
    : [];

  return (
    <section className="calc-landing-hero">
      <Calculators3DBg />
      <Container>
        <div className="calc-hero-inner">
          <div className="calc-hero-copy">
            <Badge variant="primary">Health Tools</Badge>
            <h1 className="calc-hero-title">Your Health, Quantified</h1>
            <p className="calc-hero-subtitle">
              {CATEGORIES.length} categories · {ALL_CALCULATORS.length} science-backed calculators
              for complete health insights — from body composition to clinical screening.
            </p>
            <div className="calc-search-wrap">
              <Input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search calculators — try “protein”, “iron”, “sweat”…"
                aria-label="Search calculators"
                className="calc-search-input"
              />
              {q && (
                <div className="calc-search-results" role="listbox" aria-label="Calculator results">
                  {results.length === 0 && (
                    <p className="calc-search-empty">No calculators match “{query}”. Try “BMI”, “water”, or “calcium”.</p>
                  )}
                  {results.map(c => (
                    <button key={c.id} type="button" className="calc-search-item"
                      onClick={() => onPick(c.id, c.categoryId)}>
                      <CalcIcon name={c.iconName} size={20} />
                      <span>
                        <strong>{c.label}</strong>
                        <small>{c.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <CalcDisclaimer />
          </div>
          <div className="calc-hero-media">
            <SafeImage src="/images/calculators-hero.jpg" alt="Nutrition and health calculators"
              className="calc-hero-img" />
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function Calculators() {
  useSEO({"title":"Free Nutrition & Health Calculators","description":"Explore BMI, energy, macronutrient and hydration calculators with guidance on interpreting estimates.","noIndex":false});
  const [activeCategory, setActiveCategory] = useState('body');
  const [activeCalc, setActiveCalc]         = useState('bmi');
  const [query, setQuery]                   = useState('');
  const calcRef = useRef(null);
  const location = useLocation();
  useReveal();

  // If navigated from home with a requested calculator id, open it.
  // Home links pass location.state.openCalc; older sections used sessionStorage.
  useEffect(() => {
    const raw = location.state?.openCalc || sessionStorage.getItem('openCalc');
    const id = resolveCalcId(raw);
    if (id) {
      const cat = ALL_CALCULATORS.find(c => c.id === id)?.categoryId;
      if (cat) setActiveCategory(cat);
      setActiveCalc(id);
      sessionStorage.removeItem('openCalc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const currentCategory = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const currentCalcMeta = ALL_CALCULATORS.find(c => c.id === activeCalc);

  const handleSelectCalc = (calcId, catId) => {
    setActiveCalc(calcId);
    setActiveCategory(catId);
    setQuery('');
    setTimeout(() => {
      calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div>
      {/* ── 3D Landing Hero ── */}
      <CalculatorsHero query={query} setQuery={setQuery} onPick={handleSelectCalc} />

      {/* ── Category Grid (Quick Access) ── */}
      <SectionWrapper bg="lowest">
        <Container>
          <div className="calc-category-grid reveal">
            {CATEGORIES.map(cat => (
              <TiltCard
                key={cat.id}
                className={`calc-category-card ${activeCategory === cat.id ? 'active' : ''}`}
                style={{ '--cat-accent': cat.accent }}
                onClick={() => { setActiveCategory(cat.id); setActiveCalc(cat.calculators[0].id); }}
              >
                <span className="calc-category-icon" style={{ color: cat.accent }}>
                  <CalcIcon name={cat.icon} size={30} />
                </span>
                <span className="calc-category-label">{cat.label}</span>
                <span className="calc-category-count">{cat.calculators.length} tools</span>
              </TiltCard>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Main Calculator Area ── */}
      <SectionWrapper bg="container">
        <Container>
          <div className="calc-layout" ref={calcRef}>

            {/* Sidebar */}
            <aside className="calc-sidebar reveal">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="calc-sidebar-group">
                  <div className="calc-sidebar-category">
                    <span style={{ color: cat.accent }}><CalcIcon name={cat.icon} size={18} /></span> {cat.label}
                  </div>
                  {cat.calculators.map(calc => (
                    <button
                      key={calc.id}
                      className={`calc-sidebar-item ${activeCalc === calc.id ? 'active' : ''}`}
                      onClick={() => handleSelectCalc(calc.id, cat.id)}
                    >
                      <span className="sidebar-icon"><CalcIcon name={calc.iconName} size={18} /></span>
                      <span className="sidebar-text">
                        <span className="sidebar-name">{calc.label}</span>
                        <span className="sidebar-desc">{calc.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </aside>

            {/* Calculator Panel */}
            <main className="calc-main reveal reveal-delay-1">
              <CalculatorPanel calcId={activeCalc} meta={currentCalcMeta} />
            </main>
          </div>
        </Container>
      </SectionWrapper>

      {/* ── Guidelines Section ── */}
      <SectionWrapper bg="lowest">
        <Container>
          <GuidelinesSection calcId={activeCalc} />
        </Container>
      </SectionWrapper>

      {/* ── Why These Metrics Matter ── */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="calc-why reveal">
            <h2>Why Track These Metrics?</h2>
            <p>
              Evidence-based nutrition starts with knowing your numbers. Our calculators use
              validated clinical formulas — Mifflin-St Jeor, Devine, U.S. Navy, Boer, BAPEN MUST,
              ACSM and ISSN guidance — to give you the same insights used by registered dietitians.
            </p>
            <div className="calc-why-grid">
              {[
                { icon: 'chart', title: 'Data-Driven',   body: 'Based on peer-reviewed research and validated clinical formulas.' },
                { icon: 'target', title: 'Personalized', body: 'Results tailored to your age, sex, weight, height, and lifestyle.' },
                { icon: 'cycle', title: 'Trackable',     body: 'Save and compare results over time to see real progress.' },
                { icon: 'shield', title: 'Safe',         body: 'All results include interpretation guidance and safety notes.' },
              ].map(item => (
                <div key={item.title} className="calc-why-box">
                  <div className="why-icon"><CalcIcon name={item.icon} size={26} /></div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALCULATOR PANEL ROUTER — legacy components + 14 new ones
   ═══════════════════════════════════════════════════════════════ */
function CalculatorPanel({ calcId, meta }) {
  const legacy = {
    bmi:              BMICalc,
    body_fat:         BodyFatCalc,
    ideal_weight:     IdealWeightCalc,
    waist_height:     WaistHeightCalc,
    bmr:              BMRCalc,
    tdee:             TDEECalc,
    macros:           MacrosCalc,
    protein:          ProteinCalc,
    water:            WaterCalc,
    heart_rate:       HeartRateCalc,
    vo2max:           VO2MaxCalc,
    cholesterol:      CholesterolCalc,
    fertility:        FertilityCalc,
    pregnancy_weight: PregnancyWeightCalc,
    child_bmi:        ChildBMICalc,
    alcohol:          AlcoholCalc,
    dosage:           DosageCalc,
  };
  const NewCalc = getNewCalcComponent(calcId);
  if (NewCalc) return <NewCalc meta={meta} />; // new calcs carry their own disclaimer
  const Component = legacy[calcId] || BMICalc;
  return (
    <>
      <Component meta={meta} />
      <CalcDisclaimer />
    </>
  );
}

/* ── GUIDELINES DATA ─────────────────────────────────────────── */
const GUIDELINES = {
  bmi: {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    title: 'Understanding BMI',
    points: [
      'BMI is a screening tool, not a diagnostic measure.',
      'It does not account for muscle mass, bone density, or fat distribution.',
      'Athletes may have a high BMI due to muscle without excess fat.',
      'A BMI of 18.5–24.9 is generally considered healthy for adults.',
      'Always combine BMI with other health metrics for a complete picture.',
    ],
    ranges: [
      { label: 'Severely Underweight', range: '< 16.0',   color: 'info' },
      { label: 'Underweight',          range: '16.0–18.4', color: 'info' },
      { label: 'Normal Weight',        range: '18.5–24.9', color: 'success' },
      { label: 'Overweight',           range: '25.0–29.9', color: 'warning' },
      { label: 'Obese Class I',        range: '30.0–34.9', color: 'error' },
      { label: 'Obese Class II+',      range: '≥ 35.0',   color: 'error' },
    ],
  },
  body_fat: {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    title: 'Body Fat Percentage Ranges',
    points: [
      'Essential fat is the minimum needed for basic physiological functions.',
      'Athletes typically carry 6–13% (men) or 14–20% (women) body fat.',
      'A healthy fitness range for most adults is 14–24% (men) or 21–32% (women).',
      'Body fat can be measured more accurately via DEXA, hydrostatic weighing, or calipers.',
      'Visceral fat (around organs) is more dangerous than subcutaneous fat.',
    ],
    ranges: [
      { label: 'Essential Fat (Men)',     range: '2–5%',   color: 'info' },
      { label: 'Athletic (Men)',          range: '6–13%',  color: 'success' },
      { label: 'Fitness (Men)',           range: '14–17%', color: 'success' },
      { label: 'Average (Men)',           range: '18–24%', color: 'warning' },
      { label: 'Essential Fat (Women)',   range: '10–13%', color: 'info' },
      { label: 'Athletic (Women)',        range: '14–20%', color: 'success' },
    ],
  },
  tdee: {
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    title: 'Understanding Your Calorie Needs',
    points: [
      'TDEE = BMR × Activity Multiplier. It is the total calories you burn daily.',
      'A deficit of 500 kcal/day produces ~0.5 kg/week of weight loss.',
      'Eating below your BMR for extended periods slows your metabolism.',
      'Recalculate every 4–6 weeks as your weight changes.',
      'TDEE estimates have a ±10% margin of error — adjust based on results.',
    ],
    ranges: [
      { label: 'Weight Loss',     range: 'TDEE − 500 kcal',  color: 'info' },
      { label: 'Maintenance',     range: 'TDEE exactly',      color: 'success' },
      { label: 'Lean Bulk',       range: 'TDEE + 200–300',    color: 'warning' },
      { label: 'Muscle Gain',     range: 'TDEE + 300–500',    color: 'error' },
    ],
  },
  macros: {
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=600&q=80',
    title: 'Macronutrient Guidelines',
    points: [
      'Protein: 4 kcal/g — essential for muscle repair, enzymes, and satiety.',
      'Carbohydrates: 4 kcal/g — primary fuel source, especially for brain and exercise.',
      'Fats: 9 kcal/g — required for hormones, fat-soluble vitamins, and cell membranes.',
      'Prioritise whole food sources: lean meats, legumes, whole grains, avocados, nuts.',
      'Adjust ratios every 4–8 weeks based on energy, performance, and progress.',
    ],
    ranges: [
      { label: 'Protein',          range: '0.8–2.2 g/kg BW', color: 'error' },
      { label: 'Carbohydrates',    range: '45–65% of kcal',  color: 'info' },
      { label: 'Dietary Fat',      range: '20–35% of kcal',  color: 'warning' },
      { label: 'Fibre (men)',      range: '30–38 g/day',     color: 'success' },
      { label: 'Fibre (women)',    range: '21–25 g/day',     color: 'success' },
    ],
  },
  water: {
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
    title: 'Hydration Tips',
    points: [
      'Drink water before you feel thirsty — thirst indicates you are already 1–2% dehydrated.',
      'Urine colour is a reliable indicator: pale yellow = well hydrated.',
      'Coffee and tea count toward hydration, despite mild diuretic effect.',
      'Increase intake by 500–600 ml for every 30 mins of intense exercise.',
      'Electrolyte balance matters as much as total volume during long exercise.',
    ],
    ranges: [
      { label: 'Minimum (sedentary)',  range: '2.0 L/day',  color: 'info' },
      { label: 'General recommendation', range: '2.5–3.5 L',color: 'success' },
      { label: 'Active / Hot climate', range: '3.5–4.5 L',  color: 'warning' },
      { label: 'Intense exercise',     range: '4.5+ L',     color: 'error' },
    ],
  },
  heart_rate: {
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80',
    title: 'Heart Rate Training Zones',
    points: [
      'Zone 1 (50–60%): Active recovery, warm-up, promotes aerobic base.',
      'Zone 2 (60–70%): Fat burning, builds endurance, sustainable for long sessions.',
      'Zone 3 (70–80%): Aerobic conditioning, improves cardiovascular efficiency.',
      'Zone 4 (80–90%): Anaerobic threshold, increases lactate tolerance.',
      'Zone 5 (90–100%): Maximum effort, reserved for interval training.',
    ],
    ranges: [
      { label: 'Zone 1 — Warm-up',     range: '50–60% max HR', color: 'info' },
      { label: 'Zone 2 — Fat Burn',     range: '60–70% max HR', color: 'success' },
      { label: 'Zone 3 — Aerobic',      range: '70–80% max HR', color: 'success' },
      { label: 'Zone 4 — Anaerobic',    range: '80–90% max HR', color: 'warning' },
      { label: 'Zone 5 — Max Effort',   range: '90–100% max HR',color: 'error' },
    ],
  },
};

const getGuideline = (id) => GUIDELINES[id] || null;

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
/* Aliases for ids used by older links / sections. */
const CALC_ALIASES = { calories: 'tdee', ideal: 'ideal_weight', calorie: 'tdee' };
const resolveCalcId = (id) => {
  if (!id) return null;
  const norm = CALC_ALIASES[id] || id;
  return ALL_CALCULATORS.some(c => c.id === norm) ? norm : null;
};

function useCalculationResult() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const run = operation => { setError(''); setResult(null); try { operation(); } catch (e) { setError(e.message || 'Please check your inputs.'); } };
  return [result, setResult, error, run];
}

/* ── 1. BMI ── */
function BMICalc({ meta }) {
  const [weight, setWeight]   = useState('');
  const [height, setHeight]   = useState('');
  const [unit, setUnit]       = useState('metric');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight), h = parseFloat(height);
    if (!w || !h) throw new Error('Complete all fields with valid values.');
    const wKg  = unit === 'imperial' ? w * 0.453592 : w;
    const hCm  = unit === 'imperial' ? h * 30.48 : h;
    const bmi  = parseFloat(calculateBMI(wKg, hCm));
    const cat  = getBMICategory(bmi);
    setResult({ bmi, ...cat });
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Calculate your Body Mass Index using your weight and height.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <UnitToggle unit={unit} onChange={setUnit}
          options={[{ value: 'metric', label: 'Metric (kg/cm)' }, { value: 'imperial', label: 'Imperial (lbs/ft)' }]} />
        <div className="form-grid-2">
          <Input label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`} type="number"
            value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'metric' ? '70' : '154'} />
          <Input label={`Height (${unit === 'metric' ? 'cm' : 'ft'})`} type="number"
            value={height} onChange={e => setHeight(e.target.value)} placeholder={unit === 'metric' ? '175' : '5.9'} />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate BMI</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.ring} max={100} label="BMI Score" size={130} />
              <div className="result-details">
                <div className="result-big">{result.bmi}</div>
                <div className={`result-category cat-${result.color}`}>{result.category}</div>
                <ResultRow label="Your BMI" value={result.bmi} />
                <ResultRow label="Healthy range" value="18.5 – 24.9" color="success" />
              </div>
            </div>
            <SaveResult type="bmi" inputData={{
              weight: unit === 'imperial' ? parseFloat(weight) * 0.453592 : parseFloat(weight),
              height: unit === 'imperial' ? parseFloat(height) * 30.48 : parseFloat(height),
            }} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 2. Body Fat % ── */
function BodyFatCalc({ meta }) {
  const [weight, setWeight]   = useState('');
  const [waist, setWaist]     = useState('');
  const [neck, setNeck]       = useState('');
  const [height, setHeight]   = useState('');
  const [hip, setHip]         = useState('');
  const [gender, setGender]   = useState('male');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight), wa = parseFloat(waist),
          n = parseFloat(neck), h = parseFloat(height), hi = parseFloat(hip);
    if (!w || !wa || !n || !h) throw new Error('Complete all fields with valid values.');
    setResult(calculateBodyFat(w, wa, n, h, hi || 0, gender));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Uses the U.S. Navy circumference method — accurate within 3–4%.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <SelectField label="Sex" value={gender} onChange={setGender}
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
        <div className="form-grid-2">
          <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
          <Input label="Height (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
          <Input label="Waist (cm)" type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="80" hint="Measure at navel" />
          <Input label="Neck (cm)" type="number" value={neck} onChange={e => setNeck(e.target.value)} placeholder="38" hint="Below larynx" />
          {gender === 'female' && (
            <Input label="Hip (cm)" type="number" value={hip} onChange={e => setHip(e.target.value)} placeholder="95" hint="Widest point" />
          )}
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Body Fat</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.value} max={50} label="Body Fat" unit="%" size={130} />
              <div className="result-details">
                <div className="result-big">{result.value}%</div>
                <div className={`result-category cat-${result.color}`}>{result.category}</div>
                <ResultRow label="Body Fat" value={`${result.value}%`} />
                <ResultRow label="Fat Mass" value={`${Math.round(parseFloat(weight) * result.value / 100)} kg`} />
                <ResultRow label="Lean Mass" value={`${Math.round(parseFloat(weight) * (1 - result.value / 100))} kg`} color="success" />
              </div>
            </div>
            <SaveResult type="body_fat" inputData={{
              weight: parseFloat(weight), gender, neck: parseFloat(neck),
              waist: parseFloat(waist), hip: parseFloat(hip) || 0, height: parseFloat(height),
            }} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 4. Ideal Weight ── */
function IdealWeightCalc({ meta }) {
  const [height, setHeight]   = useState('');
  const [gender, setGender]   = useState('male');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const h = parseFloat(height);
    if (!h) throw new Error('Complete all fields with valid values.');
    setResult(calculateIdealWeight(h, gender));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Uses the Devine formula — widely used in clinical settings.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <SelectField label="Sex" value={gender} onChange={setGender}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          <Input label="Height (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Ideal Weight</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.devine} max={120} label="Ideal (kg)" size={130} />
              <div className="result-details">
                <div className="result-big">{result.devine} kg</div>
                <div className="result-category cat-success">Devine Formula</div>
                <ResultRow label="Devine ideal"   value={`${result.devine} kg`} color="success" />
                <p className="result-note-text">Saving is not available for Ideal Weight — the backend only stores BMI, TDEE, macro, body-fat and water results.</p>
                <ResultRow label="Healthy range"  value={`${result.min} – ${result.max} kg`} />
                <ResultRow label="BMI range"      value={`${result.bmiMin} – ${result.bmiMax} kg`} note="BMI 18.5–24.9" />
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 5. Waist-to-Height ── */
function WaistHeightCalc({ meta }) {
  const [waist, setWaist]     = useState('');
  const [height, setHeight]   = useState('');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(waist), h = parseFloat(height);
    if (!w || !h) throw new Error('Complete all fields with valid values.');
    setResult(calculateWaistToHeight(w, h));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        A strong predictor of cardiovascular risk — more reliable than BMI alone.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <Input label="Waist (cm)" type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="80" hint="At navel level" />
          <Input label="Height (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Ratio</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={Math.round(result.ratio * 100)} max={100} label="Ratio ×100" size={130} />
              <div className="result-details">
                <div className="result-big">{result.ratio}</div>
                <div className={`result-category cat-${result.color}`}>{result.category}</div>
                <ResultRow label="Your ratio" value={result.ratio} />
                <ResultRow label="Healthy target" value="< 0.50" color="success" />
                <p className="result-advice">{result.advice}</p>
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 6. BMR ── */
function BMRCalc({ meta }) {
  const [weight, setWeight]   = useState('');
  const [height, setHeight]   = useState('');
  const [age, setAge]         = useState('');
  const [gender, setGender]   = useState('male');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a) throw new Error('Complete all fields with valid values.');
    setResult(calculateBMR(w, h, a, gender));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Mifflin-St Jeor equation — the calories your body burns at complete rest.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <SelectField label="Sex" value={gender} onChange={setGender}
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
        <div className="form-grid-3">
          <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
          <Input label="Height (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
          <Input label="Age (years)" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate BMR</Button>

        {result !== null && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={Math.min(result, 3000)} max={3000} label="BMR" unit=" kcal" size={130} />
              <div className="result-details">
                <div className="result-big">{result} kcal</div>
                <div className="result-category cat-success">Basal Metabolic Rate</div>
                <ResultRow label="Calories at rest" value={`${result} kcal/day`} color="success" />
                <ResultRow label="Per hour" value={`${Math.round(result / 24)} kcal`} />
              </div>
            </div>
            <p className="result-note-text">This is the minimum your body needs to sustain life. Eating below BMR long-term is not recommended.</p>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 7. TDEE ── */
function TDEECalc({ meta }) {
  const [weight, setWeight]   = useState('');
  const [height, setHeight]   = useState('');
  const [age, setAge]         = useState('');
  const [gender, setGender]   = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a) throw new Error('Complete all fields with valid values.');
    setResult(calculateTDEE(w, h, a, gender, activity));
  });

  const activityOptions = [
    { value: 'sedentary',   label: 'Sedentary — desk job, little exercise' },
    { value: 'light',       label: 'Light — 1–3 days/week exercise' },
    { value: 'moderate',    label: 'Moderate — 3–5 days/week exercise' },
    { value: 'active',      label: 'Active — 6–7 days/week exercise' },
    { value: 'very_active', label: 'Very Active — hard exercise twice/day' },
  ];

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Total Daily Energy Expenditure — how many calories you actually burn per day.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <SelectField label="Sex" value={gender} onChange={setGender}
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
        <div className="form-grid-3">
          <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
          <Input label="Height (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
          <Input label="Age (years)" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
        </div>
        <SelectField label="Activity Level" value={activity} onChange={setActivity} options={activityOptions} />
        <Button variant="primary" onClick={calculate} fullWidth>Calculate TDEE</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={Math.min(result.tdee, 4000)} max={4000} label="TDEE" unit=" kcal" size={130} />
              <div className="result-details">
                <div className="result-big">{result.tdee} kcal</div>
                <div className="result-category cat-success">Maintenance Calories</div>
                <ResultRow label="BMR"            value={`${result.bmr} kcal`} />
                <ResultRow label="Maintenance"    value={`${result.tdee} kcal`} color="success" />
                <ResultRow label="Weight Loss"    value={`${result.weightLoss} kcal`} color="warning" note="−500 kcal" />
                <ResultRow label="Weight Gain"    value={`${result.weightGain} kcal`} note="+300 kcal" />
              </div>
            </div>
            <SaveResult type="tdee" inputData={{
              weight: parseFloat(weight), height: parseFloat(height), age: parseFloat(age),
              gender, activityLevel: activity,
            }} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 8. Macros ── */
function MacrosCalc({ meta }) {
  const [calories, setCalories] = useState('');
  const [goal, setGoal]         = useState('maintenance');
  const [diet, setDiet]         = useState('balanced');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const goalOptions = [
    { value: 'weightLoss',  label: 'Weight Loss' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'muscleGain',  label: 'Muscle Gain' },
  ];
  const dietOptions = {
    weightLoss:  [{ value: 'balanced', label: 'Balanced' }, { value: 'low_carb', label: 'Low Carb' }, { value: 'keto', label: 'Keto' }],
    maintenance: [{ value: 'balanced', label: 'Balanced' }, { value: 'low_carb', label: 'Low Carb' }, { value: 'high_protein', label: 'High Protein' }],
    muscleGain:  [{ value: 'balanced', label: 'Balanced' }, { value: 'high_protein', label: 'High Protein' }, { value: 'low_carb', label: 'Low Carb' }],
  };

  const calculate = () => runCalculation(() => {
    const c = parseFloat(calories);
    if (!c) throw new Error('Complete all fields with valid values.');
    setResult(calculateMacros(c, goal, diet));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Daily protein, carbohydrate, and fat targets based on your calorie goal.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <Input label="Daily Calories (kcal)" type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="2000" hint="Use TDEE calculator above" />
        <div className="form-grid-2">
          <SelectField label="Goal" value={goal} onChange={v => { setGoal(v); setDiet('balanced'); }} options={goalOptions} />
          <SelectField label="Diet Style" value={diet} onChange={setDiet} options={dietOptions[goal]} />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Macros</Button>

        {result && (
          <ResultCard>
            <div className="macros-chart">
              <MacroDoughnut
                protein={result.protein} carbs={result.carbs} fats={result.fats}
                proteinPct={result.proteinPct} carbsPct={result.carbsPct} fatsPct={result.fatsPct}
              />
            </div>
            <div className="macro-detail-grid">
              <ResultRow label="Protein" value={`${result.protein}g  (${result.proteinPct}%)`} color="success" />
              <ResultRow label="Carbohydrates" value={`${result.carbs}g  (${result.carbsPct}%)`} />
              <ResultRow label="Fats" value={`${result.fats}g  (${result.fatsPct}%)`} color="warning" />
            </div>
            <SaveResult type="macro" inputData={{
              calories: parseFloat(calories),
              goal: goal === 'weightLoss' ? 'weight_loss' : goal === 'muscleGain' ? 'muscle_gain' : 'maintenance',
            }} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 9. Protein ── */
function ProteinCalc({ meta }) {
  const [weight, setWeight]   = useState('');
  const [goal, setGoal]       = useState('maintenance');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight);
    if (!w) throw new Error('Complete all fields with valid values.');
    setResult(calculateProteinIntake(w, goal));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Evidence-based daily protein recommendations per your goal.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
          <SelectField label="Goal" value={goal} onChange={setGoal}
            options={[
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'muscleGain',  label: 'Muscle Gain' },
              { value: 'weightLoss',  label: 'Weight Loss' },
              { value: 'endurance',   label: 'Endurance Sports' },
            ]} />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Protein</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.optimal} max={250} label="Optimal (g)" size={130} />
              <div className="result-details">
                <div className="result-big">{result.optimal}g</div>
                <div className="result-category cat-success">Optimal Daily Protein</div>
                <ResultRow label="Range"    value={`${result.min} – ${result.max} g/day`} />
                <ResultRow label="Optimal"  value={`${result.optimal} g/day`} color="success" />
                <ResultRow label="Per meal (4)" value={`${result.perMeal} g`} />
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 10. Water Intake ── */
function WaterCalc({ meta }) {
  const [weight, setWeight]     = useState('');
  const [activity, setActivity] = useState('moderate');
  const [climate, setClimate]   = useState('temperate');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight);
    if (!w) throw new Error('Complete all fields with valid values.');
    setResult(calculateWaterIntake(w, activity, climate));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Personalised daily hydration target based on body weight, activity, and climate.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
        <div className="form-grid-2">
          <SelectField label="Activity Level" value={activity} onChange={setActivity}
            options={[
              { value: 'sedentary',   label: 'Sedentary' },
              { value: 'light',       label: 'Light Exercise' },
              { value: 'moderate',    label: 'Moderate Exercise' },
              { value: 'active',      label: 'Active (Daily Exercise)' },
              { value: 'very_active', label: 'Very Active (Twice/Day)' },
            ]} />
          <SelectField label="Climate" value={climate} onChange={setClimate}
            options={[
              { value: 'cold',       label: 'Cold' },
              { value: 'temperate',  label: 'Temperate' },
              { value: 'warm',       label: 'Warm' },
              { value: 'hot',        label: 'Hot / Humid' },
            ]} />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Water Intake</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={Math.round(result.litres * 10)} max={50} label="Litres" unit="L" size={130} />
              <div className="result-details">
                <div className="result-big">{result.litres}L</div>
                <div className="result-category cat-success">Daily Target</div>
                <ResultRow label="Daily total"  value={`${result.litres} L`} color="success" />
                <ResultRow label="In ml"        value={`${result.ml} ml`} />
                <ResultRow label="Glasses (250ml)" value={`${result.glasses} glasses`} />
              </div>
            </div>
            <SaveResult type="water_intake" inputData={{ weight: parseFloat(weight), activity, climate }} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 11. Heart Rate ── */
function HeartRateCalc({ meta }) {
  const [age, setAge]           = useState('');
  const [restHR, setRestHR]     = useState('65');
  const [fitnessGoal, setGoal]  = useState('fat_burn');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const a = parseFloat(age), r = parseFloat(restHR);
    if (!a) throw new Error('Complete all fields with valid values.');
    setResult(calculateTargetHeartRate(a, r || 65, fitnessGoal));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Heart rate training zones using the Karvonen (heart rate reserve) method.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-3">
          <Input label="Age (years)" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
          <Input label="Resting HR (bpm)" type="number" value={restHR} onChange={e => setRestHR(e.target.value)} placeholder="65" hint="Morning, before rising" />
          <SelectField label="Training Goal" value={fitnessGoal} onChange={setGoal}
            options={[
              { value: 'warmup',     label: 'Warm-up / Recovery' },
              { value: 'fat_burn',   label: 'Fat Burning' },
              { value: 'aerobic',    label: 'Aerobic Endurance' },
              { value: 'anaerobic',  label: 'Anaerobic Threshold' },
              { value: 'max_effort', label: 'Maximum Effort' },
            ]} />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Heart Rate Zones</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.targetMin} max={result.maxHR} label="Target Min" unit=" bpm" size={130} />
              <div className="result-details">
                <div className="result-big">{result.targetMin}–{result.targetMax}</div>
                <div className="result-category cat-success">{result.goalLabel} Zone (bpm)</div>
                <ResultRow label="Max HR (220−age)" value={`${result.maxHR} bpm`} />
                <ResultRow label="Target range" value={`${result.targetMin}–${result.targetMax} bpm`} color="success" />
              </div>
            </div>
            <div className="hr-zones-grid">
              {result.allZones.map(z => (
                <div key={z.key} className={`hr-zone zone-${z.color}`}>
                  <span className="zone-label">{z.label}</span>
                  <span className="zone-range">{z.min}–{z.max} bpm</span>
                </div>
              ))}
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 12. VO2 Max ── */
function VO2MaxCalc({ meta }) {
  const [age, setAge]           = useState('');
  const [gender, setGender]     = useState('male');
  const [restHR, setRestHR]     = useState('');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const a = parseFloat(age), r = parseFloat(restHR);
    if (!a || !r) throw new Error('Complete all fields with valid values.');
    setResult(calculateVO2Max(a, gender, r));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Estimate your aerobic capacity using the Uth-Sørensen resting heart rate method.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-3">
          <SelectField label="Sex" value={gender} onChange={setGender}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          <Input label="Age (years)" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
          <Input label="Resting HR (bpm)" type="number" value={restHR} onChange={e => setRestHR(e.target.value)} placeholder="65" hint="Measured after 5 mins rest" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Estimate VO₂ Max</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.vo2} max={80} label="VO₂ Max" unit=" ml/kg/min" size={130} />
              <div className="result-details">
                <div className="result-big">{result.vo2}</div>
                <div className={`result-category cat-${result.color}`}>{result.category}</div>
                <ResultRow label="VO₂ Max" value={`${result.vo2} ml/kg/min`} color="success" />
                <ResultRow label="Aerobic fitness" value={result.category} />
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 13. Cholesterol ── */
function CholesterolCalc({ meta }) {
  const [total, setTotal]   = useState('');
  const [hdl, setHdl]       = useState('');
  const [ldl, setLdl]       = useState('');
  const [trig, setTrig]     = useState('');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const t = parseFloat(total), h = parseFloat(hdl), l = parseFloat(ldl), tr = parseFloat(trig);
    if (!t || !h || !l) throw new Error('Complete all fields with valid values.');
    setResult(calculateCholesterolRatio(t, h, l, tr || 0));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Calculate your cholesterol ratios — key predictors of cardiovascular disease risk.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <Input label="Total Cholesterol (mg/dL)" type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="200" />
          <Input label="HDL Cholesterol (mg/dL)" type="number" value={hdl} onChange={e => setHdl(e.target.value)} placeholder="55" hint="Good cholesterol" />
          <Input label="LDL Cholesterol (mg/dL)" type="number" value={ldl} onChange={e => setLdl(e.target.value)} placeholder="120" hint="Bad cholesterol" />
          <Input label="Triglycerides (mg/dL)" type="number" value={trig} onChange={e => setTrig(e.target.value)} placeholder="150" hint="Optional" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Ratios</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={Math.round(result.totalHDL * 10)} max={100} label="Total:HDL" size={130} />
              <div className="result-details">
                <div className="result-big">{result.totalHDL}</div>
                <div className={`result-category cat-${result.color}`}>{result.riskLevel}</div>
                <ResultRow label="Total:HDL Ratio" value={result.totalHDL} color={result.color} />
                <ResultRow label="LDL:HDL Ratio"   value={result.ldlHDL} />
                {trig && <ResultRow label="Trig:HDL Ratio" value={result.trig_HDL} />}
                <ResultRow label="Optimal Total:HDL" value="< 3.5" color="success" />
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 14. Fertility Window ── */
function FertilityCalc({ meta }) {
  const [lastPeriod, setLastPeriod]   = useState('');
  const [cycleLen, setCycleLen]       = useState('28');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    if (!lastPeriod) throw new Error('Complete all fields with valid values.');
    setResult(calculateFertilityWindow(lastPeriod, parseInt(cycleLen)));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Estimate your most fertile days based on your menstrual cycle.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <FormGroup label="First Day of Last Period" hint="Select the date">
            <input type="date" className="calc-select" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} />
          </FormGroup>
          <Input label="Average Cycle Length (days)" type="number" value={cycleLen} onChange={e => setCycleLen(e.target.value)} placeholder="28" hint="Typical: 21–35 days" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Fertility Window</Button>

        {result && (
          <ResultCard>
            <div className="fertility-grid">
              <div className="fertility-item highlight">
                <span className="fertility-icon">🌸</span>
                <span className="fertility-label">Ovulation Day</span>
                <span className="fertility-value">{result.ovulationDate}</span>
              </div>
              <div className="fertility-item">
                <span className="fertility-icon">📅</span>
                <span className="fertility-label">Fertile Window</span>
                <span className="fertility-value">{result.windowStart} – {result.windowEnd}</span>
              </div>
              <div className="fertility-item">
                <span className="fertility-icon">🗓️</span>
                <span className="fertility-label">Next Period</span>
                <span className="fertility-value">{result.nextPeriod}</span>
              </div>
              <div className="fertility-item">
                <span className="fertility-icon">⏱️</span>
                <span className="fertility-label">Days Until Ovulation</span>
                <span className="fertility-value">
                  {result.daysUntilOvulation > 0 ? `${result.daysUntilOvulation} days` : 'Passed'}
                </span>
              </div>
            </div>
            <p className="result-note-text">⚠️ This is an estimate. Cycle lengths vary. Consult a healthcare provider for family planning decisions.</p>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 15. Pregnancy Weight Gain ── */
function PregnancyWeightCalc({ meta }) {
  const [preBMI, setPreBMI]   = useState('');
  const [week, setWeek]       = useState('');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const b = parseFloat(preBMI), w = parseFloat(week);
    if (!b || !w || w < 1 || w > 42) throw new Error('Complete all fields with valid values.');
    setResult(calculatePregnancyWeightGain(b, w));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Safe pregnancy weight gain ranges based on ACOG guidelines.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <Input label="Pre-Pregnancy BMI" type="number" value={preBMI} onChange={e => setPreBMI(e.target.value)} placeholder="22" hint="Use the BMI calculator above" />
          <Input label="Current Week of Pregnancy" type="number" value={week} onChange={e => setWeek(e.target.value)} placeholder="20" hint="Weeks 1–42" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Weight Gain Range</Button>

        {result && (
          <ResultCard>
            <div className="pregnancy-result">
              <div className="trimester-badge">Trimester {result.trimester}</div>
              <div className="result-big">{result.expectedMin} – {result.expectedMax} kg</div>
              <div className="result-category cat-success">Expected gain by week {week}</div>
              <div className="pregnancy-grid">
                <ResultRow label="Your BMI category" value={result.category} />
                <ResultRow label="Total recommended gain" value={`${result.totalMin} – ${result.totalMax} kg`} color="success" />
                <ResultRow label="Expected gain to date" value={`${result.expectedMin} – ${result.expectedMax} kg`} />
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 16. Child BMI ── */
function ChildBMICalc({ meta }) {
  const [weight, setWeight]   = useState('');
  const [height, setHeight]   = useState('');
  const [age, setAge]         = useState('');
  const [gender, setGender]   = useState('male');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a) throw new Error('Complete all fields with valid values.');
    setResult(calculateChildBMI(w, h, a, gender));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        BMI assessment for children and adolescents aged 2–18.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="form-grid-2">
          <SelectField label="Sex" value={gender} onChange={setGender}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          <Input label="Age (years)" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="10" hint="Ages 2–18" />
          <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="35" />
          <Input label="Height (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="140" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Child BMI</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={parseFloat(result.bmi)} max={35} label="BMI" size={130} />
              <div className="result-details">
                <div className="result-big">{result.bmi}</div>
                <div className={`result-category cat-${result.color}`}>{result.category}</div>
                <ResultRow label="Child BMI" value={result.bmi} />
              </div>
            </div>
            <p className="result-note-text">⚠️ Child BMI should be interpreted by a paediatrician using age- and sex-specific growth charts (CDC/WHO).</p>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 17. Alcohol Units ── */
function AlcoholCalc({ meta }) {
  const [volume, setVolume]   = useState('');
  const [abv, setAbv]         = useState('');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();

  const presets = [
    { label: 'Pint of beer (5%, 568ml)',    volume: 568, abv: 5 },
    { label: 'Glass of wine (12%, 175ml)',  volume: 175, abv: 12 },
    { label: 'Single spirit (40%, 25ml)',   volume: 25,  abv: 40 },
    { label: 'Bottle of wine (12%, 750ml)', volume: 750, abv: 12 },
  ];

  const calculate = () => runCalculation(() => {
    const v = parseFloat(volume), a = parseFloat(abv);
    if (!v || !a) throw new Error('Complete all fields with valid values.');
    setResult(calculateAlcoholUnits(v, a));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        UK unit calculator — know your intake and the hidden calories in alcohol.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <div className="preset-pills">
          {presets.map(p => (
            <button key={p.label} className="preset-pill"
              onClick={() => { setVolume(String(p.volume)); setAbv(String(p.abv)); }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="form-grid-2">
          <Input label="Volume (ml)" type="number" value={volume} onChange={e => setVolume(e.target.value)} placeholder="568" />
          <Input label="ABV (%)" type="number" value={abv} onChange={e => setAbv(e.target.value)} placeholder="5" />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Units</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={Math.round(result.units * 10)} max={140} label="Units" size={130} />
              <div className="result-details">
                <div className="result-big">{result.units}</div>
                <div className={`result-category cat-${result.color}`}>{result.riskLevel}</div>
                <ResultRow label="Units in drink" value={result.units} color={result.color} />
                <ResultRow label="Calories"       value={`${result.calories} kcal`} />
                <ResultRow label="Weekly limit"   value={`${result.weeklyLimit} units` } note="UK guideline" color="success" />
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ── 18. Pediatric Dosage ── */
function DosageCalc({ meta }) {
  const [weight, setWeight]     = useState('');
  const [dosePerKg, setDose]    = useState('');
  const [maxDose, setMaxDose]   = useState('');
  const [dosesDay, setDosesDay] = useState('3');
  const [result, setResult, calcError, runCalculation] = useCalculationResult();



  const calculate = () => runCalculation(() => {
    const w = parseFloat(weight), d = parseFloat(dosePerKg), m = parseFloat(maxDose), f = parseInt(dosesDay);
    if (!w || !d || !f) throw new Error('Complete all fields with valid values.');
    setResult(calculatePediatricDosage(w, d, m, f));
  });

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        Arithmetic checker for an existing clinician-provided prescription. This tool cannot select a medicine or prescribe a dose.
      </CalcHeader>
      <div className="calc-form-body" onChangeCapture={() => setResult(null)}>
        {calcError && <p role="alert" className="calc-disclaimer">{calcError}</p>}
        <p className="calc-disclaimer">⚠️ Always verify doses with a pharmacist or physician. This tool is for reference only.</p>

        <div className="form-grid-2">
          <Input label="Child Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="20" />
          <Input label="Prescribed mg/kg PER DOSE" type="number" value={dosePerKg} onChange={e => setDose(e.target.value)} placeholder="15" />
          <Input label="Max Daily Dose (mg)" type="number" value={maxDose} onChange={e => setMaxDose(e.target.value)} placeholder="Prescribed daily maximum" hint="Required — obtain this limit from your prescriber" />
          <SelectField label="Doses per Day" value={dosesDay} onChange={setDosesDay}
            options={[{value:'2',label:'2'},{value:'3',label:'3'},{value:'4',label:'4'},{value:'6',label:'6'}]} />
        </div>
        <Button variant="primary" onClick={calculate} fullWidth>Calculate Dose</Button>

        {result && (
          <ResultCard>
            <div className="result-ring-row">
              <VitalityRing value={result.singleDose} max={500} label="Single Dose" unit="mg" size={130} />
              <div className="result-details">
                <div className="result-big">{result.singleDose}mg</div>
                <div className="result-category cat-success">Per Dose</div>
                <ResultRow label="Single dose" value={`${result.singleDose} mg`} color="success" />
                <ResultRow label="Daily total"  value={`${result.dailyTotal} mg`} />
                {result.isCapped && <p className="result-note-text">⚠️ {result.note}</p>}
              </div>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GUIDELINES SECTION
═══════════════════════════════════════════════════════════════ */
function GuidelinesSection({ calcId }) {
  const g = getGuideline(calcId);
  if (!g) return null;
  return (
    <div className="guidelines-section reveal">
      <div className="guidelines-grid">
        {/* Image */}
        <div className="guidelines-image-wrap">
          <img src={g.image} alt={g.title} className="guidelines-image" loading="lazy" />
          <div className="guidelines-image-overlay">
            <span>Evidence-Based</span>
          </div>
        </div>

        {/* Content */}
        <div className="guidelines-content">
          <Badge variant="primary" className="guidelines-badge">Clinical Guidelines</Badge>
          <h3 className="guidelines-title">{g.title}</h3>
          <ul className="guidelines-list">
            {g.points.map((p, i) => (
              <li key={i} className="guidelines-point">
                <span className="point-dot" />
                {p}
              </li>
            ))}
          </ul>

          {/* Reference ranges */}
          <div className="ref-ranges">
            <h4>Reference Ranges</h4>
            <div className="ref-ranges-grid">
              {g.ranges.map(r => (
                <div key={r.label} className="ref-range-item">
                  <span className={`ref-dot ref-dot-${r.color}`} />
                  <span className="ref-label">{r.label}</span>
                  <span className="ref-value">{r.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
