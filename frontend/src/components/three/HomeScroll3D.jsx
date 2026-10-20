import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* HomeScroll3D — Round 1, Part 3 (original implementation).
   NutritionJourney3D: a sticky pinned section (~300vh). Scroll progress
   drives three.js motion — a rotating ring of nutrient orbs, rising
   leaf/droplet shapes, parallax depth layers, and a gentle camera dolly —
   with three editorial steps cross-fading as you scroll.
   - Single canvas, paused offscreen via IntersectionObserver.
   - prefers-reduced-motion → one static frame + all steps shown plainly.
   ScrollParallax: subtle scroll-linked parallax on section headings using
   the independent CSS `translate` property (never fights .reveal
   transforms). Also reduced-motion aware. */

const GREEN = 0x0a6640;
const GREEN_SOFT = 0x35a06f;
const AMBER = 0xb45309;
const CREAM = 0xf7efdd;

const STEPS = [
  { k: 'fuel',    title: 'Fuel',    body: 'Every plan starts with your numbers — energy needs, macros, and hydration tuned to your body.' },
  { k: 'balance', title: 'Balance', body: 'Whole foods, smart portions, and clinical insight keep blood sugar steady and energy high.' },
  { k: 'thrive',  title: 'Thrive',  body: 'Consistency compounds. Small daily wins become lasting metabolic health.' },
];

export function NutritionJourney3D() {
  const wrapRef = useRef(null);
  const pinRef = useRef(null);
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    if (!wrap || !pin) return undefined;
    let renderer;
    let raf = 0;
    let visible = true;
    let observer;

    try {
      const width = pin.clientWidth || 1200;
      const height = pin.clientHeight || 700;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, 9.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      pin.appendChild(renderer.domElement);
      renderer.domElement.classList.add('nj-canvas');

      const mat = (color, opts = {}) =>
        new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.95, ...opts });

      // Ring of nutrient orbs
      const ringGroup = new THREE.Group();
      scene.add(ringGroup);
      const orbGeo = new THREE.SphereGeometry(0.42, 32, 32);
      const orbColors = [GREEN, AMBER, GREEN_SOFT, CREAM, GREEN, CREAM, AMBER, GREEN_SOFT];
      const orbs = [];
      orbColors.forEach((c, i) => {
        const a = (i / orbColors.length) * Math.PI * 2;
        const orb = new THREE.Mesh(orbGeo, mat(c, c === GREEN ? { emissive: 0x053826, emissiveIntensity: 0.6 } : {}));
        orb.userData.angle = a;
        ringGroup.add(orb);
        orbs.push(orb);
      });
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(3.1, 0.035, 12, 120),
        new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.7 })
      );
      orbit.rotation.x = Math.PI / 2.35;
      ringGroup.add(orbit);

      // Rising "leaf" shapes (icosahedrons, two depth layers)
      const leafGeo = new THREE.IcosahedronGeometry(0.3, 0);
      const leaves = [];
      for (let i = 0; i < 16; i++) {
        const far = i % 2 === 0;
        const leaf = new THREE.Mesh(leafGeo, mat(far ? GREEN_SOFT : GREEN, { opacity: far ? 0.5 : 0.9 }));
        leaf.userData = {
          x: (Math.random() - 0.5) * 14,
          z: far ? -4 - Math.random() * 2 : -1 - Math.random() * 2,
          speed: 0.4 + Math.random() * 0.8,
          offset: Math.random(),
          spin: 0.3 + Math.random() * 0.7,
          sway: Math.random() * Math.PI * 2,
        };
        leaf.scale.setScalar(far ? 0.6 : 1);
        scene.add(leaf);
        leaves.push(leaf);
      }

      // Droplet accents drifting sideways (third depth layer)
      const dropGeo = new THREE.ConeGeometry(0.18, 0.5, 20);
      const drops = [];
      for (let i = 0; i < 10; i++) {
        const d = new THREE.Mesh(dropGeo, mat(CREAM, { roughness: 0.5 }));
        d.userData = {
          y: (Math.random() - 0.5) * 7,
          z: -2 - Math.random() * 3,
          offset: Math.random(),
          speed: 0.3 + Math.random() * 0.5,
        };
        scene.add(d);
        drops.push(d);
      }

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(4, 6, 7);
      scene.add(key);

      const renderAt = (p) => {
        // Ring rotates ~270° across the scroll; orbs bob gently
        ringGroup.rotation.y = p * Math.PI * 1.5;
        ringGroup.rotation.x = Math.sin(p * Math.PI) * 0.25;
        orbs.forEach(o => {
          const a = o.userData.angle;
          o.position.set(Math.cos(a) * 3.1, Math.sin(a) * 3.1 * 0.9, Math.sin(a + p * 2) * 0.4);
        });
        // Leaves rise and wrap as you scroll
        leaves.forEach(l => {
          const u = l.userData;
          const cyc = (u.offset + p * u.speed) % 1;
          l.position.set(u.x + Math.sin(cyc * 6 + u.sway) * 0.6, -4 + cyc * 9, u.z);
          l.rotation.y = cyc * 6 * u.spin;
          l.rotation.x = cyc * 3 * u.spin;
        });
        // Droplets drift horizontally with depth parallax
        drops.forEach(d => {
          const u = d.userData;
          const cyc = (u.offset + p * u.speed) % 1;
          d.position.set(-8 + cyc * 16, u.y, u.z);
          d.rotation.z = Math.PI; // point down
        });
        camera.position.z = 9.5 - p * 1.6;
        camera.position.y = Math.sin(p * Math.PI) * 0.5;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };

      const onScroll = () => {
        const rect = wrap.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        setProgress(prev => (Math.abs(prev - p) > 0.002 ? p : prev));
        if (!reduced && visible) renderAt(p);
      };

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || reduced) return;
        // Idle drift: recompute progress from layout each frame and render,
        // so the scene stays alive between scroll events without setState.
        const rect = wrap.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        renderAt(p);
      };

      if (reduced) {
        renderAt(0.35); // single composed static frame
      } else {
        tick();
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      observer = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? true;
      }, { threshold: 0 });
      observer.observe(wrap);

      const onResize = () => {
        const w = pin.clientWidth || 1200;
        const h = pin.clientHeight || 700;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        if (observer) observer.disconnect();
        [orbGeo, leafGeo, dropGeo].forEach(g => g.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === pin) pin.removeChild(renderer.domElement);
      };
    } catch {
      return undefined; // section copy still renders; canvas simply absent
    }
    return undefined;
  }, [reduced]);

  const stepIdx = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

  return (
    <div className={`nj-wrap${reduced ? ' nj-reduced' : ''}`} ref={wrapRef} aria-label="The nutrition journey">
      <div className="nj-pin" ref={pinRef}>
        <div className="nj-overlay">
          <p className="nj-kicker">How it works</p>
          {reduced ? (
            <div className="nj-steps-static">
              {STEPS.map(s => (
                <div key={s.k} className="nj-step-card">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="nj-steps">
              {STEPS.map((s, i) => (
                <div key={s.k} className={`nj-step ${i === stepIdx ? 'active' : ''}`} aria-hidden={i !== stepIdx}>
                  <span className="nj-step-num">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
              <div className="nj-dots">
                {STEPS.map((s, i) => (
                  <span key={s.k} className={`nj-dot ${i === stepIdx ? 'active' : ''}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Subtle scroll-linked parallax for section headings.
   Uses the independent CSS `translate` property so it never fights
   the .reveal transform animations. Skipped under reduced motion. */
export function ScrollParallax() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const els = () => Array.from(document.querySelectorAll('.section-heading'));
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      els().forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const offset = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5
        const y = Math.max(-26, Math.min(26, offset * 52));
        el.style.translate = `0 ${y.toFixed(1)}px`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      els().forEach(el => { el.style.translate = ''; });
    };
  }, []);
  return null;
}
