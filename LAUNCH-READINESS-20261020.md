# DietAndWell: QA and launch decision

## Decision

Not yet approved for an unrestricted commercial/clinical launch. The current website can be prepared for a limited public informational preview once the deployment checks below are completed. Diet Plan Studio remains a coming-soon demonstration, not a purchasable, clinically validated SaaS. Do not market its sample meal budgets as measured food calories or verified medical recommendations.

## Implemented in this update

New transparent component artwork replaces the Studio salad bowl: a plated meal, water, wholegrains/eggs and produce separate in perspective and recombine with scroll. Reduced-motion and responsive fallbacks are provided. Artwork is illustrative and makes no anatomical or medical mechanism claims.

The Studio intake adds adult age, sex used by the energy equation, height/weight, activity, weight loss/gain, maintenance, sport, budget, vegetarian and clinician-guided pathways for diabetes, hypertension, renal/heart conditions, pregnancy and other medical conditions. It includes local region/city, food preferences, restrictions, example medication notes, 3/4/5 meal patterns, editable meal/snack times, entered water target and tea/chai preferences. State stays only in the current page; it is not saved or submitted to AI. Use dummy values during preview.

The calorie panel uses Mifflin–St Jeor and activity multipliers to illustrate adult resting/maintenance energy; general weight loss/gain uses an illustrative 300 kcal adjustment. Clinical pathways require an entered clinician target and confirmation. A checkbox is not verification of a prescription. Meal allocations sum exactly to the target. Actual item kcal, ingredient grams, sodium/carbohydrate constraints, clinical judgement, regional food availability and allergen validation still require the reviewed catalogue and full backend. The preview suppresses food suggestions for restrictions/clinical pathways rather than inventing suitable alternatives. Water and beverage portions require individual review.

## QA evidence

- Frontend and backend production builds passed after changes.
- 29 automated checks passed: existing calculator parity and invalid inputs, AI provider adapter, Studio energy/meal-budget invariants and clinical gating, and HTTP throttling.
- Transactional database tests passed for blog create/read/update/delete and contact save/read; all test records rolled back. No customer email or purchase was made.
- Live public API checks: blog, tags, products, services, calculators and public settings. Protected endpoints tested without authentication. Role-injection registration payload was tested without creating an account.
- Browser: clinical pathway blocks automatic targeting; an entered 1800 kcal target produces seven days and 35 slots for the five-meal pattern. Updated admin editor rendered and inserted an inline image without warnings/errors. Existing account login and routing were checked.
- Scope: targeted engineering QA, not an independent penetration test, clinical certification, or claim that every payment/refund/download edge case has been exercised.

## Security improvements and remaining findings

Implemented in-memory throttling for auth/contact/upload/Studio POST requests; no-store on sensitive requests; nosniff, framing and referrer headers; MIME-derived upload filenames and file-signature checks; product HTML rendering now uses the article allowlist; API docs are disabled by default in production. Configure TRUST_PROXY_HOPS to match the actual reverse-proxy chain before relying on per-client limits. Use a shared rate-limit store for multiple backend instances.

Upgraded frontend editor/core/extensions together, React Router, Vite and its React plugin. The completed frontend npm install audit reported **zero advisories**. The editor upgrade was browser-checked. Backend compatible updates were applied, but the final checked Nest 11 documentation dependency tree still reports **two moderate advisories** involving Swagger/js-yaml. The offered Swagger 12 fix requires Nest 12; npm refused that incompatible upgrade and it was not forced. Resolve in a coordinated Nest migration or remove the documentation package before formal security sign-off. Production docs exposure is already disabled; this does not erase the dependency advisory.

Before launch: replace known demonstration account credentials through owner-controlled password/account administration; rotate production JWT/provider/database credentials privately; verify no .env files, backups, database dumps, uploads containing private information or TEST reports are committed; enforce HTTPS; verify production CORS; inspect logs for sensitive values; set backups and restore testing; verify ownership checks and billing/download permissions on the deployed host. Existing code stores browser tokens in localStorage, which remains vulnerable to successful same-origin XSS; consider secure HttpOnly session cookies for a larger SaaS release. File signatures are a useful check, not a malware scanner.

Confirm verified sender/email delivery, consent/privacy/terms/refund policies, actual professional credentials, prices, service promises, testimonials and seeded content before public publication. These require owner review; no real records or existing public articles were deleted. Existing contact email setup from earlier reports still needs a live delivery test.

## SEO delivered

Per-page titles/descriptions on previously uncovered routes, no-index on private pages, corrected blog image URLs and word counts in structured data, filter-page no-index, pagination-aware blog titles/canonicals, configurable VITE_SITE_URL, build-time public HTML snapshots, XML sitemap and generated robots.txt. The local build generated 15 public snapshots including six published articles. Rebuild after blog changes; use a deployment hook at launch. Set REQUIRE_BLOG_SEO=true in production builds so failed article retrieval fails the build instead of silently omitting posts. Set SEO_API_URL to the deployed API.

Initial HTML and sitemap are a foundation, not a ranking/indexing promise. After deployment inspect actual HTML, status codes, canonical URLs, HTTPS, article images and structured data on the final hostname; verify Google Search Console ownership and submit sitemap.xml. Remove or update sample content before requesting indexing. Static JSON-LD and client JSON-LD must describe the same published article. Choose one canonical hostname; do not point a free-subdomain launch at an unowned custom domain.

## Artwork provenance

Saved asset: frontend/public/images/studio-meal-components-v1.png. Generated with the built-in image-generation tool using the imagegen skill. Prompt: photorealistic transparent 2×2 component atlas, equal landscape cells with generous margins; upper-left ivory plate with grilled chicken, brown rice and cooked vegetables (not salad bowl), upper-right water glass with lemon, lower-left wholegrain bread and two eggs, lower-right apple/carrot/greens; cohesive 40-degree elevated view, soft upper-left window light, realistic edible textures; no text, grid, table, human or anatomical diagram. Original generated image retained. Scene code is frontend/src/components/StudioMealScene.jsx.

## Free-hosting path

See FREE-HOSTING-GUIDE.md. A free-tier pilot is possible; it is not a promise of a permanent zero-cost commercial service. AI usage, email, media/storage, database growth, professional consultation and reliable always-on backend capacity can incur costs. No deployment was performed and no external account was created.
