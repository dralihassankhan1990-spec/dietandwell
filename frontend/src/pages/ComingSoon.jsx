import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO.js';
import '../styles/coming-soon.css';

/* ── ComingSoon — kept as a component but NOT routed: /shop and
   /subscriptions now render their real pages. Reuse this component
   only for a genuinely upcoming feature. ─────────────────────── */
export default function ComingSoon({ page = 'Shop' }) {
  useSEO({
    title: `${page} — Coming Soon`,
    description: `Our ${page.toLowerCase()} is launching soon. Stay tuned for exciting new products and services.`,
    noIndex: true,
  });

  const canvasRef = useRef(null);

  /* ── Floating particles (pure CSS animation fallback) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* Particles */
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: -Math.random() * 0.8 - 0.3,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(149, 212, 179, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const icons = {
    Shop: { emoji: '🛍️', tagline: 'Premium Nutrition Products' },
    Subscriptions: { emoji: '💎', tagline: 'Flexible Wellness Plans' },
  };
  const info = icons[page] || icons.Shop;

  return (
    <div className="cs-page">
      {/* Particle canvas background */}
      <canvas ref={canvasRef} className="cs-canvas" />

      {/* 3D floating card */}
      <div className="cs-card-wrap">
        <div className="cs-card">
          {/* Rotating ring */}
          <div className="cs-ring cs-ring-1" />
          <div className="cs-ring cs-ring-2" />
          <div className="cs-ring cs-ring-3" />

          {/* Inner content */}
          <div className="cs-inner">
            <div className="cs-emoji">{info.emoji}</div>
            <div className="cs-badge">Coming Soon</div>
            <h1 className="cs-title">{page}</h1>
            <p className="cs-tagline">{info.tagline}</p>
            <p className="cs-desc">
              We're putting the finishing touches on something great.
              <br />Follow us or reach out for early access.
            </p>

            {/* Progress bar */}
            <div className="cs-progress-wrap">
              <div className="cs-progress-track">
                <div className="cs-progress-fill" style={{ width: page === 'Subscriptions' ? '78%' : '62%' }} />
              </div>
              <span className="cs-progress-label">{page === 'Subscriptions' ? '78%' : '62%'} complete</span>
            </div>

            {/* CTAs */}
            <div className="cs-actions">
              <Link to="/contact" className="cs-btn cs-btn-primary">
                Get Early Access →
              </Link>
              <Link to="/" className="cs-btn cs-btn-ghost">
                ← Back to Home
              </Link>
            </div>

            {/* Notify me */}
            <div className="cs-notify">
              <input type="email" placeholder="Your email for launch updates" className="cs-email" />
              <button className="cs-notify-btn">Notify Me</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
