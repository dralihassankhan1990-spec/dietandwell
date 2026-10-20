import { useEffect, useRef, useState } from 'react';
import NutritionStillLife from './PhotographicScene.jsx';

const STEPS = [
  { title: 'Fuel', body: 'Every plan starts with your numbers — energy needs, macros, and hydration tuned to your body.' },
  { title: 'Balance', body: 'Whole foods, smart portions, and clinical insight keep blood sugar steady and energy high.' },
  { title: 'Thrive', body: 'Consistency compounds. Small daily wins become lasting metabolic health.' },
];
export default function NutritionJourney() {
  const ref=useRef(null);
  const [step,setStep]=useState(0);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;const r=ref.current.getBoundingClientRect();const p=Math.max(0,Math.min(.999,-r.top/Math.max(1,r.height-innerHeight)));setStep(Math.floor(p*3));};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
    return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);};
  },[]);
  return <section className="nutrition-journey" data-nutrition-track ref={ref} aria-label="The nutrition journey">
    <div className="nutrition-journey-pin">
      <div className="nutrition-journey-art"><NutritionStillLife/></div>
      <div className="nutrition-journey-copy"><p className="nutrition-eyebrow">How it works</p>
        {STEPS.map((s,i)=><div className={`nutrition-chapter ${step===i?'is-active':''}`} key={s.title}><span className="nutrition-chapter-number">0{i+1} / 03</span><h2>{s.title}<em>.</em></h2><p>{s.body}</p></div>)}
        <div className="nutrition-chapter-progress" aria-hidden="true">{STEPS.map((s,i)=><span className={step>=i?'is-active':''} key={s.title}/>)}</div>
      </div>
    </div>
  </section>;
}
