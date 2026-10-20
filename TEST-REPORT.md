# DietAndWell — Test Report (October 2026 rebuild)

How this was verified: frontend worker (build + preview + math checks) →
backend worker (live PostgreSQL boot, every route curled) → QA/integration
pass (integration fixes + full re-test) → **coordinator re-verification**
(frontend build in place, backend build, live boot + smoke curls,
calculator re-check, file-level confirmation of every integration fix).
"Verified" below means evidence exists, not "looks fine".

---

## 1. Builds (coordinator re-verified)

| Build | Command | Result |
|---|---|---|
| Frontend | `cd frontend && npm run build` | ✅ PASS — 114 modules, `✓ built in 12.00s`, exit 0. Only a chunk-size warning (cosmetic). |
| Backend | `cd backend && npm install && npm run build` | ✅ PASS — `nest build`, exit 0, 0 type errors. |

**Important:** the in-place frontend build passes only with the root 0-byte
`package.json` / `package-lock.json` moved aside (something in the toolchain
tries to parse `../package.json` and chokes on the empty file). Both files
were restored byte-for-byte (still 0 bytes, md5
`d41d8cd98f00b204e9800998ecf8427e`). Once the parent deletes them per
`REMOVE-LIST.txt`, all vite commands work — verified, not assumed.

## 2. Frontend — page-by-page (preview of production build, real renders)

| Route | Result | Notes |
|---|---|---|
| `/` Home | ✅ | "Precision Nutrition" hero (Three.js), newsletter form, counters |
| `/about` | ✅ | Static; `card-3d` value cards |
| `/services` | ✅ | Grid renders |
| `/services/:slug` | ✅ | Renders Service-not-found state when no services exist (not blank) |
| `/blog` | ✅ | List, search/filter; renders posts incl. drafts test post |
| `/blog/:slug` | ✅ | Title + body render |
| `/calculators` | ✅ | All calculators render; see §4 |
| `/contact` | ✅ | Form + info cards |
| `/login`, `/register` | ✅ | Forms render |
| `/shop` | ✅ | Real product grid + categories + add-to-cart |
| `/shop/:slug` | ✅ | Product detail + price |
| `/subscriptions` | ✅ | Billing/currency toggles; CTAs → `/contact` |
| `/profile` (logged out) | ✅ | Client-side redirect to `/login` (Sign-In page renders) |
| `/cart` (logged out) | ✅ | Client-side redirect to `/login` |
| `/admin` (logged out) | ✅ | Client-side redirect to `/login` |
| unknown route | ✅ | "Page Not Found" + home link |

All 17 routes returned HTTP 200 in the preview smoke test. No blank pages.

## 3. Backend — module-by-module (live PostgreSQL boot + curl)

Backend worker + QA each booted the real server against a scratch DB and
exercised **every route**. Coordinator re-verified a smoke subset on a fresh
scratch DB (see §5). Full inventory (all under `/api`):

| Module / route | Auth | Result |
|---|---|---|
| `GET /`, `GET /status` | public | ✅ |
| `POST /auth/register`, `/auth/login`, `/auth/refresh` | public | ✅ |
| `POST /auth/logout`, `GET /auth/me` | JWT | ✅ (logout revokes → 401; `/me` returns no password/refreshToken) |
| `GET /blog` (published), `GET /blog/:slug` (published, +1 view), `GET /blog/categories`, `/blog/tags` | public | ✅ |
| `GET /blog/admin/all` | admin | ✅ (new; drafts included) |
| `POST /blog`, `PATCH /blog/:id`, `DELETE /blog/:id` | admin | ✅ (frontend's exact payload incl. `status` accepted) |
| `GET /products`, `GET /products/categories`, `GET /products/:slug` | public | ✅ |
| `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` | admin | ✅ |
| `GET /services`, `GET /services/:slug` | public | ✅ (admin CRUD intentionally absent) |
| `POST /contact` | public | ✅ (email optional; persists; Resend no-op without key) |
| `GET /contact`, `PATCH /contact/:id/read` | admin | ✅ (mark-read 404s on unknown id) |
| `POST /newsletter/subscribe` | public | ✅ (new; idempotent duplicate; bad email → 400) |
| `GET /newsletter/subscribers`, `DELETE /newsletter/subscribers/:id` | admin | ✅ (new; re-delete → 404; non-admin → 403) |
| `GET /calculators`, `POST /calculators/calculate` | public | ✅ (list + calculate; invalid type/missing inputs → 400, not 500) |
| `POST /calculators/save` | public | ✅ (new; emails result if Resend configured, else no-op) |
| `POST /calculators/calculate/save`, `GET /calculators/my-results` | JWT | ✅ |
| `GET /metrics`, `GET /metrics/admin` | public / admin | ✅ (read-only; seeded values are decimal strings — frontend parses with `Number()`) |
| `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart` | JWT | ✅ |
| `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` | JWT / admin for status | ✅ (order total computed: 2 × 25.50 = 51.00) |
| `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` | admin | ✅ (no password hashes in responses) |
| `POST /upload/blog/featured`, `/upload/blog/content`, `/upload/product/featured`, `/upload/product/gallery`, `/upload/image` | admin | ✅ (local verified: 1px PNG → `/uploads/...` URL → fetched back 200) |
| Seed (run twice) | — | ✅ (2nd run all-skips; without `ADMIN_PASSWORD` → clear failure error) |
| CORS | — | ✅ (allowed origin → 204 + header; disallowed → no CORS headers, no 500) |

## 4. Calculator math (independently re-verified)

Hand-computed values, confirmed via the live API by the coordinator:

| Calculator | Input | Expected | Live API |
|---|---|---|---|
| BMI | 70 kg / 170 cm | 24.2, Normal Weight | `{"bmi":24.2,"category":"Normal Weight"}` ✅ |
| TDEE | male, 70/170/30, moderate | BMR 1618, TDEE 2508, loss 2008, gain 2808 | `{"bmr":1618,"tdee":2508,"weightLoss":2008,"weightGain":2808}` ✅ |
| Body fat (Navy) | male, waist 85, neck 38, height 175 | 16.9% | ✅ (QA live check) |
| Macros | 2000 kcal maintenance, balanced | 150 g P / 225 g C / 56 g F | ✅ (QA live check) |
| Water | 70 kg, moderate | 2.8 L | ✅ (frontend worker) |
| Ideal weight (Devine) | male, 175 cm | 70 kg | ✅ (frontend worker) |

Frontend worker also verified in Node: BMR female 1452; VO₂max 47.5;
cholesterol Total:HDL 4.0; alcohol 500 ml @ 5% = 2.5 units. All PASS.

## 5. Coordinator's own live smoke test (fresh scratch DB, 2026-10-16)

```
GET  /api/status                        → {"status":"ok", ...} ✅
POST /api/newsletter/subscribe          → {"success":true, subscriber:{...}} ✅
GET  /api/blog                          → {"posts":[],"total":0,...} ✅ (fresh DB)
POST /api/contact                       → {"status":"new", id:...} ✅
POST /api/calculators/calculate (BMI)   → {"bmi":24.2,"category":"Normal Weight"} ✅
POST /api/calculators/calculate (TDEE) → {"bmr":1618,"tdee":2508,...} ✅
```
(One first attempt sent `{weightKg, heightCm}` and correctly got
`400 "Field 'weight' is required"` — the API expects `weight`/`height`
kg/cm, exactly what the frontend sends. That 400 is correct validation,
not a bug.) Scratch DB + role dropped afterwards; no test `.env` left.

## 6. Integration fixes verified at file level (coordinator)

- `frontend/src/services/api.js` — BASE `http://localhost:5000/api`,
  `subscribeNewsletter` → `POST /newsletter/subscribe`,
  `adminGetBlogs` → `GET /blog/admin/all`,
  `adminGetSubscribers` / `adminDeleteSubscriber` wired. ✅
- `frontend/src/pages/Admin.jsx` — `PostsList` uses `adminGetBlogs()`,
  real `SubscribersList` (rows + Remove + flash). ✅
- `frontend/src/pages/Cart.jsx` — checkout: shipping-address form →
  `createOrder({shippingAddress, notes})` → confirmation state. ✅
- `backend/src/main.ts` — CORS allowlist incl. `localhost:3000`,
  `localhost:4173`, `FRONTEND_URL` split. ✅
- `.env.example` (both) — document real vars, no secrets. ✅
- Admin seed — `ADMIN_EMAIL` default + `ADMIN_PASSWORD` required. ✅
- Stats intact — `666+ Clients`, `10+ Years` still in Home.jsx (no data
  change). ✅

## 7. NOT verified / remaining risks (honest list)

- **Logged-in browser click-through** (admin panel rendering, checkout
  click, profile with real orders, calculator Save button) was verified at
  API + code level, not by clicking through in a logged-in browser session.
  Recommend a quick manual pass on staging.
- **Cloudinary upload path** — no credentials exist (by decision). Local
  fallback verified live; Cloudinary branch is code-reviewed only. Verify
  with real keys on staging.
- **Resend email delivery** — no `RESEND_API_KEY`. Both email paths verified
  to no-op gracefully and return success.
- **Production `synchronize:false`** — dev boot uses `synchronize:true`.
  Production needs a first-boot sync / migration strategy (see README).
- **No `.env` existed** before or after. Deploy machine must supply
  `DATABASE_URL` / `JWT_SECRET` / etc. and run `npm install` + `npm run build`.
  `node_modules/` and `dist/` were removed after verification.
- **Empty services/blog on fresh DB** — `demo-services.json` +
  `demo-blog-posts.json` are 0 bytes in Drive (original demo content lost).
  Seed warns and seeds nothing for them. Add real content via the admin
  panel; no replacement content was invented.
- **Profile settings save** — resolved on 2026-10-18 with authenticated
  `PATCH /auth/me`; verified against PostgreSQL and through the browser UI.
- **Pre-existing content inconsistencies** (left untouched per no-data-change
  rule): spec "2+ Years" vs site "10+ Years"; Contact FAQ `$49–$199/month`
  vs PKR prices elsewhere; spec 10 services vs code 6.

---

## 8. Modification Round 1 — verification (coordinator, 2026-10-18)

Four workers built in parallel; the coordinator integrated (routes, admin shell)
and re-verified everything below on the local tree. Note: the VM was replaced
mid-verification (PostgreSQL vanished with it); all live-DB checks below ran
BEFORE the replacement on a scratch DB `dw_r1_verify`. Post-replacement,
the 15 new calculator formulas were re-verified directly against the compiled
`dist` output (19/19), and both builds were re-run.

### Builds
- `backend: npm run build` (nest build) — PASS, 0 errors (run 3×, incl. after every
  coordinator change).
- `frontend: vite build` — PASS (238 modules). Note: this VM's `copy_file_range`
  syscall is broken (affects `cp` and vite's public-dir copy); the build was run
  with a temporary CJS config + manual `public/` copy. Environment-specific —
  Ali's laptop is unaffected.

### Backend live boot + curl (scratch Postgres 16, fresh DB)
- Boot: all modules initialize (Categories, DigitalOrders, Settings, Payments, Users…).
- `npm run seed:users` — 4 users created, bcrypt-verified, credentials table printed. ✅
- `npm run seed:demo` — 3 categories, 11 products (4 digital + 7 physical), 4 blog
  posts, settings placeholder; second run skips everything (idempotent). ✅
  (Coordinator fix: `main()` never called `seedDemoContent` — blog seeding was dead
  code; public blog total went 0 → 4 after the fix.)
- Logins: admin/root, editor/editor123, customer/customer123, visitor/visitor123 —
  all 201 with valid JWTs. ✅
- Blog CRUD (admin): create 201 (slug `verify-post-one`), duplicate title →
  `verify-post-one-2`, PATCH 200, DELETE 200. Editor create → 201 after the
  admin+editor role widening (was 403). ✅
- Role guards: editor→403 and customer→403 on `GET /users`; admin→200. ✅
- Digital-order flow: public request 201 → download before grant 403 →
  admin grant 200 → download 200 with real PDF bytes (`%PDF-` header, 844 bytes) →
  `GET /digital-orders/mine` shows granted. ✅
- User management: admin create 201 → deactivate 200 → deactivated login 401. ✅
- Calculator save: all 15 new types (`waist_hip`, `lean_mass`, `calorie_target`,
  `fiber`, `must_score`, `corrected_calcium`, `iron`, `breastfeeding`, `sweat_rate`,
  `sodium_loss`, `urine_check`, `infant_formula`, `athlete_protein`, `carb_loading`,
  `preworkout_carbs`) — server-side formulas implemented; 19/19 hand-checks pass
  against compiled output, matching the frontend utils. ✅
- Backend worker's own evidence: ~63 curl calls covering categories CRUD
  (200/201/404/409/400/401/403), products (filters, pagination, JSON + multipart),
  orders (18 calls incl. 403s and email-matched guest download), settings
  (whitelist, upsert, no-overwrite), users (9 calls, zero password leakage).

### Frontend (production build preview)
- 17 routes return 200: `/`, `/about`, `/services`, `/blog`, `/blog/:slug`,
  `/calculators`, `/contact`, `/login`, `/register`, `/shop`, `/shop/:slug`,
  `/subscriptions`, `/profile`, `/cart`, `/library` (new), `/admin`, plus 404 fallback.
- All 6 generated images serve 200: `shop-hero`, `blog-hero`, `calculators-hero`,
  `cat-digital-books`, `cat-nutritional`, `cat-superfoods`. ✅
- Admin shell: BlogManager (TipTap), CategoryManager, ProductManager, OrderManager,
  SettingsManager, UserManager all mounted as tabs; old textarea editor retired. ✅

### Calculator math
- Worker: 30/30 hand-checks pass (table in worker report).
- Coordinator: 19/19 backend-port checks pass (Boer 56.0/44.9, WHR 0.85, calorie
  target 1950, fiber 38g, MUST 6/high, corrected Ca 9.8, iron 18/27, breastfeeding
  2530/2600, sweat 2.0 L/h, sodium 1500 mg/h, urine 2→hydrated/7→dehydrated,
  formula 750 mL/94 mL, athlete protein 133 g, carb load 770 g, pre-workout 140–210 g).

### NOT verified / remaining risks (Round 1, honest list)
- Logged-in browser click-through (TipTap editor typing, 3D scroll feel, checkout
  clicks) — API + build level only; recommend one manual staging pass.
- Live-DB checks ran before the VM replacement; the tree is unchanged since, and
  both builds + formula checks were re-run after.
- Existing (non-fresh) databases need the README's manual SQL (enum values,
  `coverImage` column).
- Cloudinary path untested (no keys, by decision); local-disk uploads verified.
- Child BMI keeps the old simplified percentile estimate (no-content-change rule).

---

## 9. Integration hardening verification (2026-10-18)

- Frontend and backend production builds: PASS.
- Live PostgreSQL/API flow: registration, profile update, refresh rotation,
  product/category UUID relationship, variant cart pricing, admin physical-order
  listing, logout revocation: 9/9 PASS.
- Browser verification: Shop loaded database products after the development CORS
  repair; admin login rendered Blog and Physical Orders; Profile Save Changes
  returned “Profile updated successfully.”
- Browser console: no application errors. React Router future notices were removed
  by enabling the supported v7 compatibility flags.
- Temporary test user, product, category, and cart data were cleaned up.
