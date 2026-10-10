# DietAndWell — Nutrition Coaching Portal

A full-stack nutrition coaching portal: clients browse coaching services and health
products, use free nutrition calculators (BMI, TDEE, macros), read the blog, manage
a cart and subscriptions — while admins manage content, orders, users and site
metrics from a dashboard.

**Author:** Muhammad Bilal

---

## ✨ Features

- **Authentication** — JWT access + refresh tokens, role-based access (user / admin), protected routes
- **Nutrition calculators** — BMI, TDEE and macro calculators with saved results history
- **Blog** — posts with categories, tags, slugs, featured images and view counts
- **Shop & cart** — product catalog, cart, checkout, order lifecycle
  (`pending → processing → completed / cancelled`), Stripe-ready order fields
- **Coaching services & subscriptions** — service listings and subscription plans
- **Contact inquiries** — public contact form with admin inbox
- **Admin dashboard** — users, orders, content and site metrics
- **Uploads** — image uploads served statically
- **API docs** — auto-generated Swagger UI at `/api/docs`
- **Demo seed data** — one command seeds an admin user, blog posts and services

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, TypeORM 0.3, PostgreSQL |
| Auth | Passport JWT, bcrypt |
| API | REST + Swagger/OpenAPI, class-validator DTOs |
| Frontend | React 18, Vite 5, React Router 6 |
| UI / Viz | FontAwesome, Chart.js, react-hot-toast |

---

## 📁 Project Structure

```
dietandwell/
├── backend/            # NestJS REST API
│   ├── src/
│   │   ├── auth/       # JWT auth, guards, strategies
│   │   ├── blog/       # posts, categories, tags
│   │   ├── calculators/# nutrition calculators + saved results
│   │   ├── cart/       # cart + orders
│   │   ├── products/   # product catalog
│   │   ├── services/   # coaching services & subscriptions
│   │   ├── contact/    # contact inquiries
│   │   ├── users/      # user management
│   │   ├── upload/     # file uploads
│   │   ├── metrics/    # site metrics
│   │   ├── entities/   # TypeORM entities
│   │   ├── seeds/      # seed scripts
│   │   └── main.ts     # bootstrap (port 5000, `/api` prefix)
│   ├── demo-blog-posts.json / demo-services.json  # seed content
│   └── package.json
├── frontend/           # React + Vite SPA
│   ├── src/
│   │   ├── pages/      # Home, Services, Blog, Calculators, Shop, Cart,
│   │   │               # Subscriptions, Contact, Login/Register, Profile, Admin
│   │   ├── components/ # layout, sections, UI, data-viz
│   │   ├── services/   # API client
│   │   └── contexts/   # auth context
│   └── package.json
├── API_REFERENCE.md    # full endpoint documentation
└── README.md
```

---

## ✅ Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ with a database (default name: `dietandwell`)

---

## 🚀 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# Required — the API refuses to boot without it
JWT_SECRET=change-me-to-a-long-random-string

# Database (defaults shown; omit any line to use the default)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=dietandwell

# API port (default 5000)
PORT=5000
```

Seed demo data (admin user, blog posts, services):

```bash
npm run seed
```

Build and run:

```bash
npm run build    # compiles TypeScript → dist/
npm start        # node dist/src/main.js
```

| Script | What it does |
|---|---|
| `npm run dev` | dev server with hot reload (`ts-node-dev`) |
| `npm run build` | TypeScript production build |
| `npm start` / `npm run start:prod` | run the compiled API |
| `npm run seed` | seed demo content into the database |

The API listens on `http://localhost:5000`, all routes under `/api`
(e.g. `http://localhost:5000/api/auth/login`). Interactive docs:
**http://localhost:5000/api/docs**

> TypeORM `synchronize` is enabled in `app.module.ts` — tables are created
> automatically on first boot. Set it to `false` in production and use
> migrations instead.

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev      # dev server → http://localhost:3000
```

Production build:

```bash
npm run build    # → frontend/dist/
npm run preview  # preview the production build locally
```

Point the app at the API with an env file (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Port note:** the backend listens on **5000** and the frontend's default
> API URL is `http://localhost:8000/api`. Set `VITE_API_URL` as above (or run
> the API on 8000) so the two talk to each other. The Vite dev-server proxy
> (`vite.config.js`) also targets `:8000` — update it if you change ports.

| Script | What it does |
|---|---|
| `npm run dev` / `npm start` | Vite dev server (port 3000) |
| `npm run build` | production build to `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run lint` | ESLint |

---

## 📖 API Reference

Full endpoint documentation lives in [`API_REFERENCE.md`](./API_REFERENCE.md)
— auth, blog, calculators, products, cart/orders, services, contact, users,
uploads and metrics. A live Swagger UI is served at `/api/docs` when the
backend runs.

---

## 🔒 Environment & Secrets

- Never commit `.env` files — both `backend/` and `frontend/` gitignore them.
- `JWT_SECRET` must be a long random string in production.
- Uploads land in `backend/public/uploads/` (gitignored).

---

## 📄 License

MIT
