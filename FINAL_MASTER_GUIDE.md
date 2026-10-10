# DietAndWell — Final Master Guide
## The Single Source of Truth for All Agents

**Version:** 2.0 — Final  
**Date:** April 2025  
**Stack:** React 18 + Vite | NestJS 11 + PostgreSQL  
**Deploy:** Vercel (frontend) + Railway (backend)

---

## ⚡ DECISION: READ THIS FIRST

After full analysis of:
- Your existing codebase (NestJS backend, React frontend)
- The previous Master Reference (Claude's design doc)
- The Copilot agent analysis (Option A/B/C framework)
- The Stitch/Google design (5 screens, "High-Tech Apothecary" concept)

**THE VERDICT:**

> **Keep NestJS backend. Use the Stitch design language. Follow this guide's phased plan.**

Here's why, in plain terms:

### On the backend debate (NestJS vs Express)
The Copilot agent is 100% correct. Your NestJS backend has 16 entities, TypeORM, Swagger, JWT guards, role-based access — all working. Rewriting to Express buys you nothing and costs 6+ weeks. **Keep NestJS. Don't touch the backend architecture.**

### On the design debate (My previous spec vs Stitch)
The Stitch design is genuinely better than what I originally specified. Here's the honest comparison:

| Aspect | My Previous Spec | Stitch Design | Winner |
|--------|-----------------|---------------|--------|
| Feel | Dark hero + green | Organic, airy, glassmorphic | **Stitch** |
| Typography | Playfair + Inter | Plus Jakarta Sans only | **Stitch** (simpler, more premium) |
| Color depth | Basic green palette | "Green-on-green" layering | **Stitch** |
| 3D approach | CSS tilts + Spline | Vitality Rings + glassmorphism | **Stitch** |
| Uniqueness | Template-adjacent | Genuinely distinctive | **Stitch** |
| Coaching trust | Standard | More clinical = more credible | **Stitch** |

**The Stitch design is superior. We adopt it.**

However, Stitch only covers visual style. This guide merges Stitch's aesthetic with my complete page/component/API specs.

---

## 🗂 WHAT TO DELETE

Delete these files — they are superseded:
- `DECISION_SUMMARY.md`
- `STRATEGIC_ANALYSIS.md`
- `QUICK_REFERENCE.md`
- `IMPLEMENTATION_ROADMAP.md`
- `CODEBASE_ANALYSIS.md`
- `API_REFERENCE.md`
- `00_START_HERE.md`
- `DietAndWell_Agent_Master_Reference.docx` (my previous version)

Keep only this file: **`FINAL_MASTER_GUIDE.md`**

---

## 📋 AGENT RULES — NON-NEGOTIABLE

1. **Read this entire file before writing a single line of code.**
2. **Never invent a colour not in Section 2. Always use CSS variables.**
3. **Never add a feature not listed in this document without explicit user instruction.**
4. **Never touch the NestJS backend architecture.** Only add new routes/controllers following existing patterns.
5. **Bootstrap is GONE.** Zero Bootstrap classes anywhere. Grep to verify.
6. **All CSS goes in CSS files.** No inline `style={{}}` in JSX except for truly dynamic values.
7. **Complete phases in order.** Do not start Phase N+1 until Phase N acceptance criteria pass.
8. **The API endpoints in Section 5 are the real ones from the running NestJS backend.** Do not invent new endpoints.

---

## 1. PROJECT OVERVIEW

### 1.1 Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite | Already installed |
| Styling | Custom CSS Custom Properties | Remove Bootstrap completely |
| 3D / Animation | CSS glassmorphism + Vitality Rings + CSS 3D | No Three.js or Spline needed |
| Backend | NestJS 11 + TypeORM | DO NOT REWRITE |
| Database | PostgreSQL | Already running locally |
| Auth | JWT + Passport.js | Already implemented |
| Payments | Stripe | Already integrated |
| File Uploads | Multer (local dev) → Cloudinary (prod) | Backend ready |
| Deploy Frontend | Vercel | |
| Deploy Backend | Railway | |

### 1.2 Folder Structure

```
DietAndWell/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/              ← Button, Card, Badge, Input, Modal, Toast, Spinner, Avatar
│       │   ├── layout/          ← Navbar, Footer, PageHero, SectionWrapper, Container
│       │   ├── sections/        ← HeroSection, ServiceCard, BlogCard, StatCounter, etc.
│       │   └── data-viz/        ← VitalityRing, MacroChart, CalcResult
│       ├── pages/               ← One file per route (15 pages exist)
│       ├── contexts/            ← AuthContext (already exists), ThemeContext
│       ├── services/
│       │   └── api.js           ← ALL fetch calls (see Section 5)
│       ├── hooks/               ← useReveal, useCounter, useAuth
│       ├── utils/               ← calculators.js (all math logic)
│       └── styles/
│           ├── variables.css    ← ALL CSS custom properties ← START HERE
│           ├── globals.css      ← Reset + base styles
│           └── animations.css   ← Keyframe animations
├── backend/                     ← DO NOT RESTRUCTURE
│   └── src/
│       ├── auth/
│       ├── blog/
│       ├── products/
│       ├── cart/
│       ├── orders/
│       ├── users/
│       ├── upload/
│       ├── contact/
│       ├── metrics/
│       └── calculators/
└── FINAL_MASTER_GUIDE.md        ← This file
```

---

## 2. DESIGN SYSTEM — STITCH "HIGH-TECH APOTHECARY"

### 2.1 Design Philosophy

> "Where the rigorous precision of nutritional science meets the tactile, breathing warmth of the natural world."

**Core principles:**
- **No harsh borders.** Sections separated by background colour shifts only. No `1px solid` dividers between sections.
- **Extreme whitespace.** When in doubt, add 16px more.
- **Organic shapes only.** Minimum `border-radius: 0.5rem` on everything. No sharp corners anywhere.
- **Green-on-green layering.** Depth comes from tonal nesting of near-identical greens, not shadows.
- **Glassmorphism for floating elements.** Navbar, modals, featured cards.
- **No black.** Use `#191c1c` (`--color-on-surface`) for all "black" text.
- **No horizontal rules.** Separate content through hierarchy and space.

### 2.2 Colour Palette — CSS Custom Properties

**FILE: `/frontend/src/styles/variables.css`**

```css
:root {
  /* ── PRIMARY — Forest Green ─────────────────────────── */
  --color-primary:              #274f3d;
  --color-primary-container:    #3f6754;
  --color-on-primary:           #ffffff;
  --color-on-primary-container: #c1ecd4;
  --color-primary-fixed:        #c1ecd4;
  --color-on-primary-fixed-variant: #1b3d2d;

  /* ── SECONDARY — Mint ───────────────────────────────── */
  --color-secondary:            #4a7c6b;
  --color-secondary-container:  #ccede0;
  --color-on-secondary:         #ffffff;
  --color-secondary-fixed-dim:  #95d4b3;
  --color-on-secondary-fixed-variant: #1a3d2e;

  /* ── TERTIARY — Deep Forest (for accents/glows) ─────── */
  --color-tertiary:             #0d5237;

  /* ── SURFACES (the "green-on-green" system) ─────────── */
  --color-background:           #f8faf9;
  --color-surface:              #f8faf9;
  --color-surface-bright:       #ffffff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low:    #f2f4f3;
  --color-surface-container:        #eef0ef;
  --color-surface-container-high:   #e8eae9;
  --color-surface-container-highest:#e2e4e3;

  /* ── TEXT ────────────────────────────────────────────── */
  --color-on-surface:           #191c1c;
  --color-on-surface-variant:   #404943;
  --color-on-background:        #191c1c;
  --color-outline:              #6f7975;
  --color-outline-variant:      #bfc9c1;

  /* ── SEMANTIC ────────────────────────────────────────── */
  --color-error:                #ba1a1a;
  --color-on-error:             #ffffff;
  --color-success:              #1b7a4a;
  --color-warning:              #8a5100;

  /* ── TYPOGRAPHY ──────────────────────────────────────── */
  --font-body: 'Plus Jakarta Sans', -apple-system, sans-serif;
  /* Only one font. Used at all weights. */

  /* ── TYPE SCALE ──────────────────────────────────────── */
  --text-display-lg:  3.5625rem;   /* 57px — hero stats, key numbers */
  --text-display-md:  2.8125rem;   /* 45px */
  --text-headline-lg: 2rem;        /* 32px — section headings */
  --text-headline-md: 1.75rem;     /* 28px */
  --text-title-lg:    1.375rem;    /* 22px — card titles */
  --text-title-md:    1rem;        /* 16px — sub-titles */
  --text-body-lg:     1rem;        /* 16px — body copy */
  --text-body-md:     0.875rem;    /* 14px — captions */
  --text-label-lg:    0.875rem;    /* 14px — labels */
  --text-label-md:    0.75rem;     /* 12px — tags, chips */

  /* ── LETTER SPACING ──────────────────────────────────── */
  --tracking-tight:   -0.02em;     /* Headlines */
  --tracking-wide:    0.05em;      /* Label-md ALL CAPS */

  /* ── SPACING (8pt grid) ──────────────────────────────── */
  --space-1:  4px;    --space-2:  8px;    --space-3:  12px;
  --space-4:  16px;   --space-5:  20px;   --space-6:  24px;
  --space-8:  32px;   --space-10: 40px;   --space-12: 48px;
  --space-16: 64px;   --space-20: 80px;   --space-24: 96px;
  --space-32: 128px;

  /* ── BORDER RADIUS ───────────────────────────────────── */
  --radius-sm:   0.5rem;     /* 8px — minimum. Nothing smaller. */
  --radius-md:   1.5rem;     /* 24px — inputs, chips */
  --radius-lg:   2rem;       /* 32px — small cards */
  --radius-xl:   3rem;       /* 48px — main cards */
  --radius-full: 9999px;     /* pills, buttons, nav */

  /* ── SHADOWS — tinted with primary green ─────────────── */
  --shadow-ambient: 0 20px 50px rgba(39, 79, 61, 0.10);
  --shadow-float:   0 40px 80px rgba(39, 79, 61, 0.14);
  --shadow-glow:    0 0 40px rgba(39, 79, 61, 0.18);
  --shadow-inner-glow: inset 0 1px 0 rgba(191, 201, 193, 0.30);

  /* ── GLASSMORPHISM ────────────────────────────────────── */
  --glass-bg:     rgba(255, 255, 255, 0.70);
  --glass-blur:   blur(20px);
  --glass-border: 1px solid rgba(191, 201, 193, 0.40);

  /* ── TRANSITIONS ─────────────────────────────────────── */
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-spring: 350ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── LAYOUT ──────────────────────────────────────────── */
  --container-max:    1280px;
  --container-narrow: 760px;
  --navbar-height:    72px;
  --section-py:       var(--space-24);

  /* ── Z-INDEX ─────────────────────────────────────────── */
  --z-navbar:  100;
  --z-overlay: 200;
  --z-modal:   300;
  --z-toast:   400;
}
```

### 2.3 Typography Rules

```css
/* Plus Jakarta Sans only. Import in index.html <head>: */
/* <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"> */

body {
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  color: var(--color-on-surface);
  background: var(--color-background);
  -webkit-font-smoothing: antialiased;
}

/* Headlines: tight tracking, heavy weight */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-body);
  letter-spacing: var(--tracking-tight);
  color: var(--color-on-surface);
}

/* Category tags: ALL CAPS, wide tracking */
.tag {
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  font-size: var(--text-label-md);
  font-weight: 700;
}
```

### 2.4 The "No-Line" Surface System

Sections are separated by background colour shifts ONLY. The sequence is:

```
Page background:    --color-background      (#f8faf9)  ← outermost
Content blocks:     --color-surface-container-low (#f2f4f3)
Primary cards:      --color-surface-container-lowest (#fff) ← "lifted"
Floating elements:  --color-surface-bright  (#fff + glass)
```

### 2.5 Glassmorphism — Navbar and Floating Cards

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  box-shadow: var(--shadow-ambient), var(--shadow-inner-glow);
}
```

### 2.6 Button Styles — "Supplement Pill"

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-label-lg);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform var(--transition-spring), box-shadow var(--transition-base);
  text-decoration: none;
  white-space: nowrap;
}
.btn:hover  { transform: scale(1.05); }
.btn:active { transform: scale(0.95); }

/* Primary — Botanical Gradient */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
  color: var(--color-on-primary);
  box-shadow: 0 8px 24px rgba(39,79,61,0.25), var(--shadow-inner-glow);
}
.btn-primary:hover { box-shadow: 0 16px 40px rgba(39,79,61,0.35), var(--shadow-inner-glow); }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-on-surface-variant);
  font-weight: 500;
}
.btn-ghost:hover { color: var(--color-primary); transform: none; }
```

### 2.7 Card Styles — Organic Cards

```css
.card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-ambient);
  overflow: hidden;
  transition: transform var(--transition-spring), box-shadow var(--transition-spring);
}
.card:hover {
  transform: scale(1.02) translateY(-4px);
  box-shadow: var(--shadow-float);
}

/* No 1px borders on cards — depth comes from shadow + bg shift */
```

### 2.8 3D Signature Element — The Vitality Ring

The Vitality Ring is a custom circular data visualisation used for health metrics and stats. It replaces CSS 3D card tilts as the primary "3D feel" of the site.

```css
/* Vitality Ring — used in calculator results, stat displays */
.vitality-ring {
  position: relative;
  width: 140px;
  height: 140px;
}

.vitality-ring svg {
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 8px rgba(13, 82, 55, 0.4));
}

.vitality-ring .ring-track {
  fill: none;
  stroke: var(--color-surface-container-high);
  stroke-width: 12;
  stroke-linecap: round;
}

.vitality-ring .ring-fill {
  fill: none;
  stroke: url(#ringGradient);
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: 360;
  stroke-dashoffset: 360; /* Animated by JS */
  transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vitality-ring .ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: var(--text-headline-md);
  font-weight: 800;
  color: var(--color-on-surface);
  letter-spacing: var(--tracking-tight);
}
```

```jsx
// VitalityRing React Component
// FILE: /frontend/src/components/data-viz/VitalityRing.jsx
export default function VitalityRing({ value, max, label, unit }) {
  const pct = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 54; // r=54
  const offset = circumference * (1 - pct);

  return (
    <div className="vitality-ring" style={{ width: 140, height: 140, position: 'relative' }}>
      <svg viewBox="0 0 120 120" width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#274f3d" />
            <stop offset="100%" stopColor="#95d4b3" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="60" cy="60" r="54" fill="none"
          stroke="var(--color-surface-container-high)" strokeWidth="12" />
        <circle className="ring-fill" cx="60" cy="60" r="54" fill="none"
          stroke="url(#ringGradient)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                   filter: 'drop-shadow(0 0 8px rgba(13,82,55,0.4))' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: 'var(--text-headline-md)', fontWeight: 800,
                       letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)' }}>
          {value}{unit}
        </span>
        <span style={{ fontSize: 'var(--text-label-md)', color: 'var(--color-on-surface-variant)',
                       textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}
```

### 2.9 Scroll Reveal Animation

```css
/* FILE: /frontend/src/styles/animations.css */

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes ringFill {
  from { stroke-dashoffset: 360; }
  to   { stroke-dashoffset: var(--ring-target); }
}

/* Apply with IntersectionObserver — see useReveal hook */
.reveal        { opacity: 0; transform: translateY(24px); }
.reveal.visible { animation: fadeInUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
.reveal-scale  { opacity: 0; transform: scale(0.94); }
.reveal-scale.visible { animation: scaleIn 0.5s ease forwards; }

.reveal-delay-1 { animation-delay: 0.1s; }
.reveal-delay-2 { animation-delay: 0.2s; }
.reveal-delay-3 { animation-delay: 0.3s; }
.reveal-delay-4 { animation-delay: 0.4s; }

/* Floating glassmorphic nav */
@keyframes navSlideDown {
  from { opacity: 0; transform: translateY(-16px) translateX(-50%); }
  to   { opacity: 1; transform: translateY(0) translateX(-50%); }
}

/* Counter */
@keyframes countUp { from { opacity: 0; } to { opacity: 1; } }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-scale { opacity: 1; transform: none; animation: none; }
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

```jsx
// FILE: /frontend/src/hooks/useReveal.js
import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-scale');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
```

---

## 3. GLOBAL COMPONENTS

### 3.1 Navbar — Floating Glass Pill

**Spec:**
- Position: `fixed`, centered horizontally, `top: 16px`
- Shape: pill (`border-radius: var(--radius-full)`)
- Style: glassmorphism (`--glass-bg`, `--glass-blur`, `--glass-border`)
- Shadow: `--shadow-ambient`
- Max-width: 1100px, `margin: 0 auto`
- Logo: "Diet&Well", Plus Jakarta Sans 700, `--color-primary`
- Links: `--color-on-surface-variant`, hover `--color-primary`, `scale(1.05)`
- Login: `btn-ghost`
- Sign Up / Get Started: `btn-primary`
- On scroll past 80px: shadow deepens to `--shadow-float`
- Mobile: hamburger → slide-down menu, same glass style
- Animation: `navSlideDown` on mount

```jsx
// FILE: /frontend/src/components/layout/Navbar.jsx
// Key structure — implement fully:
<nav style={{
  position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
  zIndex: 'var(--z-navbar)', width: 'calc(100% - 48px)', maxWidth: 1100,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 24px', borderRadius: 'var(--radius-full)',
  background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
  border: 'var(--glass-border)', boxShadow: 'var(--shadow-ambient)'
}}>
  <Logo />
  <NavLinks />
  <NavActions />
</nav>
```

### 3.2 Footer

- Background: `--color-primary` (#274f3d)
- Text: `--color-on-primary-container` (#c1ecd4) for headings, `rgba(193,236,212,0.7)` for links
- 4 columns: About | Quick Links | Services | Contact
- Bottom bar: `border-top: 1px solid rgba(193,236,212,0.2)`
- **Remove the amber/gold stripe** from previous design completely.

### 3.3 PageHero

- Height: `70vh` min for interior pages
- Background: linear-gradient from `--color-primary` to `--color-primary-container`
- Optional: botanical SVG blur behind (abstract leaf/organic shape in `rgba(255,255,255,0.04)`)
- Title: `--text-display-md`, white, `font-weight: 800`, `letter-spacing: -0.02em`
- Subtitle: `--text-title-lg`, `rgba(255,255,255,0.75)`
- NO stock photography on hero backgrounds

---

## 4. PAGE SPECIFICATIONS

### 4.1 Home Page (`/`)

**Section 1 — Hero**
- Full viewport (`100vh`)
- Background: `linear-gradient(135deg, #1B4332 0%, #274f3d 50%, #3f6754 100%)`
- Optional subtle botanical SVG (abstract leaves) at very low opacity (~4%) in background
- Left 55%:
  - Tag: `"METABOLIC INTELLIGENCE"` — pill chip, `--color-primary-fixed` bg, `--color-on-primary-fixed-variant` text, all-caps, `--tracking-wide`
  - H1: "Precision Nutrition *Perfected.*" (italic on second word) — 4.5rem, white, 800 weight, tight tracking
  - Subheadline: 1.1rem, `rgba(255,255,255,0.75)`, max-width 480px
  - CTA row: `btn-primary` "Get Started Free" + `btn-ghost` white "See Services"
  - Trust row below: "666+ Happy Clients · 13% Avg Fat Loss · 2+ Years Experience · 26+ Articles"
- Right 45%:
  - Glassmorphic floating card (glass class) showing a mock "Health Score" with a VitalityRing
  - Score: large number (e.g. "87"), label "Health Score", ring at 87%
  - Below ring: 3 mini metric pills (Protein, Hydration, Sleep) — secondary-fixed-dim bg, pill shape
  - Card floats with CSS `animation: float 4s ease-in-out infinite`

```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(1deg); }
  50%       { transform: translateY(-16px) rotate(-1deg); }
}
```

**Section 2 — Free Health Calculators**
- Background: `--color-surface-container-low`
- Section tag: `"FREE TOOLS"` chip
- Heading: "Your Health, Quantified" — `--text-headline-lg`, tight tracking
- 4-column grid of calculator cards
- Each card: `--color-surface-container-lowest` bg, `--radius-xl`, `--shadow-ambient`
- Icon: large Material Symbol in `--color-primary`
- Name + short description + "Calculate Now" `btn-ghost`
- Hover: `scale(1.02) translateY(-4px)`, shadow deepens

**Section 3 — Nutrition Powerhouses**
- Background: `--color-background`
- Heading: "Nutrition Powerhouses"
- 6-item horizontal scroll or grid: circular image (88px) + name + 1-line benefit
- Hover: `scale(1.05)`, green ambient glow

**Section 4 — Blog Preview (Learn)**
- Background: `--color-surface-container-low`
- Left: large featured blog card (image 16:9, title, excerpt, "Read More →")
- Right: 2 smaller stacked cards
- All cards: `--color-surface-container-lowest` bg, `--radius-xl`, `--shadow-ambient`

**Section 5 — Services**
- Background: `--color-background`
- 4 service cards from backend
- Each: VitalityRing showing "Value Score" or price as ring fill
- Name, price, duration, "Learn More" `btn-ghost`

**Section 6 — Stats (Dark)**
- Background: `--color-primary`
- 4 animated counters: 666+ | 13% | 2+ | 26+
- White text, Vitality Rings behind each number (subtle, low opacity)
- Fetch from `GET /api/metrics`

**Section 7 — Testimonials**
- Background: `--color-surface-container-low`
- 3 cards, `--radius-xl`, `--shadow-ambient`
- Avatar: circular, `--color-primary-fixed` bg, initials in `--color-primary`
- 5-star rating in `--color-tertiary`

**Section 8 — Newsletter**
- Background: gradient `--color-primary` to `--color-primary-container`
- White text. Email input + "Subscribe" `btn-primary`
- Submit: `POST /api/newsletter/subscribe` ← **does not exist yet in backend, create it**

**Section 9 — Final CTA**
- Background: `--color-background`
- Centered: heading + two buttons

### 4.2 Services Page (`/services`)

- Hero: PageHero component, title "Our Services", subtitle "Comprehensive wellness solutions"
- Grid: 3 columns, all 10 services from `GET /api/services` (or hardcode if no endpoint)
- Each card: `--radius-xl`, icon, name, description, price, duration/package, "Learn More" `btn-primary` (full width)
- Process section: 3 steps — "Book a Call" → "Get Your Plan" → "Transform" — numbered circles connected by a dashed line
- Bottom CTA: "Book a Free Consultation" `btn-primary`

### 4.3 Blog Page (`/blog`)

- Hero: PageHero, "Nutrition & Wellness Blog"
- Search: pill input, max-width 500px, centered, `--radius-full`
- Category filter chips: "All | Weight Loss | Gut Health | Nutrition | Wellness | Mental Health" — pill chips, active = `--color-primary` bg + white text
- Grid: 3 columns, `BlogCard` components
- BlogCard: image (16:9, `--radius-lg` top corners), category chip, title, excerpt (2-line clamp), author + date + views, "Read More →" link
- Data: `GET /api/blog`

### 4.4 Single Blog Post (`/blog/:slug`)

- Data: `GET /api/blog/:slug`
- Cover image: full-width, 400px height, object-fit cover
- Content: max-width 760px, centered, `line-height: 1.85`, Plus Jakarta Sans
- Read time: estimate `Math.ceil(wordCount / 200)` minutes
- Tags: pill chips below content
- Related posts: 3 cards from same category

### 4.5 Calculators Page (`/calculators`)

**Layout:** Left sidebar 260px (calculator nav) + Right main area

**Left sidebar:**
- Title: "Health Tools"
- List of 6 calculator pills — active = `--color-primary` bg, white text, `--radius-full`
- Each shows icon + name

**Right area:** Active calculator form

**Calculators:**
| Name | Inputs | Output |
|------|--------|--------|
| BMI | Weight (kg/lbs toggle), Height (cm/ft toggle) | BMI value + category ring |
| Calorie (TDEE) | Age, Gender, Weight, Height, Activity Level (select) | Daily calories + macros |
| Body Fat | Gender, Waist, Neck, Height (+ Hip for women) | Body fat % + category |
| Ideal Weight | Gender, Height | Ideal weight range |
| Water Intake | Weight, Activity Level, Climate | Daily litres |
| Macro Split | Total calories, Goal (lose/maintain/gain), Diet style | Protein/Carbs/Fat grams |

**Results display:**
- Slides in below form (CSS `max-height` transition 0 → auto)
- VitalityRing showing result as percentage of healthy range
- Animated counter (count up 0 → result, 800ms)
- Colour-coded badge: Normal (green), Warning (amber), Alert (red)
- Macro splits: 3 VitalityRings side by side (Protein / Carbs / Fat)
- "Email My Results" → opens small modal → sends `POST /api/calculators/calculate` (backend already exists)
- All maths done client-side in `/frontend/src/utils/calculators.js`

**Backend note:** `POST /api/calculators/calculate` exists. Use it to log results. The calculation itself is done on the frontend.

### 4.6 Contact Page (`/contact`)

- Hero: PageHero "Get In Touch"
- Two columns (60/40):
  - Left (60%): form — Full Name, Email, Phone (optional), Message, "Send Message" `btn-primary` full width
  - Right (40%): 3 contact info cards (Email, Phone, WhatsApp) — each `--radius-xl`, `--shadow-ambient`, hover lifts
- Submit: `POST /api/contact`
- Success: toast notification (no redirect)

### 4.7 Login Page (`/login`)

**Current problem:** Large empty white space above form. Fix: remove top padding/margin and center the card in the viewport.

- Page background: `linear-gradient(135deg, #1B4332, #274f3d)`
- Center: glass card (`--radius-xl`, `glass` class) — max-width 420px
- Inside: "Welcome Back" heading, Email input, Password input, "Login" `btn-primary` full-width
- Link: "Don't have an account? Register here" in `--color-primary-fixed`
- Vertically centered: `min-height: 100vh; display: flex; align-items: center; justify-content: center;`
- API: `POST /api/auth/login`

### 4.8 Signup Page (`/register` or `/signup`)

Same glass card layout as Login.
- Fields: First Name, Last Name, Email, Phone, Password
- "Create Account" `btn-primary` full-width
- API: `POST /api/auth/register`

### 4.9 Admin Panel (`/admin`)

- Protected by `JwtAuthGuard` on backend (already exists)
- Frontend: check `localStorage.getItem('accessToken')` — redirect to `/login` if missing
- Sidebar navigation: Dashboard | Blog Posts | Contact Leads | Newsletter | Users | Products | Orders
- Blog list: table — Title, Status (published/draft), Date, Edit / Delete
- Blog editor:
  - Fields: Title, Slug (auto from title), Excerpt, Content (React-Quill), Cover Image upload, Category, Tags, Published toggle
  - Image upload: `POST /api/upload/blog/featured`
  - Save: `POST /api/blog` (create) or `PUT /api/blog/:id` (update)
- Contact leads: table from `GET /api/contact`
- Users: table from `GET /api/users`
- All admin routes require `Authorization: Bearer <accessToken>` header

---

## 5. BACKEND API REFERENCE

**Base URL (dev):** `http://localhost:5000/api`  
**Base URL (prod):** Set in `VITE_API_URL` env var  
**Auth:** `Authorization: Bearer <accessToken>` for protected routes  
**Swagger docs:** `http://localhost:5000/api/docs`

### 5.1 Auth Endpoints

| Method | Path | Auth | Body / Notes |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | `{email, password, firstName, lastName, phone}` |
| POST | `/auth/login` | Public | `{email, password}` → `{user, accessToken, refreshToken}` |
| POST | `/auth/logout` | Bearer | Invalidates token |
| POST | `/auth/refresh` | Public | `{userId, refreshToken}` → new tokens |
| GET | `/auth/me` | Bearer | Returns current user |

### 5.2 Blog Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/blog` | Public | `?page&limit&search&category&tag` |
| GET | `/blog/:slug` | Public | Increments view count |
| GET | `/blog/categories` | Public | Returns category list |
| GET | `/blog/tags` | Public | Returns tag list |
| POST | `/blog` | Admin | Create post |
| PUT | `/blog/:id` | Admin | Update post |
| DELETE | `/blog/:id` | Admin | Delete post |

### 5.3 Products, Cart, Orders

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/products` | Public | `?page&limit&active` |
| GET | `/products/:id` | Public | Single product |
| POST | `/products` | Admin | Create |
| PUT | `/products/:id` | Admin | Update |
| DELETE | `/products/:id` | Admin | Delete |
| GET | `/cart` | Bearer | User's cart |
| POST | `/cart/add` | Bearer | `{productId, quantity}` |
| DELETE | `/cart/remove/:itemId` | Bearer | |
| DELETE | `/cart/clear` | Bearer | |
| POST | `/orders` | Bearer | `{shippingAddress, billingAddress}` |
| GET | `/orders` | Bearer | User's orders (Admin sees all) |
| GET | `/orders/:id` | Bearer | |

### 5.4 Other Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/contact` | Public | `{name, email, phone, message}` |
| GET | `/contact` | Admin | All inquiries |
| PATCH | `/contact/:id/read` | Admin | Mark as read |
| GET | `/metrics` | Public | KPI stats |
| GET | `/calculators` | Public | Calculator configs |
| POST | `/calculators/calculate` | Public | `{type, ...inputs}` |
| POST | `/upload/blog/featured` | Admin | Multipart, returns `{url}` |
| POST | `/upload/blog/content` | Admin | Multipart |
| POST | `/upload/product/featured` | Admin | Multipart |
| GET | `/users` | Admin | All users |
| POST | `/users` | Admin | Create user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete |

### 5.5 Newsletter Endpoint — CREATE THIS

The newsletter subscribe endpoint does not exist in the backend. Create it:

```typescript
// FILE: /backend/src/newsletter/newsletter.controller.ts
@Post('newsletter/subscribe')
async subscribe(@Body() body: { email: string }) {
  // Save to subscribers table or handle via email service
  // For now: log it, return success
  return { message: 'Subscribed successfully' };
}
```

Add the module to `app.module.ts`. Keep it simple for Phase 1 — just log/store email.

### 5.6 Frontend API Service

```javascript
// FILE: /frontend/src/services/api.js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('accessToken');
const authH = () => ({ 'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) });

const ok = async res => {
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
  return d;
};

// Public
export const getBlogs = (p={}) => fetch(`${BASE}/blog?${new URLSearchParams(p)}`).then(ok);
export const getBlog = slug => fetch(`${BASE}/blog/${slug}`).then(ok);
export const getProducts = (p={}) => fetch(`${BASE}/products?${new URLSearchParams(p)}`).then(ok);
export const getMetrics = () => fetch(`${BASE}/metrics`).then(ok);
export const getCalculators = () => fetch(`${BASE}/calculators`).then(ok);
export const calculate = data => fetch(`${BASE}/calculators/calculate`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(ok);
export const submitContact = data => fetch(`${BASE}/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(ok);
export const subscribeNewsletter = email => fetch(`${BASE}/newsletter/subscribe`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email }) }).then(ok);

// Auth
export const login = creds => fetch(`${BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(creds) }).then(ok).then(d => { if(d.accessToken) localStorage.setItem('accessToken', d.accessToken); return d; });
export const register = data => fetch(`${BASE}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(ok);
export const logout = () => { localStorage.removeItem('accessToken'); };
export const getMe = () => fetch(`${BASE}/auth/me`, { headers: authH() }).then(ok);

// Admin (require auth)
export const adminGetBlogs = () => fetch(`${BASE}/blog`, { headers: authH() }).then(ok);
export const adminCreateBlog = d => fetch(`${BASE}/blog`, { method:'POST', headers:authH(), body:JSON.stringify(d) }).then(ok);
export const adminUpdateBlog = (id,d) => fetch(`${BASE}/blog/${id}`, { method:'PUT', headers:authH(), body:JSON.stringify(d) }).then(ok);
export const adminDeleteBlog = id => fetch(`${BASE}/blog/${id}`, { method:'DELETE', headers:authH() }).then(ok);
export const adminUploadImage = (file, type='blog/featured') => {
  const fd = new FormData(); fd.append('file', file);
  return fetch(`${BASE}/upload/${type}`, { method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body:fd }).then(ok);
};
export const adminGetContacts = () => fetch(`${BASE}/contact`, { headers: authH() }).then(ok);
export const adminGetUsers = () => fetch(`${BASE}/users`, { headers: authH() }).then(ok);
```

---

## 6. IMPLEMENTATION PHASES

**RULE: Complete each phase in full. Run acceptance criteria before starting the next.**

### Phase 1 — Foundation (2–3 hours)

**Tasks:**
1. `npm uninstall bootstrap bootstrap-icons react-bootstrap` (in `/frontend`)
2. Remove all Bootstrap imports from `main.jsx`, `index.html`, all `.jsx` files
3. Create `/frontend/src/styles/variables.css` — all values from Section 2.2
4. Create `/frontend/src/styles/globals.css` — reset, base body, link styles, form base
5. Create `/frontend/src/styles/animations.css` — all keyframes from Section 2.9
6. Import all 3 CSS files in `main.jsx` (in order: variables → globals → animations)
7. Add Plus Jakarta Sans to `index.html` `<head>`
8. Create `/frontend/src/hooks/useReveal.js`

**Acceptance Criteria:**
- `grep -r "bootstrap" frontend/src/` returns zero results
- Dev server starts, no CSS import errors
- `var(--color-primary)` resolves to `#274f3d` in browser DevTools

---

### Phase 2 — Global Components (3–4 hours)

**Tasks:**
1. Build `Button.jsx` — all variants from Section 2.6
2. Build `Card.jsx` — organic card from Section 2.7
3. Build `Badge.jsx` — pill chip with variants (primary, success, warning, error, neutral)
4. Build `Input.jsx` — soft rounded inputs from Section 2.2
5. Build `Textarea.jsx`
6. Build `Toast.jsx` — bottom-right success/error notification
7. Build `Spinner.jsx`
8. Rebuild `Navbar.jsx` — floating glass pill from Section 3.1
9. Rebuild `Footer.jsx` — dark green from Section 3.2
10. Build `PageHero.jsx` — gradient hero Section 3.3
11. Build `SectionWrapper.jsx` — wraps sections with correct bg + padding
12. Build `Container.jsx` — max-width wrapper
13. Build `VitalityRing.jsx` — from Section 2.8

**Acceptance Criteria:**
- All 13 components render without errors
- Navbar is sticky/fixed, glass effect visible, mobile hamburger works
- Footer is dark green, 4 columns
- VitalityRing animates on mount

---

### Phase 3 — Core Pages (4–6 hours)

**Tasks (frontend only):**
1. Rebuild `Home.jsx` — all 9 sections from Section 4.1. Hero floats glassmorphic card with VitalityRing.
2. Rebuild `Services.jsx` — PageHero + grid + process steps + CTA (Section 4.2)
3. Rebuild `Contact.jsx` — two-column layout, connected to `POST /api/contact` (Section 4.6)
4. Rebuild `Login.jsx` — glass card centered on gradient bg (Section 4.7). **Fix the empty space bug.**
5. Rebuild `Register.jsx` / `Signup.jsx` — same glass card pattern (Section 4.8)
6. Connect Home stats section to `GET /api/metrics`
7. Connect Home blog section to `GET /api/blog?limit=3`

**Acceptance Criteria:**
- Home page renders all 9 sections, no layout breaks at 375px, 768px, 1280px
- Contact form submits successfully, success toast appears
- Login/Register: no large empty space, card is vertically centered on all screens
- All VitalityRings animate on scroll into view

---

### Phase 4 — Blog & Calculators (3–4 hours)

**Tasks:**
1. Rebuild `Blog.jsx` — hero + search + filter chips + grid (Section 4.3)
2. Build `BlogPost.jsx` — single post page (Section 4.4)
3. Rebuild `Calculators.jsx` — sidebar + all 6 calculators (Section 4.5)
4. Create `/frontend/src/utils/calculators.js` — all maths functions
5. Build `VitalityRing` results display for each calculator
6. Animated counter: count-up from 0 to result on calculate click
7. "Email My Results" modal → `POST /api/calculators/calculate`

**Acceptance Criteria:**
- Blog grid shows posts from API, search and filter chips work
- BMI calculator produces correct result for weight 70kg, height 175cm (BMI = 22.9, Normal)
- Macro calculator shows 3 VitalityRings for Protein/Carbs/Fat

---

### Phase 5 — Admin Panel (6–8 hours)

**Tasks:**
1. Auth guard: redirect to `/login` if no `accessToken` in localStorage
2. Admin layout: sidebar + main content area
3. Blog list: table with Edit/Delete. Data from `GET /api/blog` (admin sees drafts too)
4. Blog editor: React-Quill (`npm install react-quill`) + all fields + image upload
5. Contact leads table: `GET /api/contact`
6. Users table: `GET /api/users`
7. Create newsletter subscriber endpoint in backend (Section 5.5)
8. Apply `useReveal` hook to all pages

**npm installs needed:**
```bash
cd frontend
npm install react-quill
```

**Acceptance Criteria:**
- Can create, edit, publish, delete a blog post end to end
- Published post appears on `/blog`
- Contact form submissions visible in admin
- Admin page inaccessible without valid JWT

---

### Phase 6 — Deploy (3–5 hours)

**Backend (.env — never commit):**
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=dietandwell
JWT_SECRET=minimum-32-chars-random-string
PORT=5000
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
```

**Frontend (.env):**
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

**Steps:**
1. Push `/backend` to GitHub → Connect to Railway → Set all env vars → Deploy
2. Push `/frontend` to GitHub → Connect to Vercel → Set `VITE_API_URL` → Deploy
3. CORS: add Vercel domain to NestJS CORS config in `main.ts`
4. Custom domain: configure in Vercel Settings → Domains
5. **CRITICAL:** Set `synchronize: false` in TypeORM config and run migrations properly before production
6. Seed admin user via `npm run seed` in Railway shell

**Fix TypeORM for production:**
```typescript
// backend/src/app.module.ts — TypeOrmModule config
synchronize: process.env.NODE_ENV !== 'production', // false in prod
```

**CORS fix:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://dietandwell.com',
    'https://www.dietandwell.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
});
```

---

## 7. CALCULATOR MATHS

All pure JavaScript. No external libraries.

```javascript
// FILE: /frontend/src/utils/calculators.js

export function calculateBMI({ weight, height, unit = 'metric' }) {
  const w = unit === 'imperial' ? weight * 0.453592 : weight;
  const h = unit === 'imperial' ? height * 0.0254 : height / 100;
  const bmi = w / (h * h);
  let category, color;
  if (bmi < 18.5)      { category = 'Underweight'; color = 'info'; }
  else if (bmi < 25)   { category = 'Normal'; color = 'success'; }
  else if (bmi < 30)   { category = 'Overweight'; color = 'warning'; }
  else                  { category = 'Obese'; color = 'error'; }
  return { value: Math.round(bmi * 10) / 10, category, color, min: 10, max: 40 };
}

export function calculateTDEE({ age, gender, weight, height, activity }) {
  // Mifflin-St Jeor
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const multipliers = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
  const tdee = Math.round(bmr * (multipliers[activity] || 1.55));
  return { value: tdee, label: 'calories/day', min: 1200, max: 4000 };
}

export function calculateBodyFat({ gender, waist, neck, height, hip }) {
  // US Navy formula (cm)
  let bf;
  if (gender === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
  let category, color;
  if (gender === 'male') {
    if (bf < 6) { category = 'Essential'; color = 'info'; }
    else if (bf < 14) { category = 'Athletic'; color = 'success'; }
    else if (bf < 18) { category = 'Fitness'; color = 'success'; }
    else if (bf < 25) { category = 'Average'; color = 'warning'; }
    else { category = 'Obese'; color = 'error'; }
  } else {
    if (bf < 14) { category = 'Essential'; color = 'info'; }
    else if (bf < 21) { category = 'Athletic'; color = 'success'; }
    else if (bf < 25) { category = 'Fitness'; color = 'success'; }
    else if (bf < 32) { category = 'Average'; color = 'warning'; }
    else { category = 'Obese'; color = 'error'; }
  }
  return { value: Math.round(bf * 10) / 10, category, color, min: 0, max: 50 };
}

export function calculateIdealWeight({ gender, height }) {
  // Hamwi formula
  const base = gender === 'male' ? 48 : 45.4;
  const extra = ((height - 152.4) / 2.54) * (gender === 'male' ? 2.7 : 2.3);
  const ideal = base + extra;
  return { min: Math.round(ideal * 0.9), max: Math.round(ideal * 1.1), unit: 'kg' };
}

export function calculateWater({ weight, activity, climate }) {
  let base = weight * 0.033;
  const actAdd = { sedentary: 0, light: 0.3, moderate: 0.5, active: 0.7, very_active: 1.0 };
  const climAdd = { temperate: 0, warm: 0.3, hot: 0.6 };
  const total = base + (actAdd[activity] || 0) + (climAdd[climate] || 0);
  return { value: Math.round(total * 10) / 10, unit: 'litres/day', min: 1, max: 5 };
}

export function calculateMacros({ calories, goal, diet }) {
  const adj = goal === 'lose' ? calories - 500 : goal === 'gain' ? calories + 300 : calories;
  const ratios = {
    balanced:     { protein: 0.30, carbs: 0.40, fat: 0.30 },
    low_carb:     { protein: 0.35, carbs: 0.25, fat: 0.40 },
    keto:         { protein: 0.25, carbs: 0.05, fat: 0.70 },
    high_protein: { protein: 0.40, carbs: 0.35, fat: 0.25 },
    plant_based:  { protein: 0.20, carbs: 0.55, fat: 0.25 },
  };
  const r = ratios[diet] || ratios.balanced;
  return {
    calories: adj,
    protein:  Math.round(adj * r.protein / 4),
    carbs:    Math.round(adj * r.carbs / 4),
    fat:      Math.round(adj * r.fat / 9),
  };
}
```

---

## 8. KNOWN ISSUES TO FIX (from Codebase Analysis)

Fix these as you encounter the relevant pages:

| Issue | Where | Fix |
|-------|-------|-----|
| Large empty space on Login/Register | Login.jsx, Register.jsx | Set `min-height: 100vh; display: flex; align-items: center` on page wrapper |
| No global error toast | App.jsx | Add Toast component rendered at root, wired to error state |
| No loading states | All data-fetching pages | Add `<Spinner />` while loading |
| Cart not persisted | Cart.jsx | Sync to `localStorage` on cart change + hydrate on mount |
| `synchronize: true` in prod config | backend/app.module.ts | Set `synchronize: false` when `NODE_ENV=production` |
| No pagination UI | Blog.jsx, Shop.jsx | Add page controls using `totalPages` from API responses |
| Form validation feedback missing | All forms | Show `<span class="form-error">` below each invalid field |

---

## 9. PACKAGES TO INSTALL

```bash
# Frontend (run in /frontend)
npm install react-quill
# Everything else (react-router-dom, etc.) should already be installed

# Backend — already installed, but verify:
npm list @nestjs/core nestjs typeorm pg bcrypt passport-jwt stripe multer
```

---

## 10. FINAL NOTES FOR AGENT

**On the Stitch design:** The Stitch "High-Tech Apothecary" / "Living Laboratory" concept is the design direction. Every colour, spacing, radius, and component spec in this document already incorporates it. Do not layer the two systems — this guide IS the merged result.

**On 3D:** The "3D" in this design is NOT Three.js or Spline. It is:
1. VitalityRings (glassmorphic SVG rings with gradient glow)
2. Floating glass cards (glassmorphism, ambient shadow, CSS float animation)
3. Organic card hover (scale 1.02, shadow deepen — no rotation)
4. Botanical gradient backgrounds (135° forest-to-mint)

This approach is lighter, faster, more maintainable, and looks more premium than a Spline embed for this type of wellness site.

**On "Metabolic Intelligence" / "Precision Nutrition Perfected":** These are placeholder copy examples from the Stitch demo. Replace with the actual DietAndWell copy before going live.

**On the Shop:** Do not build the shop in phases 1–5. The backend already supports it (products, cart, orders, Stripe). Build it as a separate Phase 7 after the site is live and getting traffic.

**Start with Phase 1. Now.**

---

*DietAndWell Final Master Guide v2.0 | Consolidated April 2025*  
*Supersedes: DietAndWell_Agent_Master_Reference.docx, all Copilot .md files*
