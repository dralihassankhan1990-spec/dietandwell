import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* Calculators3DBg — animated three.js backdrop for the calculators
   landing hero (Round 1, Part 2). Follows the established Hero3D.jsx
   pattern: floating nutrition-themed abstract shapes (soft spheres,
   rings, tori) in brand colours (#0A6640 green / #B45309 amber).
   - Respects prefers-reduced-motion: renders one static frame.
   - Pauses when scrolled out of view (IntersectionObserver).
   - If WebGL fails, renders nothing — the CSS gradient underneath
     keeps the hero intact. */

const GREEN = 0x0a6640;
const GREEN_SOFT = 0x2e9e6b;
const AMBER = 0xb45309;
const CREAM = 0xf5ead6;

export default function Calculators3DBg() {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    let raf = 0;
    let visible = true;
    let observer;

    try {
      const width = mount.clientWidth || 1200;
      const height = mount.clientHeight || 420;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.5, 11);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);
      renderer.domElement.classList.add('calc-3d-canvas');

      const group = new THREE.Group();
      scene.add(group);

      const mat = (color, opts = {}) =>
        new THREE.MeshStandardMaterial({
          color, roughness: 0.35, metalness: 0.15,
          transparent: true, opacity: 0.92, ...opts,
        });

      const shapes = [];
      const add = (mesh, base) => {
        mesh.position.set(base.x, base.y, base.z);
        mesh.userData = { ...base, phase: Math.random() * Math.PI * 2, spin: 0.15 + Math.random() * 0.3 };
        group.add(mesh);
        shapes.push(mesh);
      };

      // Soft "nutrient" spheres (left cluster — green)
      const sphereGeo = new THREE.SphereGeometry(1, 40, 40);
      add(new THREE.Mesh(sphereGeo, mat(GREEN, { emissive: 0x063d27, emissiveIntensity: 0.5 })), { x: -4.6, y: 0.4, z: -1, amp: 0.35, s: 1.15 });
      add(new THREE.Mesh(sphereGeo, mat(GREEN_SOFT)), { x: -2.9, y: -1.1, z: -2, amp: 0.28, s: 0.55 });
      add(new THREE.Mesh(sphereGeo, mat(CREAM, { roughness: 0.6 })), { x: -6.1, y: -0.9, z: -2.5, amp: 0.22, s: 0.4 });

      // Rings / tori (right cluster — amber)
      const torusGeo = new THREE.TorusGeometry(1.25, 0.12, 16, 80);
      const ring1 = new THREE.Mesh(torusGeo, mat(AMBER, { emissive: 0x5c2c04, emissiveIntensity: 0.45 }));
      ring1.rotation.x = Math.PI / 3;
      add(ring1, { x: 4.4, y: 0.6, z: -1, amp: 0.3, s: 1 });
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 16, 60), mat(GREEN_SOFT));
      ring2.rotation.x = Math.PI / 4; ring2.rotation.y = Math.PI / 5;
      add(ring2, { x: 5.8, y: -1.2, z: -2, amp: 0.24, s: 1 });
      add(new THREE.Mesh(sphereGeo, mat(AMBER, { emissive: 0x5c2c04, emissiveIntensity: 0.5 })), { x: 3.0, y: 1.3, z: -2.4, amp: 0.32, s: 0.5 });

      // Centre "droplet" accents — icosahedrons
      const icoGeo = new THREE.IcosahedronGeometry(0.42, 0);
      add(new THREE.Mesh(icoGeo, mat(GREEN_SOFT)), { x: -0.8, y: 1.5, z: -3, amp: 0.4, s: 1 });
      add(new THREE.Mesh(icoGeo, mat(CREAM, { roughness: 0.6 })), { x: 1.4, y: -1.5, z: -3, amp: 0.35, s: 0.8 });
      add(new THREE.Mesh(icoGeo, mat(AMBER)), { x: 0.4, y: 0.2, z: -4, amp: 0.25, s: 0.6 });

      // Gentle floating particles
      const pCount = 130;
      const positions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 16;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
        positions[i * 3 + 2] = -1 - Math.random() * 4;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0x9fd8b8, size: 0.07, transparent: true, opacity: 0.75 })
      );
      scene.add(particles);

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(4, 5, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffd9a0, 0.5);
      rim.position.set(-5, -2, 3);
      scene.add(rim);

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const renderFrame = (t) => {
        shapes.forEach(m => {
          const u = m.userData;
          m.position.y = u.y + Math.sin(t * 0.7 + u.phase) * u.amp;
          m.position.x = u.x + Math.cos(t * 0.4 + u.phase) * u.amp * 0.5;
          m.rotation.y += u.spin * 0.016;
          m.rotation.x += u.spin * 0.008;
          const sc = u.s * (1 + Math.sin(t * 0.9 + u.phase) * 0.04);
          m.scale.setScalar(sc);
        });
        particles.rotation.y = t * 0.03;
        renderer.render(scene, camera);
      };

      if (reduced) {
        renderFrame(1.2); // single static frame
      } else {
        const clock = new THREE.Clock();
        const animate = () => {
          raf = requestAnimationFrame(animate);
          if (visible) renderFrame(clock.getElapsedTime());
        };
        animate();

        observer = new IntersectionObserver(entries => {
          visible = entries[0]?.isIntersecting ?? true;
        }, { threshold: 0 });
        observer.observe(mount);
      }

      const onResize = () => {
        const w = mount.clientWidth || 1200;
        const h = mount.clientHeight || 420;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (observer) observer.disconnect();
        [sphereGeo, torusGeo, icoGeo, pGeo].forEach(g => g.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    } catch {
      setFailed(true);
      if (renderer) renderer.dispose();
      cancelAnimationFrame(raf);
    }
    return undefined;
  }, []);

  if (failed) return null; // gradient underneath carries the hero
  return <div className="calc-3d-bg" ref={mountRef} aria-hidden="true" />;
}
