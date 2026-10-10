# DietAndWell — Master Integration Guide
## Drop-in replacement files + integration steps

---

## 🚀 QUICK START — Drop files in order

### Step 1 — Files into frontend/

```
index.html                     → frontend/index.html            (REPLACE)
robots.txt                     → frontend/public/robots.txt     (NEW)
_headers                       → frontend/public/_headers        (NEW)

src/App.js                     → frontend/src/App.js            (REPLACE)
src/contexts/AuthContext.jsx   → frontend/src/contexts/          (NEW FOLDER + FILE)
src/hooks/useSEO.js            → frontend/src/hooks/useSEO.js   (NEW)
src/services/api.js            → frontend/src/services/api.js   (REPLACE)

src/components/layout/Navbar.jsx         → REPLACE
src/components/layout/Navbar.module.css  → REPLACE

src/pages/Home.jsx             → REPLACE
src/pages/Blog.jsx             → REPLACE
src/pages/BlogPost.jsx         → REPLACE
src/pages/Admin.jsx            → REPLACE
src/pages/Login.jsx            → REPLACE
src/pages/Register.jsx         → REPLACE
src/pages/ComingSoon.jsx       → frontend/src/pages/  (NEW)

src/styles/admin.css           → REPLACE
src/styles/blog.css            → REPLACE
src/styles/blog-post.css       → REPLACE (from previous delivery)
src/styles/coming-soon.css     → NEW

# From PREVIOUS deliveries (confirm these are in place):
src/pages/Services.jsx
src/pages/Profile.jsx
src/pages/Subscriptions.jsx
src/components/sections/NutritionCarousel.jsx
src/styles/services.css
src/styles/profile-subscriptions.css
src/styles/nutrition-carousel.css
src/styles/hero-section1.css
src/styles/home-additions.css
```

---

### Step 2 — Add home-additions.css import to Home.jsx

In `src/pages/Home.jsx` at top, add:
```js
import '../styles/home-additions.css';
```

---

### Step 3 — Add Button variants (outline-white)

Open `src/components/UI/Button.module.css` and paste at the **bottom**:
```css
.btnOutlineWhite {
  background: transparent;
  color: #ffffff;
  border: 2px solid rgba(255,255,255,0.7);
}
.btnOutlineWhite:hover {
  background: rgba(255,255,255,0.12);
  border-color: #ffffff;
}
.btnSecondary {
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
  color: var(--color-on-secondary);
  box-shadow: 0 8px 24px rgba(74,124,107,0.25);
}
```

---

### Step 4 — Update index.css (or main CSS import)

In `src/index.css` or `src/index.js`, ensure these imports exist in order:
```js
import './styles/variables.css'
import './styles/globals.css'
import './styles/animations.css'
```

---

### Step 5 — Create contexts folder

```bash
mkdir -p frontend/src/contexts
# Then drop AuthContext.jsx into it
```

---

### Step 6 — Backend: add admin endpoint for all posts

The frontend's admin Posts List calls `GET /api/blog?limit=200` which only returns **published** posts.

**Fix in backend** — in `blog.service.ts`, add a new method and expose it via a new route:

In `src/blog/blog.service.ts`, add:
```typescript
async findAllAdmin(page = 1, limit = 100) {
  const skip = (page - 1) * limit;
  const [posts, total] = await this.postRepository.findAndCount({
    relations: ['author', 'categories', 'tags'],
    order: { createdAt: 'DESC' },
    skip,
    take: limit,
  });
  return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

In `src/blog/blog.controller.ts`, add:
```typescript
@Get('admin/all')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get ALL blog posts including drafts (Admin only)' })
async findAllAdmin(@Query('page') page?: number, @Query('limit') limit?: number) {
  return this.blogService.findAllAdmin(Number(page)||1, Number(limit)||100);
}
```

Then in `src/services/api.js`, update the admin fetch:
```js
export async function adminGetAllBlogs({ page = 1, limit = 100 } = {}) {
  return req('GET', `/blog/admin/all?page=${page}&limit=${limit}`);
}
```

And in `Admin.jsx` PostsList component, replace `getBlogs` call with `adminGetAllBlogs`.

---

### Step 7 — Verify .env files

**Frontend** `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```

**Backend** `backend/.env`:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=root
DATABASE_NAME=dietandwell
JWT_SECRET=change-this-to-a-long-random-secret-in-production
PORT=8000
NODE_ENV=development
```

---

### Step 8 — Start everything

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run seed          # Creates admin@dietandwell.com / Admin123!
npm run dev           # http://localhost:8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev           # http://localhost:3000

# Swagger docs: http://localhost:8000/api/docs
# Admin panel:  http://localhost:3000/admin
```

---

## 🔐 SECURITY AUDIT — What's fixed

| Issue | Before | After |
|-------|--------|-------|
| Admin route accessible without login | `user?.role === 'admin'` check only — could bypass | `AdminRoute` component — server-verified JWT |
| Token not re-verified on load | Read from localStorage only | `getMe()` called on every app load — invalid tokens cleared |
| No auth redirect memory | Logged-in user sent to /profile always | `useLocation` state → returns to original destination |
| mockBlogPosts in Blog page | Hardcoded fake data shown | Real API data from backend |
| Home services not matching Services page | Different prices, descriptions, icons | Exact same data from `HOME_SERVICES` array |
| Home buttons not wired | Buttons had no `to=` props | All buttons have `to="/..."` routes |
| Shop/Subscriptions blank pages | Empty component returned | 3D ComingSoon with particles |
| No SEO meta per page | Single static title in index.html | `useSEO()` hook on every page |
| No structured data | None | Organization, WebSite, Article, WebApplication schemas |
| No robots.txt | Missing | Added with proper allow/disallow |

---

## 📊 SEO IMPLEMENTATION

### Per-page titles + descriptions:
| Page | Title | Description |
|------|-------|-------------|
| Home | Evidence-Based Nutrition Coaching & Free Health Calculators | 10+ years experience... |
| Blog | Nutrition & Wellness Blog — Expert Articles | Evidence-based articles... |
| Services | Nutrition Coaching Services — 1-on-1, Meal Plans & Lab Analysis | Professional nutrition services... |
| Calculators | Free Health Calculators — BMI, TDEE, Body Fat, Macros & More | 18 free science-backed calculators... |
| Contact | Book a Free Discovery Call | Ready to transform... |
| Blog Post | [Post Title] | [Post meta description] |
| Admin/Profile/Login | noIndex: true | Not indexed |

### JSON-LD schemas added:
- `Organization` — name, URL, logo, contact, social links
- `WebSite` — with SearchAction (sitelinks searchbox)
- `Article` — on every blog post (author, dates, wordCount, keywords)
- `WebApplication` — on calculators page

---

## ✅ ADMIN FEATURES — What works now

### Blog Posts tab:
- **Filter tabs**: All / Published / Draft with counts
- **Status toggle**: Click "● Live" or "○ Draft" badge to instantly switch — calls `PATCH /api/blog/:id`
- **Edit**: Opens BlogEditor pre-filled with all post data
- **View**: Opens `/blog/slug` in new tab
- **Delete**: Confirm dialog → permanent deletion

### Blog Editor:
- Title with auto-generated URL slug preview
- Excerpt (300 char limit + counter)
- Content (Markdown supported: ##, **, -, >)
- Featured image — upload file OR paste URL
- Content images — multiple file upload, grid preview, individual remove
- Categories — comma-separated, auto-created
- Tags — comma-separated
- SEO meta title + description with live SERP preview
- Word count + read time counter
- Publish toggle + "Save Draft" and "Publish" buttons

### Contacts tab:
- All submissions listed
- New submissions highlighted with amber border
- "Mark Read" button
- "Reply via Email" opens mailto link

### Dashboard:
- Stats: posts count, new enquiries, happy clients, published count
- Alerts on unread enquiries
- Click stats → navigate to relevant tab

---

## 🎨 NAVBAR — More dropdown

Items moved to "More" dropdown:
- 🛍️ Shop → `/shop` → Shows ComingSoon (3D floating card)
- 💎 Subscriptions → `/subscriptions` → Shows ComingSoon
- 👤 About Us → `/about`

Primary nav (always visible): Home | Services | Blog | Calculators | Contact

User avatar dropdown (when logged in): Admin Dashboard | My Profile | Log Out

---

## 🔜 REMAINING TASKS (future)

1. **Backend admin/all endpoint** — Add the `findAllAdmin` route so admin panel shows drafts
2. **About.jsx** — Rewrite to use new layout components (currently uses old Hero.jsx)
3. **Sitemap.xml** — Generate dynamically from blog posts (Node script or NestJS endpoint)
4. **OG image** — Create `/public/og-image.jpg` (1200×630) for social sharing
5. **favicon.svg** — Create branded SVG favicon
6. **Newsletter backend** — Add POST `/api/newsletter/subscribe` endpoint
7. **Deploy** — Vercel (frontend) + Railway (backend + Postgres)
