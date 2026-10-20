import { useState } from 'react';
import '../../styles/calculator-motion.css';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button.jsx';
import { saveCalculatorResult, isLoggedIn } from '../../services/api.js';

/* ── CalcUI — shared building blocks for all calculator panels ── */

/* ── SVG icon set (no emojis). 24×24, stroke = currentColor ── */
const P = {
  scale:   <><path d="M12 3v18M5 7l7-4 7 4" /><path d="M3 13l2-6 2 6a3.5 3.5 0 0 1-4 0zm14 0l2-6 2 6a3.5 3.5 0 0 1-4 0z" /><path d="M8 21h8" /></>,
  person:  <><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-4 3-7 7-7s7 3 7 7" /></>,
  muscle:  <><path d="M7 8c-2 0-3.5 1.5-3.5 3.5S5 15 7 15c1 1.5 2.5 2 4 2 3 0 5.5-2.5 5.5-5.5S14 6 11 6c-1.5 0-3 .5-4 2z" /><path d="M16.5 9.5l2-2M18 12l2.5-.5M16 14.5l2 1.5" /></>,
  target:  <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>,
  ruler:   <><rect x="3" y="9" width="18" height="6" rx="1" /><path d="M7 9v3M11 9v3M15 9v3M19 9v3" /></>,
  gauge:   <><path d="M4 15a8 8 0 1 1 16 0" /><path d="M12 15l4-5" /><path d="M4 19h16" /></>,
  flame:   <><path d="M12 3c1 4-4 6-4 11a4.5 4.5 0 0 0 9 0c0-2-1-3.5-2-5-.5 1.5-1.5 2-2.5 2C12.5 8 12 5 12 3z" /></>,
  bolt:    <><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></>,
  plate:   <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></>,
  chart:   <><path d="M4 20V10M10 20V4M16 20v-8M21 20H3" /></>,
  protein: <><ellipse cx="12" cy="12" rx="7" ry="9" /><path d="M12 3v18M7 8c2 2 8 2 10 0" /></>,
  leaf:    <><path d="M5 19C5 9 13 4 20 4c0 8-5 15-15 15z" /><path d="M5 19c3-5 7-9 11-11" /></>,
  clip:    <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h6" /></>,
  beaker:  <><path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" /><path d="M8.5 15h7" /></>,
  pill:    <><rect x="4" y="9" width="16" height="7" rx="3.5" transform="rotate(-35 12 12)" /><path d="M10 10l4 4" /></>,
  bottle:  <><path d="M10 2h4v4l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3V2z" /><path d="M8 13h8" /></>,
  drop:    <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></>,
  waves:   <><path d="M2 9c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" /><path d="M2 15c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" /></>,
  salt:    <><path d="M8 3h8l1 9H7l1-9z" /><path d="M7 12v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8" /><circle cx="12" cy="16" r="1" fill="currentColor" /><circle cx="9.5" cy="18" r="1" fill="currentColor" /><circle cx="14.5" cy="18" r="1" fill="currentColor" /></>,
  cup:     <><path d="M6 3h12l-1.5 17a2 2 0 0 1-2 1.8h-5A2 2 0 0 1 7.5 20L6 3z" /><path d="M6.8 9h10.4" /></>,
  baby:    <><circle cx="12" cy="12" r="8" /><circle cx="9.5" cy="11" r="1" fill="currentColor" /><circle cx="14.5" cy="11" r="1" fill="currentColor" /><path d="M9 15c1 1 5 1 6 0" /></>,
  heart:   <><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" /></>,
  pulse:   <><path d="M2 12h4l2-6 4 12 3-8 2 2h5" /></>,
  shield:  <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>,
  glass:   <><path d="M6 3h12l-1 7a5 5 0 0 1-10 0L6 3z" /><path d="M12 15v6M8 21h8" /></>,
  syringe: <><path d="M4 20l4-1 9-9-3-3-9 9-1 4z" /><path d="M14 7l3 3M17 4l3 3M20 1l3 3" /></>,
  dumbbell:<><path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" /></>,
  timer:   <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></>,
  cycle:   <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
};

export function CalcIcon({ name = 'plate', size = 22, className = '' }) {
  return (
    <svg
      className={`calc-svg-icon ${className}`}
      data-motion={name}
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      {P[name] || P.plate}
    </svg>
  );
}

/* Map every calculator id → icon name */
export const CALC_ICON_NAMES = {
  bmi: 'scale', body_fat: 'person', lean_mass: 'muscle', ideal_weight: 'target',
  waist_hip: 'ruler', waist_height: 'gauge',
  bmr: 'flame', tdee: 'bolt', calorie_target: 'plate', macros: 'chart',
  protein: 'protein', fiber: 'leaf',
  must_score: 'clip', corrected_calcium: 'beaker', iron: 'pill',
  breastfeeding: 'bottle', cholesterol: 'shield',
  water: 'drop', sweat_rate: 'waves', sodium_loss: 'salt', urine_check: 'cup',
  pregnancy_weight: 'heart', child_bmi: 'baby', infant_formula: 'bottle',
  fertility: 'cycle',
  athlete_protein: 'dumbbell', carb_loading: 'bolt', preworkout_carbs: 'timer',
  heart_rate: 'pulse', vo2max: 'pulse',
  alcohol: 'glass', dosage: 'syringe',
};

export function FormGroup({ label, children, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, hint }) {
  return (
    <FormGroup label={label} hint={hint}>
      <select className="calc-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FormGroup>
  );
}

export function UnitToggle({ unit, onChange, options }) {
  return (
    <div className="unit-toggle">
      {options.map(o => (
        <button
          key={o.value}
          className={`unit-btn ${unit === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ResultCard({ children, animate = true }) {
  return (
    <div className={`calc-result-card ${animate ? 'slide-in' : ''}`}>
      {children}
    </div>
  );
}

export function ResultRow({ label, value, color, note }) {
  return (
    <div className={`result-row ${color ? `color-${color}` : ''}`}>
      <span className="result-label">{label}</span>
      <span className="result-value">{value}</span>
      {note && <span className="result-note">{note}</span>}
    </div>
  );
}

/* ── Save Result — POST /calculators/calculate/save (JWT) ──
   Guests are sent to login; the button then shows success/error. */
export function SaveResult({ type, inputData }) {
  const navigate = useNavigate();
  const [state, setState] = useState('idle'); // idle | saving | saved | error
  const [msg, setMsg] = useState('');

  const save = async () => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: { pathname: '/calculators' } } });
      return;
    }
    setState('saving'); setMsg('');
    try {
      await saveCalculatorResult(type, inputData);
      setState('saved'); setMsg('Result saved to your profile.');
    } catch (e) {
      setState('error'); setMsg(`Could not save: ${e.message}`);
    }
  };

  return (
    <div className="save-result-row">
      <Button variant="outline" size="sm" onClick={save} disabled={state === 'saving'}>
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save Result'}
      </Button>
      {msg && <span className={`save-result-msg ${state === 'error' ? 'error' : 'ok'}`}>{msg}</span>}
    </div>
  );
}

export function CalcHeader({ meta, children, iconName }) {
  return (
    <div className="calc-panel-header">
      <div className="calc-panel-title">
        <span className="calc-panel-icon">
          <CalcIcon name={iconName || CALC_ICON_NAMES[meta?.id] || 'plate'} size={26} />
        </span>
        <div>
          <h3>{meta?.label}</h3>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Education-only disclaimer: shown on the landing AND every calculator ── */
export function CalcDisclaimer() {
  return (
    <p className="calc-disclaimer" role="note">
      This is for education only — not medical advice. Consult a qualified clinician.
    </p>
  );
}
