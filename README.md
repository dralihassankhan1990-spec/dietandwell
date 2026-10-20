# DietAndWell — Nutrition Coaching Website

Professional rebuild (October 2026) of Ali's real website, **dietandwell.com**.
React 18 + Vite frontend, NestJS + TypeORM + PostgreSQL backend.

> **Deploy is manual** — Ali deploys himself. Nothing in this repo deploys anywhere
> automatically. See [Deployment](#deployment).

## What this is

| Piece | Tech |
|---|---|
| Frontend | React 18, Vite, react-router-dom, Chart.js, Three.js |
| Backend | NestJS 11, TypeORM, PostgreSQL, JWT auth, Swagger |
| Design | Forest green `#0A6640` + amber `#B45309`, Playfair Display + Inter, CSS 3D cards, scroll-reveal, animated counters |

**Rules followed in this rebuild:**
- **No data/content changed** — services, prices, blog posts, testimonials, stats, copy, images are exactly as they were. Only design, code quality, bugs, responsiveness, accessibility.
- **Database-first, no keys required** — contact, newsletter, and calculator-save all persist to PostgreSQL and work with zero third-party keys. Resend email and Cloudinary uploads activate only when their env vars are set (graceful no-op otherwise).
- **No hardcoded credentials** — admin seed reads `ADMIN_EMAIL` (default `admin@dietandwell.com`) + `ADMIN_PASSWORD` (**required** env var, clear error if missing).

## Project structure

```
DietAndWell/
├── README.md                  ← this file (the ONLY root doc)
├── CHANGELOG.md              ← everything changed in the rebuild
├── TEST-REPORT.md            ← page-by-page + module-by-module test evidence
├── REMOVE-LIST.txt           ← files to delete from Drive (cleanup manifest)
├── frontend/                 ← React app (Vite)
│   ├── src/pages/            ← Home, Services, Blog, Calculators, Contact,
│   │                           About, Login, Register, Profile, Admin,
│   │                           Shop, ProductDetail, Cart, Subscriptions
│   ├── src/components/       ← layout, sections, UI, three (Hero3D)
│   ├── src/services/api.js   ← all backend calls
│   ├── src/utils/calculators.js ← client-side calculator math
│   ├── .env.example
│   └── package.json
└── backend/                  ← NestJS API (global prefix /api)
    ├── src/auth|blog|calculators|cart|contact|metrics|newsletter|
    │       products|services|upload|users|entities|seeds/
    ├── .env.example
    └── package.json
```

## Quick start (local development)

**Prerequisites:** Node.js 18+ and PostgreSQL 14+ running locally.

### 1. Backend

On this laptop, the existing `backend/.env` is already configured for PostgreSQL and port 8000. Do not replace it with `.env.example`, which would discard the local database credentials.

In a PowerShell terminal:

```powershell
cd 'E:\Muse Given\DietAndWell\backend'
npm install
npm run build
npm start
```

The API should report its database connection and serve `http://localhost:8000/api/status`.

**Seed the admin user** (fresh DB only; never resets an existing admin's password):

```bash
ADMIN_EMAIL=admin@dietandwell.com ADMIN_PASSWORD=<choose-a-strong-password> npm run seed
```

`ADMIN_PASSWORD` is required — the seed fails with a clear error if it is missing.
`ADMIN_EMAIL` defaults to `admin@dietandwell.com`.

### 2. Frontend

The existing `frontend/.env` points to `http://localhost:8000/api`. Keep the backend terminal open and start a second PowerShell terminal:

```powershell
cd 'E:\Muse Given\DietAndWell\frontend'
npm install
npm run dev
```

Open `http://localhost:3100`. Ports 3000 and 5000 are used by other apps on this laptop; DietAndWell will fail clearly if 3100 is occupied instead of silently switching ports.

Production build + preview:

```bash
npm run build
npm run preview             # http://localhost:3100
```

## Environment variables

### Backend (`backend/.env`) — see `backend/.env.example` for the full list

| Var | Required | Notes |
|---|---|---|
| `PORT` | No (default 8000) | API listen port |
| `NODE_ENV` | No | `development` / `production`. TypeORM `synchronize` is ON only when not production. |
| `DATABASE_LOGGING` | No | Defaults to `false`; opt in only while troubleshooting because SQL parameters may contain sensitive data. |
| `DATABASE_URL` | Yes (or `DATABASE_*` parts) | Takes precedence over `DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME` |
| `DATABASE_SSL` | No | Set `true` for Railway/Neon hosted Postgres |
| `FRONTEND_URL` | No | Comma-separated allowed origins (local `http://localhost:3100`). `dietandwell.com` / `www.dietandwell.com` are always allowed. |
| `JWT_SECRET` | **Yes** | Min 32 random chars. Server refuses to boot without it. |
| `JWT_EXPIRES_IN` / `REFRESH_TOKEN_EXPIRES_IN` | No | Defaults `1d` / `7d` |
| `REFRESH_TOKEN_SECRET` | Recommended | Separate refresh-token signing secret; falls back to `JWT_SECRET` for backward compatibility. |
| `RESEND_API_KEY` | No | **Optional.** Without it, contact/newsletter emails are a logged no-op and forms still succeed (data saved to DB). |
| `FROM_EMAIL` / `CONTACT_EMAIL` | No | Used only when Resend is configured |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Password **required for seed** | See seed step above |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No | **Optional.** When all three are set, uploads go to Cloudinary. Otherwise uploads stay on local disk under `backend/public/uploads` and nothing fails. |

### Frontend (`frontend/.env`) — see `frontend/.env.example`

| Var | Required | Notes |
|---|---|---|
| `VITE_API_URL` | No (default `http://localhost:8000/api`) | Backend base URL |
| `VITE_SPLINE_URL` | No | Full Spline scene URL. When set, the home hero shows the Spline embed; when unset, the built-in Three.js hero is used. |

## API (base `/api`, Swagger at `/api/docs`)

| Group | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET/PATCH /auth/me` |
| Blog | `GET /blog`, `GET /blog/:slug`, `GET /blog/categories`, `GET /blog/tags`, `GET /blog/admin/all` (admin), `POST/PATCH/DELETE /blog` (admin) |
| Calculators | `GET /calculators`, `POST /calculators/calculate`, `POST /calculators/save` (public, emails result if Resend configured), `POST /calculators/calculate/save` (JWT), `GET /calculators/my-results` (JWT) |
| Contact | `POST /contact` (public), `GET /contact`, `PATCH /contact/:id/read` (admin) |
| Newsletter | `POST /newsletter/subscribe` (public), `GET /newsletter/subscribers`, `DELETE /newsletter/subscribers/:id` (admin) |
| Products / Services | `GET /products`, `GET /products/:slug`, `GET /services`, `GET /services/:slug` (+ admin product CRUD) |
| Cart / Orders | `GET /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/:id`, `POST /orders`, `GET /orders[/:id]`, `GET /orders/admin/all`, `PATCH /orders/:id/status` |
| Users / Upload / Metrics | `GET /users` (admin), `POST /upload/*` (admin), `GET /metrics` |

Full endpoint inventory with auth requirements: see `TEST-REPORT.md`.

## Deployment (manual — Ali's step)

1. **Backend → Railway** (or any Node host): set all `backend/.env` vars in the
   host dashboard. `npm install && npm run build && npm start`.
   **Production note:** `synchronize` is OFF in production — run the schema
   migrations before serving traffic. For this update, apply
   `backend/migrations/20261018-cart-variant-labels.sql`.
2. **Frontend → Vercel**: root directory `frontend/`, build `npm run build`,
   output `dist`, env `VITE_API_URL=<your backend URL>/api`.
3. **Domain:** point `dietandwell.com` at the Vercel project.
4. **Optional services:** add `RESEND_API_KEY` for real email delivery;
   add `CLOUDINARY_*` for cloud image storage. Both are optional.

## Testing

```bash
# Frontend: build must pass
cd frontend && npm install && npm run build

# Backend: typecheck + build must pass
cd backend && npm install && npm run build

# Live API smoke test (needs PostgreSQL): see TEST-REPORT.md §3 for the
# exact curl sequence used in verification.
```

## Modification Round 1 (October 2026) — what was added

### Demo/test users (one-time reset)

```bash
cd backend
npm run seed:users
```

This **wipes the `users` table and recreates 4 users** — run it once for local testing.
It never runs automatically on backend boot. Test accounts:

| Email | Password | Role | Can do |
|---|---|---|---|
| `admin@dietandwell.com` | `root` | admin | Everything: shop, orders, users, settings, blogs |
| `editor@dietandwell.com` | `editor123` | editor | Manage blog posts |
| `customer@test.com` | `customer123` | customer | Shop, My Library |
| `visitor@test.com` | `visitor123` | visitor | Browse as a registered visitor |

The script prints this table when it runs. After go-live, create real users via the
admin panel (Admin → Users) instead — never re-run `seed:users` on a live database.

### Demo shop content

```bash
npm run seed:demo
```

Idempotent (skip-if-exists, never wipes): 3 categories (Digital Books, Nutritional Products,
Superfoods & Seeds), 4 digital books with sample PDFs (PKR 499–799), 7 nutritional products
with PKR pack-size variants, 4 starter blog posts, and a `bank_account_details` placeholder
setting. Everything is marked `[Demo]` and fully editable/deletable from the admin panel.

### Digital products — how selling works

1. Customer opens a digital product → fills the request form (name, contact, email) →
   chooses **Request access** or **Bank transfer** (your account details are shown —
   edit them anytime in Admin → Settings → `bank_account_details`).
2. The request lands in **Admin → Orders** (Pending tab). You click **Grant** or **Reject**.
3. Granted customers download the file from **My Library** (navbar → My Library, login required).
   The download endpoint checks the grant server-side — no grant, no file.

### Online payments (JazzCash / Easypaisa)

Not connected yet — there are no gateway keys. The code is ready: `backend/src/payments/`
has a `PaymentProvider` interface plus `JazzCashService` / `EasypaisaService` stubs that
honestly return **501 Not configured**. Step-by-step setup instructions (where to get
merchant credentials, exact `.env` key names, which stub methods to implement) are in
**[JAZZCASH_EASYPAISA_GUIDE.md](JAZZCASH_EASYPAISA_GUIDE.md)**.

### Going live — database notes

On a **fresh** database everything is created automatically. On your **existing** database
run these once (TypeORM `synchronize` does not alter existing enum types or add columns
in production):

```sql
ALTER TYPE user_role ADD VALUE 'customer';
ALTER TYPE user_role ADD VALUE 'visitor';
-- if the calculator_type enum already exists:
ALTER TYPE calculator_type ADD VALUE 'waist_hip';
ALTER TYPE calculator_type ADD VALUE 'lean_mass';
ALTER TYPE calculator_type ADD VALUE 'calorie_target';
ALTER TYPE calculator_type ADD VALUE 'fiber';
ALTER TYPE calculator_type ADD VALUE 'must_score';
ALTER TYPE calculator_type ADD VALUE 'corrected_calcium';
ALTER TYPE calculator_type ADD VALUE 'iron';
ALTER TYPE calculator_type ADD VALUE 'breastfeeding';
ALTER TYPE calculator_type ADD VALUE 'sweat_rate';
ALTER TYPE calculator_type ADD VALUE 'sodium_loss';
ALTER TYPE calculator_type ADD VALUE 'urine_check';
ALTER TYPE calculator_type ADD VALUE 'infant_formula';
ALTER TYPE calculator_type ADD VALUE 'athlete_protein';
ALTER TYPE calculator_type ADD VALUE 'carb_loading';
ALTER TYPE calculator_type ADD VALUE 'preworkout_carbs';
ALTER TABLE blog_post ADD COLUMN IF NOT EXISTS "coverImage" text;
```

## Known gaps / things to know (not bugs introduced by the rebuild)

- **`backend/demo-services.json` and `backend/demo-blog-posts.json` are 0 bytes**
  in Drive — the original demo content is lost. The seed handles this
  gracefully (warns, seeds nothing). Services/blog lists are empty on a fresh
  DB until real content is added via the admin panel. No replacement content
  was invented.
- **Pre-existing content inconsistencies left untouched** (no data changes):
  spec says "2+ Years" but the site renders "10+ Years"; the Contact FAQ
  mentions `$49–$199/month` while prices elsewhere are PKR; the April 2025
  spec says 10 services, the code has 6. Ali to confirm which is correct.
- **Cloudinary upload path and Resend delivery** are code-reviewed only —
  no keys exist (by decision). Verify with real keys on staging.
- **Production `synchronize:false`** behaviour is untested (dev uses
  `synchronize:true`). See Deployment note above.
- **Logged-in browser click-through** (admin panel, checkout, profile) was
  verified at API + code level, not by clicking in a logged-in browser.

## History

- **April 2025** — original master spec (`DietAndWell_Agent_Master_Reference`).
- **October 2026** — full professional rebuild: package.json files reconstructed
  (both were 0 bytes), NestJS backend kept + fixed, frontend rebuilt to the
  design system, 3D hero rebuilt with Three.js/CSS, all features wired to the
  real API, cleanup manifest in `REMOVE-LIST.txt`. See `CHANGELOG.md`.
