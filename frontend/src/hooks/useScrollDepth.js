import { useEffect, useRef } from 'react';

// Scroll is never intercepted. Only decorative CSS variables are updated.
export default function useScrollDepth() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = element.getBoundingClientRect();
      const p = motion.matches ? 0 : Math.max(-1, Math.min(1, -r.top / innerHeight));
      element.style.setProperty('--depth-y', `${p * 65}px`);
      element.style.setProperty('--depth-turn', `${p * 8}deg`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule); motion.addEventListener('change', schedule); update();
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); motion.removeEventListener('change', schedule); };
  }, []);
  return ref;
}
