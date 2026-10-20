import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { explainStudioPreview } from '../services/api.js';
import '../styles/diet-plan-studio.css';
import StudioPlanner from '../components/StudioPlanner.jsx';
import StudioMealScene from '../components/StudioMealScene.jsx';

const REGIONS = {
  pk: { name: 'Pakistan', breakfast: 'Egg, chapati & plain yoghurt', lunch: 'Chicken, chapati & cucumber salad', dinner: 'Masoor dal, rice & seasonal vegetables', pantry: 'Atta · dal · rice · seasonal vegetables · yoghurt' },
  in: { name: 'India', breakfast: 'Vegetable poha & plain curd', lunch: 'Rajma, rice & cucumber salad', dinner: 'Moong dal, roti & seasonal vegetables', pantry: 'Atta · pulses · rice · curd · seasonal vegetables' },
  bd: { name: 'Bangladesh', breakfast: 'Egg, roti & plain yoghurt', lunch: 'Fish, rice & seasonal vegetables', dinner: 'Masoor dal, rice & cucumber salad', pantry: 'Rice · lentils · fish · eggs · seasonal vegetables' },
  sa: { name: 'Saudi Arabia', breakfast: 'Egg, wholewheat khubz & cucumber', lunch: 'Chicken, rice & mixed salad', dinner: 'Lentil soup, khubz & plain yoghurt', pantry: 'Rice · lentils · khubz · chicken · yoghurt' },
  ae: { name: 'United Arab Emirates', breakfast: 'Labneh, wholewheat khubz & cucumber', lunch: 'Grilled chicken, rice & salad', dinner: 'Chickpea stew & wholewheat khubz', pantry: 'Khubz · chickpeas · rice · labneh · vegetables' },
  ca: { name: 'Canada', breakfast: 'Oats, milk & apple', lunch: 'Chicken, brown rice & carrots', dinner: 'Lentil soup, wholegrain bread & salad', pantry: 'Oats · lentils · rice · frozen vegetables · milk' },
  us: { name: 'United States', breakfast: 'Oats, milk & banana', lunch: 'Chicken, brown rice & vegetables', dinner: 'Bean chilli, wholegrain bread & salad', pantry: 'Oats · beans · rice · frozen vegetables · eggs' },
};
const TIERS = [
  { name: 'Starter', price: 'Free', period: 'with your free account', count: '2 diet plans to get started', detail: 'Explore a planning routine that fits your everyday life.', features: ['2 plans total, not a monthly renewal', 'Daily or weekly planning', 'Regional food preferences', 'Sample formats to explore'], cta: 'Free access coming soon' },
  { name: 'Guided', price: '1,500', period: 'PKR / month · proposed', count: 'Up to 30 diet plans each month', detail: 'More room to plan, with guidance on the plans you create.', features: ['30 plans per billing month', 'Consultation on your created plans', 'Portion and food-swap preferences', 'Planned Word & PDF downloads'], cta: 'Guided access coming soon', featured: true },
  { name: 'Complete', price: '3,000', period: 'PKR / month · proposed', count: 'Unlimited diet-plan creation', detail: 'A flexible planning workspace with ongoing consultation support.', features: ['Unlimited personal plan creation', 'Consultation support included', 'Daily & weekly formats', 'Planned Word & PDF downloads'], cta: 'Complete access coming soon' },
];
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DietPlanStudio() {
  const { isAdmin } = useAuth();
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiRegion, setAiRegion] = useState('');
  const [region, setRegion] = useState('pk');
  const [duration, setDuration] = useState('daily');
  const [format, setFormat] = useState('journal');
  const [category, setCategory] = useState('Everyday balance');
  const foods = REGIONS[region];
  useSEO({ title: 'Diet Plan Studio — Coming Soon', description: 'Preview region-aware daily and weekly diet planning, planned membership tiers and downloadable formats. Diet Plan Studio is coming soon.' });
  return <div className="dps-page">
    <div className="studio-hero-track"><header className="dps-hero"><div className="dps-hero-copy"><p className="dps-kicker">A NEW WAY TO PLAN WITH DIETANDWELL</p><h1>Diet Plan Studio</h1><div className="dps-coming"><span/>Available soon <small>Currently in development</small></div><h2>Make your own diet plan.<br/><em>Built around your life.</em></h2><p>Familiar foods. Thoughtful portions. A daily or weekly plan shaped around your region, routine and preferences—with professional guidance when you need it.</p><div className="dps-actions"><a href="#studio-preview" className="dps-button">Explore the sample studio ↗</a><a href="#studio-plans" className="dps-text-link">See planned memberships</a></div><p className="dps-hero-note">Preview the experience today. Plan generation, membership checkout and downloads will open at launch.</p></div><div className="dps-hero-art"><StudioMealScene /></div></header></div>

    <section className="dps-section dps-intro"><p className="dps-kicker">FROM PREFERENCES TO A PRACTICAL PLAN</p><h2>Less guesswork.<br/>More everyday possibility.</h2><div className="dps-feature-grid">{[['01','Tell us about you','At launch, your private workspace will bring together goals, preferences, dietary restrictions and daily routine.'],['02','Choose a local approach','Pick your country, planning period and preferred format. Availability and suitable alternatives will be checked against a curated regional catalogue.'],['03','Review, refine & keep','Review portions and nutrition estimates, request supported food swaps, and download your finished plan in Word or PDF.']].map(([n,t,p])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>

    <section id="studio-plans" className="dps-section dps-plans"><p className="dps-kicker">PLANNED MEMBERSHIPS</p><h2>A place to start.<br/>Room to grow.</h2><p>Proposed launch prices in Pakistani rupees. No payments or subscriptions are being taken for Diet Plan Studio yet.</p><div className="dps-pricing-grid">{TIERS.map(t=><article className={`dps-price-card ${t.featured?'is-featured':''}`} key={t.name}>{t.featured && <span className="dps-recommended">FOR REGULAR PLANNING</span>}<h3>{t.name}</h3><p>{t.detail}</p><div className="dps-price">{t.price}</div><small>{t.period}</small><h4>{t.count}</h4><ul>{t.features.map(f=><li key={f}>{f}</li>)}</ul><button disabled>{t.cta}</button></article>)}</div><p className="dps-terms">Planned counting rule: one daily plan or one complete seven-day plan counts as one plan. Consultation scheduling, response times and fair-use terms will be published before launch. Unlimited plan creation does not mean unlimited live appointments.</p></section>

    <StudioPlanner />

    <section className="dps-section dps-data"><div><p className="dps-kicker">A FOOD-DATA FOUNDATION</p><h2>Local relevance.<br/>Traceable nutrition.</h2><p>The planned service will calculate nutrition from linked, reviewed food-composition records. AI will help organise and explain plans; nutrient calculations will come from food records and ingredient weights.</p><p>Source integration and clinical review are still in development. We do not yet claim a verified regional database is connected.</p><a href="https://fdc.nal.usda.gov/" target="_blank" rel="noreferrer">Explore USDA FoodData Central ↗</a><br/><a href="https://www.fao.org/infoods/infoods/tables-and-databases/asia/en/" target="_blank" rel="noreferrer">Explore FAO/INFOODS regional sources ↗</a></div><div className="dps-data-card"><h3>What your future profile will include</h3><ul>{['Country, city, food access and budget','Age, height, weight, activity and goals','Allergies, intolerances and excluded ingredients','Food preferences, cultural and religious needs','Meal timing, household portions and cooking facilities','Relevant health context and clinician-set targets, where appropriate'].map(s=><li key={s}>{s}</li>)}</ul><p>Personal information will be collected in the future signed-in workspace with clear consent and privacy controls.</p></div></section>

    <section className="dps-section"><p className="dps-kicker">THOUGHTFUL AI · PLANNED FOR LAUNCH</p><h2>Intelligence with a purpose.</h2><div className="dps-feature-grid">{[['Regional food swaps','Suggest alternatives from the approved local catalogue, then recalculate portions and nutrients.'],['A practical shopping list','Turn a weekly plan into consolidated quantities and a preparation checklist, with clear raw/cooked units.'],['Explain my plan','Explain the reasoning in plain language, with multilingual support planned for English, Urdu and Arabic.']].map(([t,p])=><article key={t}><span>IN DEVELOPMENT</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>

    {isAdmin && <section className="dps-section dps-ai-test"><p className="dps-kicker">ADMINISTRATOR PREVIEW</p><h2>Try a real AI explanation.</h2><p>Uses only the sample pantry for {foods.name}. No personal or health information is sent. Requires the server AI provider to be configured.</p><button className="dps-button" disabled={aiBusy} onClick={async()=>{setAiBusy(true);setAiText('');setAiError('');const selected=region;setAiRegion(REGIONS[selected].name);try{const result=await explainStudioPreview(selected);setAiText(result.explanation);}catch(e){setAiError(e.message);}finally{setAiBusy(false);}}}>{aiBusy?'Preparing explanation…':'Explain this sample pantry with AI'}</button>{aiError && <p role="alert">{aiError}</p>}{aiText && <div aria-live="polite"><h3>AI example · {aiRegion}</h3><p style={{whiteSpace:'pre-wrap'}}>{aiText}</p></div>}</section>}
    <section className="dps-section dps-clinical"><h2>Planning support, with professional care.</h2><p>Always consult a qualified nutritionist or clinical dietitian before implementing a diet plan. Food-composition data and calorie estimates cannot account for every individual need. Medical conditions, pregnancy, childhood nutrition and complex allergies require appropriate professional assessment.</p><Link className="dps-button" to="/contact">Talk to DietAndWell</Link><Link className="dps-text-link" to="/services">Explore current services →</Link></section>
  </div>;
}
