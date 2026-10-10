# DietAndWell - Developer Quick Reference

## 🗂️ Project Layout

```
DietAndWell/
├── frontend/                      # React Vite SPA
│   ├── src/
│   │   ├── pages/                # Route components (15 pages)
│   │   │   ├── Home.js
│   │   │   ├── Blog.js           # Blog listing
│   │   │   ├── BlogPost.js       # Single blog detail
│   │   │   ├── Shop.js           # Product listing
│   │   │   ├── ProductDetail.js  # Single product detail
│   │   │   ├── Cart.js           # Shopping cart
│   │   │   ├── Calculators.js    # Health calculators
│   │   │   ├── Services.js, ServiceDetail.js
│   │   │   ├── Contact.js        # Contact form
│   │   │   ├── Login.js, Register.js, Profile.js
│   │   │   ├── Admin.jsx         # Admin dashboard
│   │   │   ├── Subscriptions.js
│   │   │   └── About.js
│   │   ├── components/           # Reusable components
│   │   │   ├── Navbar.js, Footer.js
│   │   │   ├── Hero.js, SectionTitle.js
│   │   │   ├── BlogCard.js, ProductCard.js, ServiceCard.js
│   │   │   ├── CalculatorCard.jsx, PricingCard.js
│   │   │   ├── Card.jsx, Button.jsx, Alert.jsx
│   │   │   ├── Carousel.jsx, FlippingCard.jsx
│   │   │   ├── LoadingSpinner.jsx, VideoPlayer.jsx
│   │   │   ├── TestimonialCard.jsx, Newsletter.jsx
│   │   │   ├── UI/              # UI utilities
│   │   │   ├── Nutrition/       # Nutrition components
│   │   │   └── *.css            # Component-specific styles
│   │   ├── App.js               # Root component + routing
│   │   ├── index.js             # React root
│   │   ├── config.js            # API_BASE_URL config
│   │   ├── App.css, index.css
│   │   └── components.css (global)
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies & dev scripts
│   ├── vite.config.js           # Vite config
│   └── .eslintrc.cjs            # ESLint config
│
├── backend/                       # NestJS REST API
│   ├── src/
│   │   ├── main.ts              # Server bootstrap
│   │   ├── app.module.ts        # Root module (imports all)
│   │   ├── app.controller.ts    # Root controller
│   │   ├── app.service.ts       # Root service
│   │   ├── data-source.ts       # TypeORM connection
│   │   │
│   │   ├── auth/                # JWT Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── decorators/
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── blog/                # Blog CRUD
│   │   │   ├── blog.controller.ts
│   │   │   ├── blog.service.ts
│   │   │   ├── blog.module.ts
│   │   │   └── dto/
│   │   │       ├── create-post.dto.ts
│   │   │       ├── update-post.dto.ts
│   │   │       └── pagination.dto.ts
│   │   │
│   │   ├── products/            # Product CRUD
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.module.ts
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       └── update-product.dto.ts
│   │   │
│   │   ├── cart/                # Cart & Orders
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── cart.module.ts
│   │   │   └── dto/
│   │   │       ├── add-to-cart.dto.ts
│   │   │       ├── create-order.dto.ts
│   │   │       └── ...
│   │   │
│   │   ├── users/               # User Management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── upload/              # File Upload
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.module.ts
│   │   │   └── (Multer config in controller)
│   │   │
│   │   ├── contact/             # Contact Form
│   │   │   ├── contact.controller.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── contact.module.ts
│   │   │   └── dto/
│   │   │       └── create-inquiry.dto.ts
│   │   │
│   │   ├── metrics/             # KPIs Dashboard
│   │   │   ├── metrics.controller.ts
│   │   │   ├── metrics.service.ts
│   │   │   └── metrics.module.ts
│   │   │
│   │   ├── calculators/         # Health Calculators
│   │   │   ├── calculators.controller.ts
│   │   │   ├── calculators.service.ts
│   │   │   ├── calculators.module.ts
│   │   │   └── dto/
│   │   │       └── calculate.dto.ts
│   │   │
│   │   ├── entities/            # Database models
│   │   │   ├── index.ts         # All exports
│   │   │   ├── user.entity.ts
│   │   │   ├── blog-post.entity.ts
│   │   │   ├── product.entity.ts
│   │   │   ├── order.entity.ts
│   │   │   ├── order-item.entity.ts
│   │   │   ├── cart.entity.ts
│   │   │   ├── cart-item.entity.ts
│   │   │   ├── category.entity.ts
│   │   │   ├── tag.entity.ts
│   │   │   ├── product-category.entity.ts
│   │   │   ├── subscription.entity.ts
│   │   │   ├── contact-inquiry.entity.ts
│   │   │   ├── metric.entity.ts
│   │   │   ├── calculator.entity.ts
│   │   │   ├── calculator-result.entity.ts
│   │   │   └── (16 entities total)
│   │   │
│   │   ├── common/              # Shared guards & decorators
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts
│   │   │   └── decorators/
│   │   │       └── roles.decorator.ts
│   │   │
│   │   └── seeds/               # Database seeding
│   │       ├── admin-user.seed.ts
│   │       └── demo-content.seed.ts
│   │
│   ├── public/uploads/          # File storage (Multer)
│   │   ├── blogs/
│   │   │   ├── featured/
│   │   │   └── content/
│   │   └── products/
│   │       ├── featured/
│   │       └── gallery/
│   │
│   ├── dist/                    # Compiled JS (after npm run build)
│   ├── package.json             # Backend dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── BACKEND-CHANGES.md       # Recent updates
│   └── DEMO-CONTENT-README.md   # Demo data guide
│
├── Agent/                        # AI Agent reference
│   ├── api.js                   # Frontend API client template
│   ├── auth.ts                  # JWT middleware reference
│   ├── animations.css           # CSS animations
│   ├── globals.css              # Global styles
│   ├── variables.css            # CSS variables
│   ├── schema.sql               # Database schema (reference)
│   └── DietAndWell_Agent_Master_Reference.docx
│
├── package.json                 # Root package (concurrently)
├── .gitignore
├── CODEBASE_ANALYSIS.md         # This analysis
├── API_REFERENCE.md             # API endpoints reference
└── README.md (if exists)
```

---

## 🚀 Quick Commands

### Development
```bash
# Root level - start both servers
npm run dev

# Backend dev server (ts-node-dev with hot reload)
cd backend && npm run dev

# Frontend dev server (Vite)
cd frontend && npm run dev

# Seed demo data
cd backend && npm run seed
```

### Production
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Start production backend
cd backend && npm run start:prod
```

### Testing & Linting
```bash
# Lint frontend
cd frontend && npm run lint
```

---

## 🏗️ Module Organization

### Module Dependency Graph
```
AppModule (root)
├── ConfigModule (env variables)
├── TypeOrmModule (PostgreSQL connection)
└── Feature Modules (imports ConfigModule + TypeOrmModule)
    ├── AuthModule (no dependencies)
    ├── BlogModule (uses AuthModule for guards)
    ├── ProductsModule (uses AuthModule for guards)
    ├── CartModule (uses AuthModule for guards)
    ├── UsersModule (uses AuthModule for guards)
    ├── UploadModule (uses AuthModule for guards)
    ├── ContactModule (no auth required for POST)
    ├── MetricsModule (no auth required for GET)
    ├── CalculatorsModule (no auth required)
    └── (ServicesModule removed)
```

---

## 📊 Entity Relationships

### User Relationships
```
User (1:many)
├── BlogPost (as author)
├── Order
├── Subscription
├── CalculatorResult
└── Cart (1:one)
```

### Blog Relationships
```
BlogPost (many:many)
├── Category (via post_categories junction)
└── Tag (via post_tags junction)
```

### Product Relationships
```
Product (many:many)
└── ProductCategory (via product_product_categories junction)
```

### Cart & Order Relationships
```
Cart (1:many)
└── CartItem
    └── Product

Order (1:many)
└── OrderItem
    └── Product
```

---

## 🔐 Authentication & Authorization

### Flow
1. User registers → `POST /api/auth/register`
2. Password hashed with bcrypt
3. User created in DB
4. JWT tokens generated (accessToken + refreshToken)
5. refreshToken stored in User.refreshToken column
6. Frontend stores accessToken in localStorage
7. All protected endpoints check JWT with JwtAuthGuard
8. RolesGuard checks user.role against @Roles() decorator

### Roles
- **ADMIN**: Full access to all CRUD operations
- **EDITOR**: Limited access (if implemented)
- **USER**: Public + personal data access

### Protected Route Pattern
```typescript
@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminOnly() {
    // Only ADMIN users can access
  }
}
```

---

## 📝 Creating a New Feature

### 1. Create Entity
```typescript
// src/entities/my-entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('my_entities')
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // ... relationships
}
```

### 2. Add to exports
```typescript
// src/entities/index.ts
export { MyEntity } from './my-entity.entity';
```

### 3. Create DTOs
```typescript
// src/my-feature/dto/create-my-entity.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMyEntityDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 4. Create Service
```typescript
// src/my-feature/my-feature.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MyEntity } from '../entities';

@Injectable()
export class MyFeatureService {
  constructor(
    @InjectRepository(MyEntity)
    private repo: Repository<MyEntity>,
  ) {}

  create(dto: CreateMyEntityDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find();
  }
}
```

### 5. Create Controller
```typescript
// src/my-feature/my-feature.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { MyFeatureService } from './my-feature.service';
import { CreateMyEntityDto } from './dto/create-my-entity.dto';

@Controller('my-feature')
export class MyFeatureController {
  constructor(private readonly service: MyFeatureService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateMyEntityDto) {
    return this.service.create(dto);
  }
}
```

### 6. Create Module
```typescript
// src/my-feature/my-feature.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyEntity } from '../entities';
import { MyFeatureController } from './my-feature.controller';
import { MyFeatureService } from './my-feature.service';

@Module({
  imports: [TypeOrmModule.forFeature([MyEntity])],
  controllers: [MyFeatureController],
  providers: [MyFeatureService],
})
export class MyFeatureModule {}
```

### 7. Add to AppModule
```typescript
// src/app.module.ts
import { MyFeatureModule } from './my-feature/my-feature.module';

@Module({
  imports: [
    // ... other imports
    MyFeatureModule,
  ],
})
export class AppModule {}
```

---

## 🔧 Frontend Component Template

```javascript
// src/pages/MyPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './MyPage.css';

export default function MyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/endpoint`);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
      <Row>
        <Col md={6}>
          {data.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </Col>
      </Row>
    </Container>
  );
}
```

---

## 📦 Database Seeding

### Adding Demo Content
```bash
cd backend

# Run the seed script
npm run seed

# This imports from:
# - backend/demo-blog-posts.json
# - backend/demo-services.json
```

### Manual Import via API
```bash
curl -X POST http://localhost:5000/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d @demo-blog-posts.json
```

---

## 🐛 Common Debugging

### Issue: 401 Unauthorized
- [ ] Check JWT token in localStorage
- [ ] Verify token hasn't expired (1 day expiration)
- [ ] Check Authorization header format: `Bearer <token>`
- [ ] Ensure user role has the @Roles() permission

### Issue: 400 Bad Request
- [ ] Check DTO validation (class-validator rules)
- [ ] Verify all required fields are provided
- [ ] Check data types match schema

### Issue: Failed File Upload
- [ ] Check file is image (JPEG, PNG, GIF, WebP)
- [ ] Verify file size < 5MB
- [ ] Ensure `/public/uploads` directory exists and is writable
- [ ] Check Multer destination path is correct

### Issue: Database Connection Error
- [ ] Verify PostgreSQL is running
- [ ] Check .env DATABASE_* variables
- [ ] Ensure database exists: `createdb dietandwell`
- [ ] Check database user has permissions

### Issue: API not responding
- [ ] Check backend is running: `npm run dev` in `/backend`
- [ ] Verify port 5000 is not in use
- [ ] Check CORS settings in main.ts
- [ ] Check API_BASE_URL in frontend config

---

## 🚨 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Change `synchronize: false` in TypeORM config
- [ ] Enable TypeORM migrations
- [ ] Set strong JWT_SECRET
- [ ] Enable rate limiting
- [ ] Configure HTTPS/SSL
- [ ] Setup environment variables securely
- [ ] Enable logging/monitoring
- [ ] Setup database backups
- [ ] Configure image CDN (S3, Cloudflare)
- [ ] Add error tracking (Sentry)
- [ ] Run security audit

---

## 📚 Useful Files to Know

| File | Purpose |
|------|---------|
| `backend/src/app.module.ts` | Where all modules are imported |
| `backend/src/main.ts` | Server configuration (CORS, Swagger, static files) |
| `backend/src/entities/index.ts` | All entity exports (single point of import) |
| `backend/src/auth/auth.service.ts` | JWT token generation & validation |
| `frontend/src/App.js` | React root component with routing |
| `frontend/src/config.js` | API base URL configuration |
| `.env` | Environment variables (not in git) |
| `CODEBASE_ANALYSIS.md` | Full project analysis |
| `API_REFERENCE.md` | Complete API endpoint documentation |

---

## 🎯 Next Development Steps

1. **Complete Admin UI**: Full CRUD interface for all entities
2. **Add Form Validation**: Client-side feedback for user inputs
3. **Error Handling**: Global error toast notifications
4. **Loading States**: Spinner during API calls
5. **Type Safety**: Add TypeScript types for API responses
6. **Cart Persistence**: Save cart to localStorage and sync with backend
7. **Email Notifications**: Implement order & contact confirmations
8. **Testing**: Add Jest unit tests for services
9. **Docker**: Create Dockerfile + docker-compose.yml
10. **Deployment**: Setup CI/CD and hosting (Vercel, Heroku, AWS, etc.)

---

Generated: April 4, 2026  
Maintained: DietAndWell Development Team
