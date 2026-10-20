# Free-tier deployment option for DietAndWell

Recommended pilot: Cloudflare Pages frontend (free *.pages.dev address), Render free Node web service (free *.onrender.com address), Neon free PostgreSQL and appropriately configured cloud image storage. Free addresses are subdomains, not ownership of a free .com domain. Plan availability/limits can change.

Official references checked 20 October 2026:
- Cloudflare React deployment: https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- Render free service limits: https://render.com/docs/free
- Neon plans: https://neon.com/docs/introduction/plans
- Google JavaScript SEO guidance: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

Render sleeps a free web service after 15 minutes of inactivity; the next request can be slow while it wakes. Local uploads on an ephemeral service are not durable. Do not use a short-lived free database for live customer records. Confirm quotas, supported regions, commercial terms and provider data-processing conditions before collecting personal information. Free-tier infrastructure is suitable for a pilot, not a reliability guarantee.

## 1. Prepare the project

Use a private Git repository containing only DietAndWell. Do not publish E:/Muse Given or other projects. Exclude .env, node_modules, backups, database dumps and sensitive uploads. Node 22.12+ or 24 is required by the updated frontend toolchain; select the same supported Node major for local and hosted builds. Run npm ci and the builds/tests first. Do not deploy Vite's dev server.

Review LAUNCH-READINESS-20261020.md and resolve its launch blockers. Existing database records are not automatically transferred by deploying source code. Make a secure PostgreSQL backup, restore into the new Neon database and verify counts and logins privately. The production server disables automatic schema synchronization. Do not run demonstration seeds over your real data.

## 2. Database and backend

Create a Neon PostgreSQL project in a suitable region. Keep its TLS connection string in Render's secret environment settings, never frontend variables. Configure the required SSL mode and certificate verification according to the provider's instructions; review the current app SSL settings before production.

Render web service settings:
- Repository subdirectory/root: backend
- Runtime: Node
- Build: npm ci --include=dev && npm run build
- Start: npm run start:prod
- Instance: Free, if available in your account
- Public health path: /api (or a verified public API route); confirm it returns success before configuring a health check.
- Environment: NODE_ENV=production; DATABASE_URL=Neon secret; JWT_SECRET=a newly generated production secret; JWT_REFRESH_SECRET=a separate strong secret; FRONTEND_URL=https://your-chosen-name.pages.dev; TRUST_PROXY_HOPS=the verified Render proxy hop count, not an arbitrary value; ENABLE_API_DOCS=false.
- The app reads Render's PORT automatically. Never hardcode localhost:8000 as the deployed frontend API.
- Add RESEND_API_KEY and a verified FROM_EMAIL if using outgoing contact replies. A provider-issued sender/domain may have restrictions; verify sending to real recipients before launch.
- Add Cloudinary credentials for durable images, or implement another persistent object store. Do not rely on backend/public/uploads on Render Free. Migrate existing relative upload files and database URLs carefully, with a backup and mapping. Verify every old blog/product image after migration.
- Keep GEMINI_API_KEY server-side. Configure a paid/privacy-appropriate provider tier before sending any personal data, budget caps, monitoring and model lifecycle updates. The existing admin preview uses sample data only.

## 3. Frontend

Create a Cloudflare Pages project connected to the private repository. Root directory: frontend. Build: npm ci && npm run build. Output directory: dist. The platform provides a *.pages.dev URL and HTTPS. Configure SPA navigation support and confirm both actual generated article paths and client routes work on direct refresh.

Set production build variables before building:
- VITE_API_URL=https://your-backend-name.onrender.com/api
- VITE_SITE_URL=https://your-chosen-name.pages.dev
- SEO_API_URL=https://your-backend-name.onrender.com/api
- REQUIRE_BLOG_SEO=true

Warm the free backend manually before a build if it is sleeping. Article retrieval must succeed for a complete sitemap and article snapshots. Ensure its CORS allowlist includes the exact frontend origin. VITE_ variables are public: never place credentials there.

## 4. Post-deploy checks

Test homepage, all direct routes, article URLs and sitemap.xml on the final hostname; register/login with non-demo test accounts; admin/editor permissions; blog create/edit/delete including inline image upload and roundtrip; contact save and actual email receipt; cart/order/payment/download flows with provider test mode; account ownership boundaries; error states after backend sleep; mobile and reduced-motion behavior. Verify certificates and security headers. No real purchase or customer email should be used as an unannounced test.

Set up a deployment hook to rebuild the frontend when published blog content changes, so sitemap/static article snapshots stay current. A manual rebuild is adequate during a small pilot. Automatic hooks need a server-held secret; do not put that secret in the browser.

Verify the final site in Google Search Console and submit https://your-chosen-name.pages.dev/sitemap.xml. Google controls indexing; submission and SEO code cannot guarantee inclusion or ranking. If later moving to dietandwell.com, update VITE_SITE_URL and production domains, rebuild, redirect the old address and update Search Console. Buying a custom domain is normally a recurring expense.

## Production progression

When customers start paying, budget for always-on backend service, durable storage, backups, email, monitoring, the reviewed food catalogue and professional consultation. Free cloud tiers are not a substitute for database backups, clinical validation or contractual service capacity. The Studio payment/generation/download features must stay marked coming soon until their backend and food-data reviews are complete.
