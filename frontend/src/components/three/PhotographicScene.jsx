import { useEffect, useRef } from 'react';
import './photographic-scene.css';
import './ingredient-scroll.css';

// Layered photographic artwork: native scrolling, no GPU canvas or video download.
export default function PhotographicScene() {
  const ref = useRef(null);
  useEffect(() => {
    const el=ref.current, track=el.closest('[data-nutrition-track]') || el, motion=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0;
    const update=()=>{frame=0;const r=track.getBoundingClientRect();const p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight)));el.style.setProperty('--spread',motion.matches?'0':(Math.sin(Math.PI*p)**1.4).toFixed(4));};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);motion.addEventListener('change',schedule);update();
    return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);motion.removeEventListener('change',schedule);};
  },[]);
  return <div ref={ref} className="food-scene" aria-label="A balanced bowl of vegetables, whole grains and fruit">
    <div className="food-scene-orbit" aria-hidden="true" />
    <div className="food-scene-plate"><img className="food-intact-top" src="/images/nutrition-bowl-v2.png" alt="" aria-hidden="true"/><div className="food-ingredient-layers" aria-hidden="true">{[[-150,-110,-25],[0,-195,10],[150,-145,26],[-170,15,-18],[90,-30,15],[175,60,-12]].map(([x,y,turn],i)=><span key={i} className="food-ingredient-sprite" style={{backgroundPosition:`${(i%3)*50}% ${Math.floor(i/3)*100}%`,"--fly-x":`${x}px`,"--fly-y":`${y}px`,"--fly-turn":`${turn}deg`}}/>)}</div><svg className="food-dressing" viewBox="0 0 600 500" fill="none" aria-hidden="true"><path d="M350 10 C320 95 380 150 310 270" stroke="#e7c56d" strokeWidth="6" strokeLinecap="round"/><ellipse cx="310" cy="280" rx="95" ry="24" stroke="#eac369" strokeWidth="3"/>{Array.from({length:12},(_,i)=><ellipse key={i} cx={310+Math.cos(i*Math.PI/6)*130} cy={260+Math.sin(i*Math.PI/6)*55} rx="3" ry="7" fill="#eac369"/>)}</svg><img src="/images/nutrition-bowl-v2.png" alt="A colourful bowl with avocado, quinoa, chickpeas, leafy greens and citrus" width="1536" height="1024" decoding="async" /></div>
    <div className="food-scene-note food-scene-note--one" aria-hidden="true"><span>01 / PLANT VARIETY</span><strong>Colour on your plate.</strong><small>Whole foods. Everyday nourishment.</small></div>
    <div className="food-scene-note food-scene-note--two" aria-hidden="true"><span>02 / EVERYDAY BALANCE</span><strong>Small habits.<br/>Lasting change.</strong></div>
    <span className="food-scene-footnote" aria-hidden="true">NOURISH / BALANCE / THRIVE</span>
  </div>;
}
