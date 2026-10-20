# DietAndWell — Rebuild Changelog (October 2026)

> **Round 1 (2026-10-18)** added at the bottom as §5. Round 0 (rebuild) is §0–§4 below.

Scope: professional rebuild, page by page, all features working, 3D style,
**no data/content changed**. Framework kept: React 18 + Vite frontend,
NestJS + TypeORM backend (the April 2025 spec claimed Express + raw pg —
the real code is NestJS; the framework was NOT rewritten).

Conventions: grouped by area. The rebuild was done by three passes
(frontend, backend, QA/integration). No file was deleted from the local
tree; deletions are listed in `REMOVE-LIST.txt` for the Drive sync.

---

## 0. Scaffold (both package.json files were 0 bytes — project could not install/build)

- `frontend/package.json` — RECONSTRUCTED from actual imports:
  `react ^18.3.1`, `react-dom ^18.3.1`, `react-router-dom ^6.26.2`,
  `three ^0.170.0`, `chart.js ^4.4.3`, dev `vite ^5.4.8` +
  `@vitejs/plugin-react ^4.3.1`. Scripts: `dev` / `build` / `preview`.
- `frontend/package-lock.json` — GENERATED via `npm install`.
- `frontend/vite.config.js` — proxy `/api` corrected 8000 → **5000** (backend port).
- `frontend/.env.example` — NEW (`VITE_API_URL`, commented `VITE_SPLINE_URL`).
- `frontend/.gitignore` — NEW. Root `.gitignore` — NEW.
- `backend/package.json` — RECONSTRUCTED from actual imports: NestJS 11,
  TypeORM, pg, class-validator/transformer, @nestjs/swagger, bcryptjs, multer,
  passport-jwt, resend, cloudinary.
- `backend/package-lock.json` — GENERATED via `npm install`.
- `backend/tsconfig.json` — strict, `strictPropertyInitialization:false`
  (Nest standard for entities/DTOs). `backend/tsconfig.build.json`,
  `backend/nest-cli.json` — NEW.
- `backend/.env.example` — NEW (all vars documented).
- `backend/.gitignore` — was fully commented out (nothing ignored) — REWRITTEN.

## 1. Backend (NestJS + TypeORM, `backend/src/`)

### Core
- `main.ts` — CORS allowlist (`FRONTEND_URL` + `localhost:5173` + `localhost:3000`
  + `localhost:4173` + `dietandwell.com`/`www.dietandwell.com`; quiet deny
  instead of 500). Absolute static path for `/uploads`. Swagger fixed to
  `/api/docs` (was served at `/docs` under the global prefix). NestJS Logger
  instead of `console.log`.
- `app.module.ts` — `DATABASE_URL` takes precedence over `DATABASE_*` parts;
  `synchronize` OFF in production; SQL logging explicit opt-in; `Subscriber` +
  `NewsletterModule` wired.
- `app.controller.ts` — `@Get('api')` served at `/api/api` → renamed `/api/status`.
- `data-source.ts` + `seed.ts` — `DATABASE_URL` support, correct `.env` paths,
  seed loads env (previously read unset vars).

### Auth (`auth/`)
- `bcrypt` (native) → `bcryptjs` everywhere (no native build needed).
- JWT expiry from `JWT_EXPIRES_IN` / `REFRESH_TOKEN_EXPIRES_IN`.
- `JwtStrategy` strips password/refreshToken from `req.user`, rejects
  deactivated users; login rejects deactivated accounts.
- Both RolesGuards use `ROLES_KEY` + `getAllAndOverride` + null-safe user
  (old auth guard crashed on missing user and ignored class-level roles).

### Blog (`blog/`)
- `CreatePostDto` gains `status` (frontend admin sends it; with
  `forbidNonWhitelisted` the old DTO 400'd every admin save).
- Service keeps `published` ↔ `status` in sync + sets `publishedAt`.
- Public `GET /blog/:slug` is published-only (drafts previously leaked) with
  view-count increment.
- **NEW `GET /blog/admin/all`** (admin, includes drafts).
- Excerpt defaults to `''` (NOT NULL column).

### Calculators (`calculators/`)
- Aligned to `frontend/src/utils/calculators.js`: BMI 1 decimal + 7-tier
  categories; TDEE weightGain +300 + activityLabel; macros accept
  camelCase/snake_case goals + diet styles, return `fats` + percentages
  (+ legacy `fat` alias); water honours activity/climate, returns
  litres/liters/ml/min/max/daily/glasses; body-fat clamped ≥0 + category/color.
- Invalid type / missing inputs → 400 (was uncaught 500).
- **NEW `GET /calculators`** (calculator catalogue).
- **NEW `POST /calculators/save`** (spec §5.2: public, emails result via
  Resend if configured, else no-op).
- Fixed `getMyResults` (joined a non-existent `result.calculator` relation).
- DTO accepts both `{type, inputData}` and flat `{type, ...inputs}` shapes
  (flat fields must be declared or the strict ValidationPipe 400s).

### Contact (`contact/`)
- Persists + sends admin notification via Resend **only if**
  `RESEND_API_KEY` set (graceful logged no-op otherwise; form still succeeds).
- `markAsRead` now 404s on unknown id (was silent null).

### Newsletter (`newsletter/` — NEW, was entirely missing)
- `entities/subscriber.entity.ts`, `newsletter/` module (service/controller/DTO).
- `POST /newsletter/subscribe` (public, idempotent, lowercases email),
  `GET /newsletter/subscribers` + `DELETE /newsletter/subscribers/:id` (admin).

### Cart / Orders (`cart/`)
- `Order` gains `notes` column (service wrote it, column didn't exist).
- `OrderItem.subtotal` now set (NOT NULL column was left unset → insert failed).
- Totals computed as subtotal + tax(0); stock check covers new cart total.
- `getOrderById` / `updateOrderStatus` now 404 on missing + validate status enum.

### Users (`users/`)
- `findAll` / `findOne` / `create` / `update` returned password hashes — now
  sanitized (internal full-entity lookup kept separate so update can't null
  the password). `bcryptjs`.
- `CreateUserDto.role` made optional (was failing validation when omitted).
- **NEW `GET /users/:id`** (admin).

### Upload (`upload/`)
- Added missing `public/uploads/general` dir (multer doesn't create dirs).
- Cloudinary used **only when all three** `CLOUDINARY_*` vars are set (file
  moved to Cloudinary, local deleted, Cloudinary URL returned). Any
  failure/missing config falls back to local storage; upload never fails
  for Cloudinary reasons.

### Entities (`entities/`)
- `Category.posts` (`@OneToMany(post => post.category)` referenced a
  non-existent property — would break TypeORM metadata) →
  `@ManyToMany(post => post.categories)`; same fix for
  `ProductCategory.products`.
- `User.refreshToken` explicit `varchar` (TypeORM rejected the union type
  at boot). `BlogPost.publishedAt: Date | null`.

### Seeds (`seed.ts`, `seeds/`)
- Admin seed reads `ADMIN_EMAIL` (default `admin@dietandwell.com`) +
  **required** `ADMIN_PASSWORD` (clear error if missing). No hardcoded
  credentials. Never resets an existing admin's password.
- Demo seed reads JSON via fs with empty/missing-file tolerance (the
  `import … .json` form would have failed to compile on the 0-byte files),
  also seeds 4 metrics + 6 calculator definitions, all skip-if-exists,
  never overwrites.

### Services (`services/`)
- Dead commented-out code + unused imports removed. Admin CRUD stays
  intentionally unexposed (note in file).

## 2. Frontend (`frontend/src/`)

### Design system (`styles/`)
- `variables.css` — spec tokens: `--color-primary #0A6640`,
  `--color-primary-dark #054D30`, `--color-primary-light #E8F5EE`,
  `--color-accent #B45309`, `--color-accent-light #FEF3C7`, neutrals,
  semantic `#059669/#D97706/#DC2626/#2563EB`, `--font-heading Playfair
  Display`, `--font-body Inter`, `--shadow-sm/md/lg/xl/glow/amber`,
  `--perspective`.
- `globals.css` — headings → Playfair Display.
- `animations.css` — `.card-3d` tilt, `.hero-orb` CSS fallback,
  reduced-motion extended to `.card-3d` / `.hero-orb`.
- `not-found.css` — NEW (NotFound styles moved out of JSX).
- Per-page CSS appends: `home.css`, `services.css`, `contact.css`,
  `blog.css`, `blog-post.css`, `Subscriptions.css`, `Shop.css` (spinner),
  `Cart.css` (qty stepper + checkout form), `calculators.css` (save-row,
  `ref-dot-*`), `Profile.css`, `admin.css`, `Footer.module.css` (tagline),
  `calc-home-section.css`, `nutrition-carousel.css`.

### App / routing / layout
- `App.js` — `/shop` → real `Shop`, `/subscriptions` → real `Subscriptions`
  (ComingSoon unrouted). NotFound styles moved to CSS. `<Link>` instead of
  `<a href="/">`. `TopBar` mounted.
- `components/layout/TopBar.jsx` + `TopBar.css` — NEW (spec §3.1, hidden
  on mobile).
- `Navbar.jsx` — removed "Soon" badges.
- `Footer.jsx` — removed dead `/#` Privacy/Terms links; socials → real
  `facebook.com/dietandwell`, `instagram.com/dietandwell`; dropped generic
  X/LinkedIn homepages; inline style → class.
- `index.html` — Playfair Display + Inter fonts per spec; theme-color →
  `#0A6640`.
- `config.js` — default API base 8000 → **5000**.

### API (`services/api.js`)
- Rewritten to the real backend contract: added cart/orders/services/
  products/categories/calculator-save/my-results; removed bogus
  `getCalculators`/`runCalculator`/`adminGetAllBlogs` (replaced by real ones).
- QA pass added: `subscribeNewsletter()` → `POST /newsletter/subscribe`;
  `adminGetBlogs()` → `GET /blog/admin/all`; `adminGetSubscribers()` →
  `GET /newsletter/subscribers`; `adminDeleteSubscriber(id)` →
  `DELETE /newsletter/subscribers/:id`; `getCalculators()` →
  `GET /calculators`. Header notes updated (five "does not exist" gaps CLOSED).

### 3D / data-viz
- `components/three/Hero3D.jsx` — NEW. Three.js glowing sphere + orbit ring
  + particles; `VITE_SPLINE_URL` set → Spline iframe embed; WebGL failure →
  CSS orb; respects `prefers-reduced-motion`. Loaded via `React.lazy` +
  Suspense on Home.
- `components/data-viz/MacroDoughnut.jsx` — NEW (Chart.js doughnut, colours
  from CSS vars).
- `components/data-viz/VitalityRing.jsx` + `VitalityRing.css` — NEW (inline
  styles → CSS, unique gradient `useId()` per ring fixing duplicate
  `id="ringGradient"`).

### Pages
- `Home.jsx` — Hero3D via lazy+Suspense; newsletter → real
  `subscribeNewsletter` with error state; all static inline styles →
  `home.css` classes; `card-3d` on calc/service/testimonial/blog/nutrition
  cards; removed unused `navigate`.
- `Services.jsx` — inline styles → classes, `card-3d`.
- `ServiceDetail.jsx` — api helper, not-found state, dead "Enroll" button →
  Link to `/contact`, removed `dangerouslySetInnerHTML` (`longDescription`
  now rendered as text), price → PKR.
- `Blog.jsx` — newsletter → real subscribe with error state, `card-3d`,
  JSX fragment bug fixed.
- `BlogPost.jsx` — newsletter → real subscribe, removed `style` prop on
  `Badge`, `card-3d` on related cards.
- `Calculators.jsx` — deep-link honours `location.state.openCalc` +
  `sessionStorage` + aliases (`calories→tdee`, `ideal→ideal_weight`);
  `SaveResult` buttons for the 5 backend-supported types; Chart.js doughnut
  replaces rings for macros; guideline hex → semantic `ref-dot-*` classes;
  honest "cannot save" note on Ideal Weight; `card-3d` on category cards.
- `Contact.jsx` — removed dead Subject field (never sent); info cards → spec
  §3.7 real email/phone/WhatsApp; real social URLs; dead CTA button →
  scrolls to form; backend error message surfaced.
- `Login.jsx` — wiring verified correct (no change).
- `Register.jsx` — removed dead `/privacy` link.
- `About.jsx` — `card-3d` on value cards.
- `Shop.jsx` — **uncommented the product grid**, removed "Cooming Soon"
  typo paragraph, now uses `getProducts`/`getProductCategories`, real
  category list, working add-to-cart with login redirect + feedback, error
  state.
- `ProductDetail.jsx` — api helpers, not-found state, `featuredImage` /
  `salePrice` fields, stock/adding states.
- `Cart.jsx` — quantity +/− via `PATCH /cart/items/:id`, checkout via
  `POST /orders` with shipping-address form + order-confirmation state.
- `Subscriptions.jsx` — `card-3d`, inline style → class.
- `Profile.jsx` — **removed fake `MOCK_USER` / `MOCK_ORDERS` / `MOCK_STATS`**
  — now real user from `AuthContext`, real orders via `GET /orders`, real
  saved results via `GET /calculators/my-results`, empty states; settings
  save shows honest "no backend endpoint" notice instead of faking it;
  logout via `apiLogout`.
- `Admin.jsx` — **removed illegal `status` field** from create/update/toggle
  payloads (backend `forbidNonWhitelisted` would 400); drafts warning +
  Subscribers notice replaced by real `adminGetBlogs()` list and real
  `SubscribersList` (rows + Remove with confirm + flash); inline styles →
  `admin.css` classes.
- `ComingSoon.jsx` — comment corrected; kept, unrouted (reusable for a
  genuinely upcoming feature).

### Components
- `ProductCard.jsx` — backend fields `featuredImage`/`salePrice`, `imageUrl()`, `card-3d`.
- `ServiceCard.jsx` — fixed broken imports `./Card`/`./Button` → `./UI/*`,
  backend Service fields, `card-3d`.
- `TestimonialCard.jsx` + `TestimonialCard.css` — NEW (all inline styles →
  CSS, `card-3d`, removed undefined `var(--primary)`/`var(--gray)` refs).
- `NutritionCarousel.jsx` — hex `tagColor` → semantic `tagTone` + CSS classes.
- `HomeCalculatorSection.jsx` — fixed ids `calories→tdee`,
  `ideal→ideal_weight`, removed hex colours.
- `UI/Badge.module.css` — added missing `.badgeDefault`.
- `contexts/AuthContext.jsx` — loading screen inline styles → `auth.css`.
- `hooks/useReveal.js` — MutationObserver so API-loaded content also reveals;
  unobserves after reveal.

### QA / integration fixes (final pass)
- `frontend/src/services/api.js`, `frontend/src/pages/Admin.jsx` — wired
  newsletter / admin blog list / subscribers to the real backend endpoints
  (see API section above).
- `backend/src/main.ts` — added `http://localhost:3000` and
  `http://localhost:4173` to the CORS allowlist (frontend preview/dev ports;
  the browser had blocked every API response on those origins).

## 3. Root docs (new — replace all old guides)
- `README.md` — NEW (setup, run, deploy, env vars, admin seeding, tests).
- `CHANGELOG.md` — NEW (this file).
- `TEST-REPORT.md` — NEW (test evidence).
- `REMOVE-LIST.txt` — NEW (cleanup manifest for the Drive sync).

## 4. Known pre-existing issues NOT changed (no data/content changes)
- Spec says "2+ Years", site renders "10+ Years" (Home hero/stats).
- Contact FAQ mentions `$49–$199/month` while prices elsewhere are PKR.
- April 2025 spec says 10 services; the code has 6.
- `backend/demo-services.json` + `backend/demo-blog-posts.json` are 0 bytes
  in Drive (original demo content lost; seed handles gracefully).

---

## 5. Modification Round 1 (2026-10-18) — requested by Ali, all verified

Four parallel workers + coordinator integration. Framework kept (NestJS + TypeORM,
React 18 + Vite). No existing real content changed; only explicitly-requested new
demo content added.

### 5A. Users & auth
- `UserRole` extended: `customer`, `visitor` (new enum values; existing DBs need the
  `ALTER TYPE user_role` statements in the README — TypeORM synchronize cannot add
  enum values to an existing type).
- NEW `npm run seed:users` (`backend/src/seeds/demo-users.seed.ts`): wipes `users`
  (TRUNCATE CASCADE) and creates 4 bcrypt-hashed users —
  admin@dietandwell.com/root (admin), editor@dietandwell.com/editor123 (editor),
  customer@test.com/customer123 (customer), visitor@test.com/visitor123 (visitor).
  Prints the credentials table. Never runs on boot (standalone script only).
  This finally resolves Ali's forgotten-password problem: one command, known passwords.
- Admin user management: `GET /users`, `POST /users`, `PATCH /users/:id`
  (admin-only, role guards; password hashes never leak in responses); new
  `UserManager.jsx` admin panel (create with role select, activate/deactivate, role change).
- Blog write endpoints widened from admin-only to admin+editor
  (`POST/PATCH/DELETE /api/blog`, `GET /api/blog/admin/all`) so the editor account
  can actually manage blogs, as intended.

### 5B. Blog — root cause found and fixed
- **Diagnosis:** there was no code bug. The DB had zero posts (the original
  `demo-blog-posts.json` was 0 bytes) and the home page's 3 "posts" were hard-coded
  fallback cards, while the listing page had no fallback — hence "home shows 3,
  blog page shows none".
- **Fix:** `seed:demo` now falls back to 4 built-in starter articles (HTML, tagged,
  categorized) when the JSON is empty; skip-if-exists, never overwrites. Also fixed
  `main()` never calling `seedDemoContent` (blog/services/metrics/calculators were
  silently never seeded).
- Slug uniqueness (`-2`, `-3` suffixes, incl. on title rename); `coverImage` column
  added (synced both ways with `featuredImage`); nullable blog columns given explicit
  types (pre-existing `strict:true` schema-sync breakage fixed — seeds could never run).
- Admin: NEW `BlogManager.jsx` with TipTap rich-text editor
  (`@tiptap/react`, `starter-kit`, `extension-image`, `extension-link`), cover upload
  with preview, excerpt, comma-tags, auto/editable slug, Published/Draft toggle.
  Mounted in Admin → Blog Posts (replaces the old textarea editor).
- Blog listing: modern hero (gradient + `/images/blog-hero.jpg` with fallback),
  search + tag filter chips, cards with covers. Post detail renders TipTap HTML,
  related posts, share row. Home latest-3 pulls published newest-first.

### 5C. Shop backend (new modules)
- `Category` (`product-category` extended): slug unique, image, description, sortOrder.
  `GET /api/categories`, `GET /api/categories/:slug` → `{category, products}`;
  admin POST/PATCH/DELETE (409 on slug clash, 400 if category still has products).
- `Product` extended: slug unique, `variants` JSONB (`[{label,price}]`), `stock`,
  `images[]`, `type` physical|digital, `digitalFilePath`/`digitalFileName`, category FK.
  `GET /api/products?type=&category=` (plain array; legacy paginated shape kept when
  `page/limit` sent); admin POST/PATCH accept multipart (`images[]`, `digitalFile`)
  or JSON.
- Digital files stored in `backend/private-uploads/digital/` (never under `public/`);
  extension-validated (pdf/doc/docx/epub/zip).
- `DigitalOrder`: public `POST /api/digital-orders` (optional JWT attach),
  admin list/filter + grant/reject, `GET /api/digital-orders/mine`,
  `GET /api/digital-orders/:id/download` — streams only when granted AND caller is
  owner (by userId or email) or admin; 403 otherwise.
- `Setting`: `GET /api/settings/public` (whitelist: bank_account_details, support_phone,
  support_email), admin GET/PUT; `bank_account_details` seeded with a clearly-marked
  placeholder the admin replaces.
- Payments: `src/payments/` — `PaymentProvider` interface + `JazzCashService` /
  `EasypaisaService` stubs throwing **501 "not configured"**; NEW
  `JAZZCASH_EASYPAISA_GUIDE.md` (merchant portals, exact `.env` keys, stub methods
  to implement, callback/IPN sketch). No fake gateway, no keys.

### 5D. Shop frontend
- Shop page rewritten: hero (`/images/shop-hero.jpg`, gradient fallback), category
  banners, All/type filter tabs, product cards with image carousel, "from PKR X",
  stock badges. Product detail (`/shop/:slug`): gallery, pack-size variant pills
  updating PKR price, stock, HTML description; digital → request form
  (name/contact/email, prefilled when logged in) + payment-method radio +
  bank-details block + "admin will grant access" note; physical → existing cart flow.
- NEW `/library` (protected route, navbar "My Library" link): granted orders with
  download buttons implemented via `fetch` + JWT + blob (a plain `<a href>` cannot
  send the Authorization header).
- Admin panels (all self-contained): CategoryManager, ProductManager (variants
  editor, stock, type toggle, image + digital-file upload), OrderManager (pending
  filter, one-click grant/reject), SettingsManager (incl. bank details),
  UserManager. Mounted as new Admin tabs: Shop, Orders, Settings (Users tab upgraded).
- CSS 3D book covers with HTML titles (no AI images for covers); no emojis;
  `prefers-reduced-motion` respected.

### 5E. Demo content (`npm run seed:demo`, idempotent)
- 3 categories with generated images; 4 digital books (PKR 499/599/699/799) with 4
  generated valid 1-page sample PDFs attached as downloadable files; 7 nutritional
  products with 2–3 PKR pack-size variants each; 4 starter blog posts; default
  settings. All marked `[Demo]`, editable/deletable via admin.

### 5F. Calculators — 18 → 32
- Inventory confirmed Ali's count: 18 existing. Added 14 with real published formulas
  (Boer 1984 LBM, WHO waist-hip cutoffs, Wishnofsky 7700 kcal/kg, IOM fiber 14g/1000kcal,
  BAPEN MUST, Payne corrected calcium, IOM iron RDA, IOM breastfeeding +330/+400,
  ACSM sweat rate, sweat sodium loss, Armstrong urine chart, 150 mL/kg/day infant
  formula, ISSN athlete protein, Burke carb loading 10–12 g/kg, ACSM pre-workout carbs)
  across 8 categories. Each: validated inputs, result + guidance text, formula citation,
  visible "not medical advice" disclaimer (landing + every panel).
- 30/30 formula hand-checks pass (worker) + 19/19 backend port checks (coordinator).
- Backend: `CalculatorType` enum extended with the 15 new ids and all 15 formulas
  implemented server-side (mirroring the frontend utils) so "save result" works for
  every calculator instead of erroring.
- NEW 3D calculator landing (three.js, `calculators-hero.jpg` layered, 3D-tilt
  category cards, search).

### 5G. Home 3D scroll (original implementation)
- `HomeScroll3D.jsx`: 320vh pinned section, scroll-driven rotating nutrient-orb ring,
  rising leaves, drifting droplets, camera dolly, 3 editorial steps (Fuel/Balance/Thrive);
  single canvas, IntersectionObserver pause, reduced-motion → static cards.
- The referenced helix repo has **no LICENSE file** — it was not studied and none of
  its code was used. `ScrollParallax` adds subtle scroll-linked parallax to section
  headings. No existing home section removed.

### 5H. Hero audit
- All pages already had heroes except **Admin** (added slim gradient banner).
- All 6 generated images (`shop-hero`, `blog-hero`, `calculators-hero`,
  `cat-digital-books`, `cat-nutritional`, `cat-superfoods`) wired with gradient
  fallbacks; verified serving 200.

### 5I. Coordinator integration fixes (found during verification)
- `seed:demo`'s `main()` never called `seedDemoContent` — blog/services/metrics/
  calculators seeding was dead code; fixed (blog total 0 → 4).
- Wired `/library` protected route, navbar "My Library" link, and all 6 admin
  panels into the Admin shell (BlogManager replaces the old textarea editor).
- Fixed a CSS import path (`admin-shop.css`) that broke the frontend build.
- Multipart `variants` accepted as JSON string (matches frontend sender).

### Known Round-1 gaps (honest)
- Existing (non-fresh) databases need the manual SQL in the README (enum values,
  `coverImage` column) — `synchronize:false`/existing enums won't self-apply.
- No logged-in browser click-through (subagents have no live browser) — verified at
  build + API level; recommend one manual pass on staging.
- Cloudinary upload path untested (no keys, by decision); local-disk uploads verified.
- Child BMI still uses the old simplified percentile estimate (kept as-is per
  no-content-change; should be labeled/upgraded later).

---

## 6. Integration hardening (2026-10-18)

- Corrected `frontend/.env` from port 8000 to the backend's real port 5000.
- Added automatic refresh-token rotation and a real server-side logout path;
  access tokens now carry a revocation version and are rejected after logout.
- Added authenticated `PATCH /api/auth/me` and connected Profile → Save Changes.
- Fixed product category assignment by preserving PostgreSQL UUIDs instead of
  converting them to `NaN`.
- Connected physical orders to Admin → Orders with filtering and status updates.
- Added server-verified product-variant pricing to cart/order lines, PKR labels,
  and atomic checkout stock decrement to prevent overselling.
- Allowed arbitrary localhost ports only in development CORS mode, while keeping
  the production allowlist restricted.
- Made SQL logging explicit opt-in to prevent credentials or token values from
  appearing in normal development logs.
- Split frontend routes into lazy-loaded bundles; the initial JavaScript bundle
  dropped from about 1.38 MB to about 189 KB before gzip.
- `vite build` on this VM currently needs a workaround (broken `copy_file_range`
  syscall in the environment: temp CJS config + manual `public/` copy). Ali's laptop
  is unaffected — this is environment-specific, not a project bug.
