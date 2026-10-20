import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* Hero3D — home hero 3D visual (spec §7.4, rebuilt without Spline).
   - If VITE_SPLINE_URL is set, the Spline embed is preferred.
   - Otherwise a lightweight Three.js scene renders: a glowing
     nutrient sphere orbited by particles.
   - If WebGL fails, a pure-CSS fallback orb (.hero-orb) renders.
   No @splinetool dependency is used. */

const SPLINE_URL = import.meta.env.VITE_SPLINE_URL || '';

export default function Hero3D() {
  const mountRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (SPLINE_URL || !mountRef.current) return;
    let renderer;
    let raf = 0;
    try {
      const mount = mountRef.current;
      const width = mount.clientWidth || 480;
      const height = mount.clientHeight || 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 6);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);
      renderer.domElement.classList.add('hero-3d-canvas');

      // Central glowing sphere (nutrient orb)
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 48, 48),
        new THREE.MeshStandardMaterial({
          color: 0x0a6640, roughness: 0.25, metalness: 0.1,
          emissive: 0x054d30, emissiveIntensity: 0.55,
        })
      );
      scene.add(sphere);

      // Orbit ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.03, 12, 100),
        new THREE.MeshBasicMaterial({ color: 0xb45309 })
      );
      ring.rotation.x = Math.PI / 2.6;
      scene.add(ring);

      // Orbiting particles
      const particleCount = 220;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const r = 2.2 + Math.random() * 1.6;
        const a = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0x95d4b3, size: 0.06, transparent: true, opacity: 0.9 })
      );
      scene.add(particles);

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(3, 4, 5);
      scene.add(key);

      const clock = new THREE.Clock();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        if (!reduced) {
          const t = clock.getElapsedTime();
          sphere.rotation.y = t * 0.25;
          sphere.position.y = Math.sin(t * 0.8) * 0.18;
          ring.rotation.z = t * 0.15;
          particles.rotation.y = t * 0.08;
        }
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const w = mount.clientWidth || 480;
        const h = mount.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        pGeo.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    } catch {
      setWebglFailed(true);
      if (renderer) renderer.dispose();
      cancelAnimationFrame(raf);
    }
    return undefined;
  }, []);

  if (SPLINE_URL) {
    return (
      <div className="hero-3d-wrap">
        <iframe
          className="hero-spline-frame"
          title="DietAndWell 3D scene"
          src={SPLINE_URL}
          allowFullScreen
        />
      </div>
    );
  }

  if (webglFailed) {
    return (
      <div className="hero-3d-wrap">
        <div className="hero-orb" aria-hidden="true" />
      </div>
    );
  }

  return <div className="hero-3d-wrap" ref={mountRef} aria-hidden="true" />;
}
