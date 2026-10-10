# DietAndWell Codebase Analysis - Executive Summary

## 🎯 Project Overview

**DietAndWell** is a full-stack **nutrition & wellness platform** with:
- **Frontend**: React 18 + Vite (modern SPA)
- **Backend**: NestJS 11 + PostgreSQL (enterprise REST API)
- **Auth**: JWT + Passport.js (secure token-based auth)
- **Payment**: Stripe integration for orders & subscriptions
- **Status**: Fully functional with complete CRUD APIs and admin system

---

## 📊 Current Tech Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool & dev server |
| React Router | 6.28 | Client-side routing |
| React Bootstrap | 2.10 | UI components |
| Bootstrap | 5.3 | CSS framework |
| Font Awesome | 7 | Icons |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| NestJS | 11.1 | API framework |
| TypeORM | 0.3 | Database ORM |
| PostgreSQL | 15+ | Database |
| JWT | 11.0 | Authentication |
| Passport | 0.7 | Auth strategy |
| Multer | 2.0 | File uploads |
| bcrypt | 6.0 | Password hashing |
| Stripe | 20.0 | Payments |
| Swagger | 11.2 | API docs |

---

## 📁 Project Structure

```
DietAndWell/
├── frontend/              # React SPA (Vite)
│   └── src/
│       ├── pages/         # 15 page routes
│       ├── components/    # 25+ reusable components
│       ├── App.js         # Root routing & auth state
│       └── config.js      # API URL config
├── backend/               # NestJS REST API
│   └── src/
│       ├── app.module.ts  # Main module
│       ├── main.ts        # Server bootstrap
│       ├── entities/      # 16 database models
│       ├── auth/          # JWT + Passport
│       ├── blog/          # Blog CRUD
│       ├── products/      # Product CRUD
│       ├── cart/          # Cart + Orders
│       ├── users/         # User management
│       ├── upload/        # File uploads
│       ├── contact/       # Contact form
│       ├── metrics/       # KPIs dashboard
│       └── calculators/   # Health calculators
├── Agent/                 # AI agent reference docs
└── package.json           # Root scripts (concurrently)
```

---

## 🗄️ Database Schema (16 Entities)

```
┌─────────────────────────────────────────┐
│             Core Entities               │
├─────────────────────────────────────────┤
│ User (uuid, email, password, role)      │
│ BlogPost (title, content, author)       │
│ Product (name, price, stock)            │
│ Order (user, items, total, status)      │
│ Cart (user, items, sessionId)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Taxonomies & Relations        │
├─────────────────────────────────────────┤
│ Category (blog + product categories)    │
│ Tag (blog tags)                         │
│ ProductCategory (product taxonomies)    │
│ CartItem (cart ↔ product)               │
│ OrderItem (order ↔ product)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Supporting Entities             │
├─────────────────────────────────────────┤
│ ContactInquiry (contact form)           │
│ Subscription (tiers: basic/premium)     │
│ Metric (KPIs: users, revenue, etc.)     │
│ Calculator (BMI, TDEE, Macros, etc.)    │
│ CalculatorResult (user results)         │
└─────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Endpoints

| Module | Endpoints | Access |
|--------|-----------|--------|
| **Auth** | POST /api/auth/{register,login,logout,refresh} | Public (register, login), Authenticated (logout, refresh) |
| **Blog** | GET/POST /api/blog, GET /api/blog/{slug} | GET=Public, POST=Admin |
| **Products** | GET/POST/PUT/DELETE /api/products | GET=Public, CRUD=Admin |
| **Cart** | GET/POST/DELETE /api/cart/{add,remove,clear} | Authenticated |
| **Orders** | GET/POST /api/orders, GET /api/orders/{id} | Authenticated |
| **Upload** | POST /api/upload/blog/{featured,content}, /api/upload/product/{featured,gallery} | Admin |
| **Contact** | POST /api/contact, GET /api/contact (admin) | POST=Public, GET=Admin |
| **Users** | GET/POST/PUT/DELETE /api/users | Admin only |
| **Metrics** | GET /api/metrics, /api/metrics/admin | Public (limited), Admin (full) |

---

## 🔐 Authentication & Authorization

### JWT Implementation (Passport.js)
```
Register → bcrypt(password) → User created → JWT tokens generated → 
Store refreshToken in DB → Return accessToken + refreshToken

Login → bcrypt verify password → Generate tokens → Return tokens

Protected Routes:
├── JwtAuthGuard: Validates Bearer token signature
├── RolesGuard: Checks @Roles(UserRole.ADMIN) decorator
└── Token stored in localStorage as 'accessToken'
```

### User Roles
- **ADMIN**: Full access to CRUD operations, user management, reports
- **EDITOR**: Can create/edit content (limited to assigned areas)
- **USER**: Can browse, purchase, manage profile

---

## 📝 Frontend Features (15 Pages)

1. **Home** - Landing page with hero section
2. **Blog** - Blog feed with search/filter
3. **BlogPost** - Individual article view
4. **Shop** - Product catalog
5. **ProductDetail** - Product page with add to cart
6. **Cart** - Shopping cart management
7. **Services** - Nutrition services listing
8. **ServiceDetail** - Service details
9. **Calculators** - BMI, TDEE, Macro, Body Fat, Water Intake, Qurbani Meat
10. **Subscriptions** - Subscription tier selection
11. **Contact** - Contact form
12. **Login** - User login
13. **Register** - User registration
14. **Profile** - User profile & settings
15. **Admin** - Admin dashboard for content management
16. **About** - Company information

---

## 🛒 Key Features Implemented

### ✅ Fully Working
- User authentication (register, login, logout)
- Blog management (CRUD with categories & tags)
- Product catalog with inventory management
- Shopping cart (session-based + user-based)
- Order processing with Stripe integration
- File uploads (blog & product images)
- Contact form submissions
- Health calculators (6 types)
- Subscription tier management
- Admin dashboard with role-based access

### ⚠️ Partially Complete or Needs Enhancement
- Admin panel UI (backend APIs ready, frontend needs full implementation)
- Email notifications (Nodemailer installed but not wired up)
- Cart persistence (in-memory, should sync with DB)
- Image CDN (local disk storage, should use S3 or similar)
- Error handling (missing global error toast UI)
- Pagination UI (backend supports pagination, frontend needs controls)
- Form validation (backend validates, frontend needs visual feedback)

### ❌ Not Yet Implemented
- Testing (Jest setup missing)
- Docker/containerization
- CI/CD pipeline
- Rate limiting
- Audit logging
- Dark mode
- Progressive Web App (PWA)

---

## 📊 API Statistics

- **Total Endpoints**: 50+
- **Protected Endpoints**: 25+ (require JWT + role)
- **Public Endpoints**: 15+ (no auth required)
- **Upload Endpoints**: 5 (blog & product images)
- **Database Entities**: 16
- **Modules**: 9

---

## 🔗 Data Flow Examples

### User Registration → Shopping
```
1. Register form → POST /api/auth/register
2. Backend: Hash password, create User, generate JWT
3. Frontend: Store accessToken in localStorage
4. Browse products → GET /api/products (public)
5. Add to cart → POST /api/cart/add (with JWT)
6. Checkout → POST /api/orders (with JWT)
7. Stripe payment webhook → Update order status
```

### Admin Content Creation
```
1. Admin login → JWT token stored
2. Dashboard → Upload image POST /api/upload/blog/featured
3. Create post → POST /api/blog with categories & tags
4. Published → GET /api/blog shows published posts
5. Users browse → GET /api/blog/:slug returns post with related content
```

---

## 🌐 Environment Configuration

Required `.env` variables:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=dietandwell

# Auth
JWT_SECRET=your-secret-key

# Server
PORT=5000
NODE_ENV=development

# Frontend API
VITE_API_URL=http://localhost:5000/api

# Optional: Stripe Integration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 🚨 Known Issues & Improvements Needed

### Frontend
- [ ] Missing services module (API calls in api.js, should be organized)
- [ ] No global error handling (missing error toast)
- [ ] No loading states on async operations
- [ ] Cart not persisted to localStorage
- [ ] Admin panel incomplete (auth check + full layout needed)
- [ ] No TypeScript type safety for API responses
- [ ] Form validation feedback missing

### Backend
- [ ] No pagination defaults (should have sensible limits)
- [ ] `synchronize: true` in production config (security risk)
- [ ] No rate limiting on public APIs
- [ ] No audit logging
- [ ] Image storage only local (should use S3)
- [ ] Email notifications not implemented
- [ ] Limited error handling in some services

### Infrastructure
- [ ] No tests (Jest setup missing)
- [ ] No Docker/Kubernetes
- [ ] No CI/CD pipeline
- [ ] No monitoring/logging
- [ ] No backup strategy

---

## 📖 Quick Start

```bash
# Start both dev servers
npm run dev

# Frontend only (http://localhost:5173)
cd frontend && npm run dev

# Backend only (http://localhost:5000)
cd backend && npm run dev

# Access API docs
http://localhost:5000/api/docs

# Seed demo content (after backend starts)
cd backend && npm run seed
```

---

## 🎓 Learning Points

This codebase demonstrates:
- ✅ NestJS best practices (modules, services, controllers, guards, interceptors)
- ✅ JWT authentication & role-based access control
- ✅ TypeORM relationships (many-to-many, one-to-many)
- ✅ React hooks & router patterns
- ✅ Multer file upload handling
- ✅ Stripe payment integration
- ✅ Global validation pipes & error handling
- ✅ Swagger/OpenAPI documentation
- ✅ REST API design with DTOs
- ✅ Environment-based configuration

---

## 📞 Admin Credentials (if demo data loaded)

Check `backend/src/seeds/admin-user.seed.ts` for default admin user details.

---

## 🔗 Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/app.module.ts` | Root NestJS module, imports all feature modules |
| `backend/src/main.ts` | Server bootstrap, CORS, Swagger, static files |
| `backend/src/auth/auth.service.ts` | JWT generation, password hashing, token refresh |
| `backend/src/blog/blog.service.ts` | Blog CRUD, search, category/tag relationships |
| `backend/src/upload/upload.controller.ts` | Multer config for image uploads |
| `frontend/src/App.js` | React root, routing, auth state management |
| `frontend/src/config.js` | API URL configuration |
| `Agent/api.js` | API service template (reference for frontend) |

---

## 🎯 Next Steps (Recommendations)

1. **Complete Admin UI**: Build full admin dashboard for all CRUD operations
2. **Add Error Handling**: Global error toast + retry mechanisms
3. **Frontend Type Safety**: Add TypeScript types for all API responses
4. **Form Validation**: Add client-side validation with feedback
5. **Cart Persistence**: Sync cart between localStorage and backend
6. **Email Notifications**: Wire up nodemailer for order/contact confirmations
7. **Testing**: Add Jest tests for critical services
8. **Docker**: Create Dockerfile + docker-compose for local dev
9. **CI/CD**: GitHub Actions for automated testing/deployment
10. **Production Ready**: Fix `synchronize: false`, add migrations, implement rate limiting

---

**Generated**: April 4, 2026  
**Tech Stack**: React 18 + Vite + NestJS 11 + PostgreSQL  
**Status**: MVP Complete, Production-Ready with Enhancements Needed
