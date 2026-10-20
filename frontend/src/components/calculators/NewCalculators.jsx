import { useState } from 'react';
import {
  FormGroup, SelectField, ResultCard, ResultRow, SaveResult,
  CalcHeader, CalcDisclaimer, CalcIcon, CALC_ICON_NAMES,
} from './CalcUI.jsx';
import Button from '../UI/Button.jsx';
import Input from '../UI/Input.jsx';
import VitalityRing from '../data-viz/VitalityRing';
import {
  calculateWaistHipRatio, calculateBoerLBM, calculateCalorieTarget,
  calculateFiberNeeds, calculateMUSTScore, calculateCorrectedCalcium,
  calculateIronNeeds, calculateBreastfeedingCalories, calculateSweatRate,
  calculateSodiumLoss, checkUrineHydration, calculateInfantFormula,
  calculateAthleteProtein, calculateCarbLoading, calculatePreWorkoutCarbs,
} from '../../utils/calculators';

/* ── Schema-driven calculator engine ─────────────────────────────
   Each NEW calculator is declared as a data schema:
   fields: [{ key, label, type:'number'|'select', options, min, max,
              placeholder, hint, unit, custom, customMsg }]
   compute(values) → result object (throws Error with a message on
   domain-invalid combos). render(result, meta) → result JSX.
   Every panel gets validated inputs, guidance text and the
   education-only disclaimer. */

function Guidance({ paragraphs }) {
  return (
    <div className="calc-guidance">
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

function SchemaCalc({ meta, def }) {
  const initial = {};
  def.fields.forEach(f => { initial[f.key] = f.type === 'select' ? f.options[0].value : ''; });
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');

  const set = (key, v) => {
    setResult(null);
    setFormError('');
    setValues(prev => ({ ...prev, [key]: v }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const calculate = () => {
    const errs = {};
    def.fields.forEach(f => {
      if (f.type !== 'number') return;
      const raw = values[f.key];
      const v = parseFloat(raw);
      if (raw === '' || raw == null || !Number.isFinite(v)) {
        errs[f.key] = 'Please enter a number.';
      } else if (f.min != null && v < f.min) {
        errs[f.key] = `Value looks too low — enter at least ${f.min}${f.unit ? ' ' + f.unit : ''}.`;
      } else if (f.max != null && v > f.max) {
        errs[f.key] = `Value looks too high — enter at most ${f.max}${f.unit ? ' ' + f.unit : ''}.`;
      } else if (f.custom && !f.custom(v, values)) {
        errs[f.key] = f.customMsg || 'Please check this value.';
      }
    });
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) { setResult(null); return; }
    const nums = {};
    def.fields.forEach(f => {
      nums[f.key] = f.type === 'number' ? parseFloat(values[f.key]) : values[f.key];
    });
    try {
      setResult(def.compute(nums));
    } catch (e) {
      setResult(null);
      setFormError(e.message || 'These inputs do not form a valid calculation. Please check them.');
    }
  };

  return (
    <div className="calc-form">
      <CalcHeader meta={meta}>
        {def.intro} <span className="calc-formula-tag">{def.formula}</span>
      </CalcHeader>
      <div className="calc-form-body">
        <div className="form-grid-2">
          {def.fields.map(f => f.type === 'select' ? (
            <SelectField key={f.key} label={f.label} value={values[f.key]}
              onChange={v => set(f.key, v)} options={f.options} hint={f.hint} />
          ) : (
            <FormGroup key={f.key} label={f.label} hint={f.hint}>
              <Input type="number" value={values[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={errors[f.key] ? 'input-error' : ''} />
              {errors[f.key] && <span className="field-error">{errors[f.key]}</span>}
            </FormGroup>
          ))}
        </div>
        {formError && <p className="field-error form-error">{formError}</p>}
        <Button variant="primary" onClick={calculate} fullWidth>
          Calculate {meta?.label}
        </Button>

        {result && (
          <ResultCard>
            {def.render(result, meta)}
            <Guidance paragraphs={def.guidance} />
            <CalcDisclaimer />
            <SaveResult type={meta.id} inputData={values} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE 15 NEW CALCULATORS — every formula is a real published one
   ═══════════════════════════════════════════════════════════════ */

const GENDER = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const DEFS = {
  /* ── BODY COMPOSITION ── */
  waist_hip: {
    formula: 'WHO waist-hip cutoffs',
    intro: 'Measures fat distribution around the waist versus hips — a stronger predictor of cardiometabolic risk than weight alone.',
    fields: [
      { key: 'waist', label: 'Waist (cm)', type: 'number', min: 30, max: 250, unit: 'cm', placeholder: '85', hint: 'Narrowest point, relaxed exhale' },
      { key: 'hip', label: 'Hip (cm)', type: 'number', min: 30, max: 300, unit: 'cm', placeholder: '100', hint: 'Widest point of hips/buttocks' },
      { key: 'gender', label: 'Sex', type: 'select', options: GENDER },
    ],
    compute: v => calculateWaistHipRatio(v.waist, v.hip, v.gender),
    render: r => (
      <>
        <div className="result-ring-row">
          <VitalityRing value={Math.min(100, Math.round(r.ratio * 100))} max={100} label="WHR" size={130} />
          <div className="result-details">
            <div className="result-big">{r.ratio.toFixed(2)}</div>
            <div className={`result-category cat-${r.color}`}>{r.category}</div>
            <ResultRow label="Risk threshold" value={`≥ ${r.cutoff.toFixed(2)}`} color="warning" />
          </div>
        </div>
      </>
    ),
    guidance: [
      'Your waist-hip ratio describes where you store fat. Abdominal ("apple") storage drives insulin resistance and heart risk more than weight alone, which is why WHO sets hard cutoffs: 0.90 for men, 0.85 for women.',
      'A ratio below the threshold is reassuring, but it is one signal among many — blood pressure, lipids, and blood sugar complete the picture.',
      'If your ratio is elevated, the most effective lever is shrinking waist circumference through consistent eating patterns, daily movement, and sleep — not crash dieting.',
    ],
  },

  lean_mass: {
    formula: 'Boer formula (1984)',
    intro: 'Estimates fat-free mass from weight, height, and sex using the Boer equation — the clinical standard for drug dosing and body-composition work.',
    fields: [
      { key: 'weight', label: 'Weight (kg)', type: 'number', min: 25, max: 300, unit: 'kg', placeholder: '70' },
      { key: 'height', label: 'Height (cm)', type: 'number', min: 100, max: 250, unit: 'cm', placeholder: '175' },
      { key: 'gender', label: 'Sex', type: 'select', options: GENDER },
    ],
    compute: v => calculateBoerLBM(v.weight, v.height, v.gender),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.lbm} kg</div>
        <div className="result-category cat-success">Lean Body Mass</div>
        <ResultRow label="Lean body mass" value={`${r.lbm} kg`} color="success" />
        <ResultRow label="Estimated fat mass" value={`${r.fatMass} kg`} />
        <ResultRow label="Lean share of weight" value={`${r.lbmPct}%`} />
      </div>
    ),
    guidance: [
      'Lean body mass — everything that is not fat, including muscle, bone, water, and organs — is the engine of your metabolism and the reference clinicians use for medication dosing.',
      'The Boer equation is well validated for adults of average build but loses accuracy at extremes of muscularity or obesity, where DEXA or bioimpedance give better answers.',
      'To grow lean mass, pair progressive resistance training with adequate protein (around 1.6–2.2 g/kg/day); to preserve it while losing weight, keep the calorie deficit moderate.',
    ],
  },

  /* ── ENERGY & MACROS ── */
  calorie_target: {
    formula: 'Wishnofsky 7,700 kcal/kg rule',
    intro: 'Turns your TDEE into a daily calorie target for fat loss, maintenance, or muscle gain at the weekly rate you choose.',
    fields: [
      { key: 'tdee', label: 'Daily energy needs / TDEE (kcal)', type: 'number', min: 800, max: 8000, unit: 'kcal', placeholder: '2400', hint: 'Use the TDEE calculator above if unsure' },
      { key: 'goal', label: 'Goal', type: 'select', options: [
        { value: 'lose', label: 'Lose fat' }, { value: 'maintain', label: 'Maintain weight' }, { value: 'gain', label: 'Gain muscle' },
      ]},
      { key: 'rate', label: 'Weekly rate (kg)', type: 'select', options: [
        { value: '0.25', label: '0.25 kg/week — gentle' }, { value: '0.5', label: '0.5 kg/week — standard' },
        { value: '0.75', label: '0.75 kg/week — aggressive' }, { value: '1', label: '1.0 kg/week — maximum' },
      ]},
    ],
    compute: v => calculateCalorieTarget(v.tdee, v.goal, parseFloat(v.rate)),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.target.toLocaleString()} kcal</div>
        <div className="result-category cat-success">{r.label} target</div>
        <ResultRow label="Your TDEE" value={`${r.tdee.toLocaleString()} kcal`} />
        <ResultRow label="Daily adjustment" value={`${r.dailyDelta > 0 ? '−' : '+'}${r.dailyDelta.toLocaleString()} kcal`} color={r.label === 'Fat Loss' ? 'warning' : 'success'} />
        <ResultRow label="Expected pace" value={`${r.rateKgPerWeek} kg/week`} />
        {r.safetyNote && <p className="calc-safety-note">{r.safetyNote}</p>}
      </div>
    ),
    guidance: [
      'One kilogram of body fat stores roughly 7,700 kcal, so a 550 kcal daily deficit produces about 0.5 kg of fat loss per week — the math behind this target.',
      'Faster than ~0.75–1 kg per week increasingly costs you muscle, energy, and adherence; slow loss is far more likely to stay lost.',
      'For muscle gain, a modest surplus of 200–400 kcal/day builds tissue with minimal fat gain — the "eat everything" bulk is outdated advice.',
    ],
  },

  fiber: {
    formula: 'IOM / Food & Nutrition Board',
    intro: 'Daily fibre target from the Institute of Medicine: 14 g per 1,000 kcal, with Adequate Intakes of 38 g (men) and 25 g (women).',
    fields: [
      { key: 'tdee', label: 'Daily calories (kcal)', type: 'number', min: 800, max: 8000, unit: 'kcal', placeholder: '2400', hint: 'Use the TDEE calculator if unsure' },
      { key: 'gender', label: 'Sex', type: 'select', options: GENDER },
    ],
    compute: v => calculateFiberNeeds(v.tdee, v.gender),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.recommended} g</div>
        <div className="result-category cat-success">Daily fibre target</div>
        <ResultRow label="From your calories (14 g / 1,000 kcal)" value={`${r.fromCalories} g`} />
        <ResultRow label="Adequate Intake for your sex" value={`${r.ai} g`} />
      </div>
    ),
    guidance: [
      'The Institute of Medicine ties fibre to energy intake — 14 g per 1,000 kcal — because bigger eaters need more bulk for the same protective effect.',
      'Most adults manage barely half their target. Add 5 g per week rather than all at once, and drink extra water, or bloating and cramping follow.',
      'Fibre feeds beneficial gut bacteria, steadies blood sugar, and improves satiety — beans, lentils, oats, and vegetables are the cheapest high-fibre foods.',
    ],
  },

  /* ── CLINICAL ── */
  must_score: {
    formula: 'MUST — BAPEN',
    intro: 'The Malnutrition Universal Screening Tool (BAPEN): BMI, unplanned weight loss, and acute illness combine into a 0–6 risk score used in hospitals worldwide.',
    fields: [
      { key: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, placeholder: '22' },
      { key: 'loss', label: 'Unplanned weight loss, past 3–6 months (%)', type: 'number', min: 0, max: 50, unit: '%', placeholder: '0' },
      { key: 'acute', label: 'Acutely ill with no nutritional intake for >5 days?', type: 'select', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' },
      ]},
    ],
    compute: v => calculateMUSTScore(v.bmi, v.loss, v.acute === 'yes'),
    render: r => (
      <div className="result-details">
        <div className="result-big">Score: {r.total} / 6</div>
        <div className={`result-category cat-${r.color}`}>{r.risk}</div>
        <ResultRow label="BMI component" value={`${r.bmiScore} pt`} />
        <ResultRow label="Weight-loss component" value={`${r.lossScore} pt`} />
        <ResultRow label="Acute disease component" value={`${r.acuteScore} pt`} />
        <p className="calc-safety-note">{r.action}</p>
      </div>
    ),
    guidance: [
      'MUST is a screening tool, not a diagnosis — it flags who needs a dietitian\'s assessment, and a score of 2 or more should trigger referral and a nutrition care plan.',
      'Weight and appetite change fast during illness, so re-screening matters: weekly in care settings, and any time intake drops.',
      'If someone you care for scores 1 or more, document everything they eat and drink for 3 days — that record is exactly what the clinician will ask for.',
    ],
  },

  corrected_calcium: {
    formula: "Payne's formula (1973)",
    intro: 'Adjusts measured blood calcium for albumin level, since ~40% of calcium rides on albumin and low albumin falsely lowers the lab value.',
    fields: [
      { key: 'ca', label: 'Measured calcium (mg/dL)', type: 'number', min: 4, max: 16, unit: 'mg/dL', placeholder: '9.2', hint: 'Normal lab range: 8.5–10.5' },
      { key: 'albumin', label: 'Albumin (g/dL)', type: 'number', min: 1, max: 6, unit: 'g/dL', placeholder: '4.0' },
    ],
    compute: v => calculateCorrectedCalcium(v.ca, v.albumin),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.corrected.toFixed(2)} mg/dL</div>
        <div className={`result-category cat-${r.color}`}>{r.status}</div>
        <ResultRow label="Normal range" value="8.5 – 10.5 mg/dL" color="success" />
      </div>
    ),
    guidance: [
      "Payne's 1973 correction — measured calcium + 0.8 × (4.0 − albumin) — exists because the lab reports total calcium while the body cares about the free, ionised fraction.",
      'Always judge calcium status on the corrected value, not the raw lab number — especially in illness, liver disease, or malnutrition where albumin runs low.',
      'Genuinely high or low calcium affects heart rhythm, muscle, and nerves, so abnormal results deserve prompt medical review — never adjust supplements or medication on this number alone.',
    ],
  },

  iron: {
    formula: 'IOM / Food & Nutrition Board RDA',
    intro: 'Your daily iron requirement (RDA) by age, sex, and life stage — from the Institute of Medicine reference tables.',
    fields: [
      { key: 'age', label: 'Age (years)', type: 'number', min: 0, max: 100, placeholder: '30' },
      { key: 'gender', label: 'Sex', type: 'select', options: GENDER },
      { key: 'stage', label: 'Life stage', type: 'select', options: [
        { value: 'none', label: 'None of these' }, { value: 'pregnant', label: 'Pregnant' }, { value: 'lactating', label: 'Breastfeeding' },
      ]},
    ],
    compute: v => calculateIronNeeds(v.age, v.gender, v.stage),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.rda} mg/day</div>
        <div className="result-category cat-success">Iron RDA</div>
        <ResultRow label="Reference group" value={r.group} />
      </div>
    ),
    guidance: [
      'Iron needs peak in pregnancy (27 mg/day) because maternal blood volume expands by nearly half — menstruating women need more than twice what men need.',
      'Haem iron from meat and fish absorbs two to three times better than plant iron; vitamin C at the meal boosts plant-iron absorption, while tea and coffee with meals block it.',
      'Fatigue with pale skin or brittle nails warrants a ferritin blood test — but never supplement iron blindly, because excess iron is toxic and masks other causes.',
    ],
  },

  breastfeeding: {
    formula: 'IOM energy +330 / +400 kcal',
    intro: 'Extra daily calories for breastfeeding mothers, per Institute of Medicine guidance: +330 kcal/day (0–6 months), +400 kcal/day (6–12 months).',
    fields: [
      { key: 'tdee', label: 'Pre-pregnancy daily needs / TDEE (kcal)', type: 'number', min: 1000, max: 5000, unit: 'kcal', placeholder: '2200' },
      { key: 'age', label: "Infant's age (months)", type: 'number', min: 0, max: 12, placeholder: '3' },
    ],
    compute: v => calculateBreastfeedingCalories(v.tdee, v.age),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.total.toLocaleString()} kcal</div>
        <div className="result-category cat-success">Daily target while breastfeeding</div>
        <ResultRow label="Pre-pregnancy needs" value={`${r.base.toLocaleString()} kcal`} />
        <ResultRow label="Breastfeeding extra" value={`+${r.extra} kcal`} color="success" />
        <ResultRow label="Phase" value={r.phase} />
      </div>
    ),
    guidance: [
      'Milk production is metabolically expensive — about 500–670 kcal/day — and the Institute of Medicine expects roughly 170 kcal of that to come from pregnancy fat stores, leaving +330/+400 kcal to eat.',
      'Undereating while nursing risks depleting your own iron, calcium, iodine, and DHA stores rather than just making you hungry, so keep a postnatal multivitamin and prioritise protein.',
      'Gradual weight loss of up to ~0.5 kg per week is considered safe while breastfeeding; aggressive dieting can reduce milk supply.',
    ],
  },

  /* ── HYDRATION ── */
  sweat_rate: {
    formula: 'ACSM sweat-rate equation',
    intro: 'Your personal fluid loss per hour of exercise — the foundation of any serious hydration plan (ACSM guidelines).',
    fields: [
      { key: 'pre', label: 'Weight before exercise (kg)', type: 'number', min: 30, max: 200, unit: 'kg', placeholder: '75' },
      { key: 'post', label: 'Weight after exercise (kg)', type: 'number', min: 30, max: 200, unit: 'kg', placeholder: '74' },
      { key: 'fluid', label: 'Fluid drunk during (litres)', type: 'number', min: 0, max: 10, unit: 'L', placeholder: '1' },
      { key: 'urine', label: 'Urine passed during (litres)', type: 'number', min: 0, max: 3, unit: 'L', placeholder: '0' },
      { key: 'hours', label: 'Duration (hours)', type: 'number', min: 0.25, max: 12, placeholder: '1' },
    ],
    compute: v => {
      if (v.post > v.pre && v.fluid === 0) throw new Error('Post-exercise weight is higher but no fluid was drunk — please check your numbers.');
      return calculateSweatRate(v.pre, v.post, v.fluid, v.urine, v.hours);
    },
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.litresPerHour} L/h</div>
        <div className={`result-category cat-${r.color}`}>{r.level} sweater</div>
        <ResultRow label="Fluid loss" value={`${r.mlPerHour} mL per hour`} />
        <ResultRow label="Replace during exercise" value={`~${Math.round(r.mlPerHour * 0.8)}–${r.mlPerHour} mL/h`} color="success" />
      </div>
    ),
    guidance: [
      'Sweat rate is deeply personal — it varies with body size, fitness, heat, and humidity — which is why generic "drink 500 mL per hour" advice fails many athletes.',
      'Weigh yourself nude before and after key sessions in different conditions; that single habit builds a hydration plan no app can match.',
      'Aim to replace roughly 80–100% of losses, and treat a body-weight drop above 2% as a sign you under-replaced. Chronic over-drinking is equally dangerous.',
    ],
  },

  sodium_loss: {
    formula: 'Sweat [Na⁺] × sweat rate',
    intro: 'Estimates sodium lost per hour from your sweat rate and sweat sodium concentration — critical for sessions over 2 hours or in heat.',
    fields: [
      { key: 'rate', label: 'Sweat rate (L/h)', type: 'number', min: 0, max: 4, unit: 'L/h', placeholder: '1.2', hint: 'Use the Sweat Rate calculator' },
      { key: 'sodium', label: 'Sweat sodium (mg/L)', type: 'number', min: 460, max: 1840, unit: 'mg/L', placeholder: '1000', hint: 'Average ≈ 1000; salty sweaters higher' },
      { key: 'hours', label: 'Duration (hours)', type: 'number', min: 0.5, max: 12, placeholder: '2' },
    ],
    compute: v => calculateSodiumLoss(v.rate, v.sodium, v.hours),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.mgPerHour.toLocaleString()} mg/h</div>
        <div className="result-category cat-warning">{r.level}</div>
        <ResultRow label="Total sodium lost" value={`${r.totalMg.toLocaleString()} mg`} />
        <ResultRow label="≈ Table-salt equivalent" value={`${r.saltEquivalentG} g`} />
      </div>
    ),
    guidance: [
      'Sweat sodium averages about 1,000 mg per litre but ranges from ~460 to ~1,840 — "salty sweaters" with white stains on kit lose far more than average.',
      'Beyond about two hours, or in serious heat, replacing water without sodium dilutes blood sodium and risks hyponatraemia — this is when electrolyte drinks earn their place.',
      'After the session, salty foods and electrolyte drinks replace losses well; most commercial sports drinks supply 300–600 mg of sodium per hour of sipping.',
    ],
  },

  urine_check: {
    formula: 'Armstrong urine colour chart',
    intro: 'Match your urine colour to the validated 8-point Armstrong chart for an instant hydration read — free and surprisingly reliable.',
    fields: [
      { key: 'colour', label: 'Urine colour (1 = palest, 8 = darkest)', type: 'select', options: [
        { value: '1', label: '1 — Pale straw' }, { value: '2', label: '2 — Light yellow' },
        { value: '3', label: '3 — Yellow' }, { value: '4', label: '4 — Dark yellow' },
        { value: '5', label: '5 — Amber' }, { value: '6', label: '6 — Dark amber' },
        { value: '7', label: '7 — Orange-brown' }, { value: '8', label: '8 — Brownish' },
      ]},
    ],
    compute: v => checkUrineHydration(parseInt(v.colour, 10)),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.colour} / 8</div>
        <div className={`result-category cat-${r.color}`}>{r.status}</div>
        <p className="calc-safety-note">{r.advice}</p>
      </div>
    ),
    guidance: [
      'The Armstrong chart is a genuine field-validated tool: colours 1–3 mean you are well hydrated, 4–5 mildly dehydrated, and 6–8 dehydrated.',
      'Judge daytime samples, not first-morning urine, which is always darker. B-vitamins, beetroot, and some medications darken urine without any dehydration.',
      'Use the chart alongside thirst and daily body weight — together the three give a hydration picture no single measure can.',
    ],
  },

  /* ── MATERNAL & CHILD ── */
  infant_formula: {
    formula: '≈150 mL/kg/day (paediatric)',
    intro: 'Daily formula volume for healthy term infants — the standard paediatric estimate of ~150 mL/kg/day (range 120–180).',
    fields: [
      { key: 'weight', label: "Baby's weight (kg)", type: 'number', min: 1, max: 15, unit: 'kg', placeholder: '5' },
      { key: 'feeds', label: 'Feeds per day', type: 'number', min: 4, max: 12, placeholder: '8' },
    ],
    compute: v => calculateInfantFormula(v.weight, Math.round(v.feeds)),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.dailyMl} mL</div>
        <div className="result-category cat-success">Per day</div>
        <ResultRow label="Normal range" value={r.dailyRange} color="success" />
        <ResultRow label="Per feed" value={`≈ ${r.perFeed} mL × ${r.feedsPerDay} feeds`} />
      </div>
    ),
    guidance: [
      'This 150 mL/kg/day figure is a widely used estimate for healthy term infants — a starting guide, not a prescription, and appetite legitimately varies day to day.',
      'Steady weight gain, 6+ wet nappies a day, and a content baby between feeds matter far more than hitting an exact millilitre count.',
      'Always confirm feeding volumes with your paediatrician — especially for preterm or unwell babies — and prepare formula exactly per the tin: never dilute it to stretch supply.',
    ],
  },

  /* ── SPORTS PERFORMANCE ── */
  athlete_protein: {
    formula: 'ISSN position stand',
    intro: 'Daily protein for athletes from the International Society of Sports Nutrition: 1.2–1.4 g/kg (endurance), 1.4–1.7 (team), 1.6–2.2 (strength).',
    fields: [
      { key: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 200, unit: 'kg', placeholder: '70' },
      { key: 'sport', label: 'Sport type', type: 'select', options: [
        { value: 'endurance', label: 'Endurance — running, cycling, swimming' },
        { value: 'team', label: 'Team / intermittent — football, cricket, hockey' },
        { value: 'strength', label: 'Strength / power — lifting, wrestling' },
      ]},
    ],
    compute: v => calculateAthleteProtein(v.weight, v.sport),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.optimal} g</div>
        <div className="result-category cat-success">Optimal daily protein</div>
        <ResultRow label="Sport" value={r.label} />
        <ResultRow label="Recommended range" value={`${r.min}–${r.max} g/day`} color="success" />
        <ResultRow label="Per meal (4 meals)" value={`≈ ${r.perMeal} g`} />
      </div>
    ),
    guidance: [
      'Athletes need far more protein than the 0.8 g/kg general RDA — the ISSN evidence supports up to 2.2 g/kg/day for strength athletes in heavy training.',
      'Distribution matters as much as total: 3–4 meals each supplying 0.3–0.4 g/kg maximally stimulates muscle protein synthesis across the day.',
      'Beyond ~2.2 g/kg, extra protein shows little added benefit for most athletes — build the base from whole foods and use supplements only to fill gaps.',
    ],
  },

  carb_loading: {
    formula: 'Burke et al. classical protocol',
    intro: 'The classical carbohydrate-loading protocol for endurance events over ~90 minutes: 10–12 g/kg/day for 36–48 hours beforehand.',
    fields: [
      { key: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 200, unit: 'kg', placeholder: '70' },
    ],
    compute: v => calculateCarbLoading(v.weight),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.target} g</div>
        <div className="result-category cat-success">Carbs per day × 2 days</div>
        <ResultRow label="Loading range" value={`${r.min}–${r.max} g/day`} color="success" />
        <ResultRow label="Per meal (4 meals)" value={`≈ ${r.perMeal} g`} />
        <ResultRow label="When" value={r.days} />
      </div>
    ),
    guidance: [
      'Carb loading super-compensates muscle glycogen, the limiting fuel in events beyond 90 minutes — the 10–12 g/kg/day protocol is the most evidence-backed version.',
      'Each gram of glycogen stores ~3 g of water, so expect 1–2 kg of scale gain during the load: that is fuel in the tank, not fat.',
      'Taper training during the load and practise the full protocol before a lower-stakes race — debuting 700+ g of carbs on race day invites gut disaster.',
    ],
  },

  preworkout_carbs: {
    formula: 'ACSM / ISSN 1–4 g/kg guidance',
    intro: 'Pre-exercise carbohydrate scaled to timing: ~1 g/kg an hour out, up to 3–4 g/kg with 3–4 hours to digest (ACSM/ISSN).',
    fields: [
      { key: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 200, unit: 'kg', placeholder: '70' },
      { key: 'hours', label: 'Hours until exercise', type: 'number', min: 0.5, max: 4, placeholder: '2' },
    ],
    compute: v => calculatePreWorkoutCarbs(v.weight, v.hours),
    render: r => (
      <div className="result-details">
        <div className="result-big">{r.min}–{r.max} g</div>
        <div className="result-category cat-success">Carbs before training</div>
        <ResultRow label="Timing" value={r.timing} />
      </div>
    ),
    guidance: [
      'The pre-exercise meal tops up liver glycogen and defends blood sugar — the closer to the session, the smaller and simpler the meal should be.',
      'Keep fibre and fat low in the final hour; they slow digestion and are the usual culprits behind mid-session stomach trouble.',
      'For early-morning training, even a banana or toast beats training fully fasted — small, familiar, and eaten 30–60 minutes out.',
    ],
  },
};

/* id → component, built once */
const componentCache = {};
export function getNewCalcComponent(id) {
  if (!DEFS[id]) return null;
  if (!componentCache[id]) {
    const def = DEFS[id];
    componentCache[id] = function NewCalc({ meta }) {
      return <SchemaCalc meta={meta} def={def} />;
    };
  }
  return componentCache[id];
}

export const NEW_CALC_IDS = Object.keys(DEFS);
export { CalcIcon, CALC_ICON_NAMES };
