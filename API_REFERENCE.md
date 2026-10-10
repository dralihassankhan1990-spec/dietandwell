# DietAndWell API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT Bearer token:
```
Authorization: Bearer <accessToken>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234"
}

Response: 201 Created
{
  "user": { "id": "uuid", "email": "user@example.com", "role": "user", ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{ "message": "Logged out successfully" }
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "userId": "uuid",
  "refreshToken": "..."
}

Response: 200 OK
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Get Current User Profile (Protected)
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## 📝 Blog Endpoints

### Create Blog Post (Admin)
```http
POST /api/blog
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "The Gut-Brain Connection",
  "excerpt": "How your microbiome affects mental health",
  "content": "# The Gut-Brain Connection\n\nFull markdown content here...",
  "featuredImage": "/uploads/blogs/featured/image.jpg",
  "contentImages": ["/uploads/blogs/content/image1.jpg"],
  "metaTitle": "Gut-Brain Connection - DietAndWell",
  "metaDescription": "Learn how your microbiome affects mental health",
  "categories": ["Health", "Nutrition"],
  "tags": ["gut-health", "mental-health"],
  "published": true,
  "status": "published"
}

Response: 201 Created
{
  "id": "uuid",
  "title": "The Gut-Brain Connection",
  "slug": "the-gut-brain-connection",
  ...
}
```

### Get All Blog Posts (Public - Paginated)
```http
GET /api/blog
GET /api/blog?page=1&limit=10
GET /api/blog?search=nutrition
GET /api/blog?category=health&tag=wellness

Response: 200 OK
{
  "posts": [
    {
      "id": "uuid",
      "title": "...",
      "slug": "...",
      "excerpt": "...",
      "contentImages": [],
      "views": 150,
      "author": { "id": "uuid", "firstName": "Admin", ... },
      "categories": [],
      "tags": [],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Get Single Blog Post (Public)
```http
GET /api/blog/the-gut-brain-connection

Response: 200 OK
{
  "id": "uuid",
  "title": "The Gut-Brain Connection",
  "slug": "the-gut-brain-connection",
  "content": "# The Gut-Brain Connection\n...",
  "views": 151,
  "author": { ... },
  "categories": [ { "id": "uuid", "name": "Health", "slug": "health" } ],
  "tags": [ { "id": "uuid", "name": "gut-health", "slug": "gut-health" } ],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Get Blog Categories & Tags
```http
GET /api/blog/categories
GET /api/blog/tags

Response: 200 OK
[
  { "id": "uuid", "name": "Health", "slug": "health" }
]
```

### Delete Blog Post (Admin)
```http
DELETE /api/blog/{id}
Authorization: Bearer <admin_token>

Response: 200 OK
{ "message": "Blog post deleted" }
```

---

## 🛍️ Product Endpoints

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Organic Spirulina Powder",
  "slug": "organic-spirulina-powder",
  "description": "High-quality spirulina powder",
  "price": "29.99",
  "salePrice": "24.99",
  "stock": 100,
  "stockStatus": "in_stock",
  "sku": "SPR-001",
  "featuredImage": "/uploads/products/featured/spirulina.jpg",
  "galleryImages": ["/uploads/products/gallery/img1.jpg"],
  "categories": ["Supplements"],
  "active": true
}

Response: 201 Created
```

### Get All Products (Public - Paginated)
```http
GET /api/products
GET /api/products?page=1&limit=20
GET /api/products?active=true

Response: 200 OK
{
  "products": [
    {
      "id": "uuid",
      "name": "Organic Spirulina Powder",
      "slug": "organic-spirulina-powder",
      "price": "29.99",
      "salePrice": "24.99",
      "stock": 100,
      "stockStatus": "in_stock",
      "featuredImage": "...",
      "galleryImages": [],
      "categories": [],
      "active": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Get Single Product (Public)
```http
GET /api/products/{product-id}

Response: 200 OK
{ "id": "uuid", "name": "...", ... }
```

### Update Product (Admin)
```http
PUT /api/products/{product-id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "price": "25.99", "stock": 95, ... }

Response: 200 OK
```

### Delete Product (Admin)
```http
DELETE /api/products/{product-id}
Authorization: Bearer <admin_token>

Response: 200 OK
```

---

## 🛒 Cart Endpoints

### Get User Cart (Protected)
```http
GET /api/cart
Authorization: Bearer <user_token>

Response: 200 OK
{
  "id": "uuid",
  "user": { "id": "uuid", "email": "..." },
  "items": [
    {
      "id": "uuid",
      "product": { "id": "uuid", "name": "Spirulina", "price": "29.99" },
      "quantity": 2
    }
  ],
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Add Product to Cart (Protected)
```http
POST /api/cart/add
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}

Response: 200 OK
{ "message": "Item added to cart", "cart": { ... } }
```

### Remove Item from Cart (Protected)
```http
DELETE /api/cart/remove/{cartItemId}
Authorization: Bearer <user_token>

Response: 200 OK
```

### Clear Cart (Protected)
```http
DELETE /api/cart/clear
Authorization: Bearer <user_token>

Response: 200 OK
{ "message": "Cart cleared" }
```

---

## 📦 Order Endpoints

### Create Order (Protected)
```http
POST /api/orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "Same as shipping"
}

Response: 201 Created
{
  "id": "uuid",
  "user": { "id": "uuid" },
  "items": [
    { "id": "uuid", "product": { "id": "uuid", "name": "Spirulina" }, "quantity": 2 }
  ],
  "subtotal": "59.98",
  "tax": "4.80",
  "total": "64.78",
  "status": "pending",
  "stripePaymentIntentId": "pi_...",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Get All Orders (Protected - User sees own, Admin sees all)
```http
GET /api/orders
Authorization: Bearer <token>

Response: 200 OK
[
  { "id": "uuid", "total": "64.78", "status": "completed", ... }
]
```

### Get Single Order (Protected)
```http
GET /api/orders/{order-id}
Authorization: Bearer <token>

Response: 200 OK
{ "id": "uuid", "items": [...], "total": "64.78", ... }
```

---

## 📸 File Upload Endpoints

### Upload Blog Featured Image (Admin)
```http
POST /api/upload/blog/featured
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

file: <binary image>

Response: 200 OK
{
  "filename": "1704099600000-abc123.jpg",
  "url": "/uploads/blogs/featured/1704099600000-abc123.jpg",
  "size": 102400
}
```

### Upload Blog Content Images (Admin)
```http
POST /api/upload/blog/content
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

files: [<binary images>]

Response: 200 OK
{
  "files": [
    { "filename": "...", "url": "/uploads/blogs/content/...", "size": 102400 }
  ]
}
```

### Upload Product Featured Image (Admin)
```http
POST /api/upload/product/featured
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

file: <binary image>

Response: 200 OK
{ "filename": "...", "url": "/uploads/products/featured/...", "size": 102400 }
```

### Upload Product Gallery Images (Admin)
```http
POST /api/upload/product/gallery
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

files: [<binary images>]

Response: 200 OK
{ "files": [{ "filename": "...", "url": "...", "size": 102400 }] }
```

---

## 📧 Contact Endpoints

### Submit Contact Form (Public)
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "I'd like to know more about your services"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "new",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Get Contact Inquiries (Admin)
```http
GET /api/contact
GET /api/contact?page=1&limit=20
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "message": "...",
      "status": "new",
      "notes": null,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

### Mark Inquiry as Read (Admin)
```http
PATCH /api/contact/{inquiry-id}/read
Authorization: Bearer <admin_token>

Response: 200 OK
{ "message": "Inquiry marked as read", "status": "read" }
```

---

## 👥 User Management Endpoints (Admin)

### Get All Users (Admin)
```http
GET /api/users
Authorization: Bearer <admin_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Create User (Admin)
```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "555-5678",
  "role": "user"
}

Response: 201 Created
{ "id": "uuid", "email": "newuser@example.com", ... }
```

### Update User (Admin)
```http
PUT /api/users/{user-id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "role": "editor",
  "isActive": true
}

Response: 200 OK
```

### Delete User (Admin)
```http
DELETE /api/users/{user-id}
Authorization: Bearer <admin_token>

Response: 200 OK
{ "message": "User deleted" }
```

---

## 📊 Metrics Endpoints

### Get All Metrics (Public)
```http
GET /api/metrics

Response: 200 OK
[
  {
    "id": "uuid",
    "key": "total_users",
    "label": "Total Users",
    "value": "1250",
    "unit": "users",
    "icon": "users",
    "sortOrder": 1
  }
]
```

### Get Metrics (Admin)
```http
GET /api/metrics/admin
Authorization: Bearer <admin_token>

Response: 200 OK
[ ... same as public ... ]
```

---

## 🧮 Calculator Endpoints

### List Calculators (Public)
```http
GET /api/calculators

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "BMI Calculator",
    "type": "bmi",
    "description": "Calculate your Body Mass Index",
    "instructions": "Enter your height and weight...",
    "isActive": true,
    "sortOrder": 1
  }
]
```

### Calculate (Public)
```http
POST /api/calculators/calculate
Content-Type: application/json

{
  "type": "bmi",
  "weight": 75,
  "height": 1.80
}

Response: 200 OK
{
  "result": 23.15,
  "category": "normal_weight",
  "message": "You have a normal BMI"
}
```

---

## ⚡ Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc.) |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |

---

## 🔍 Query Parameters

Many `GET` endpoints support:
- `page` (default: 1)
- `limit` (default: 10)
- `search` (full-text search)
- `category` (filter by category slug)
- `tag` (filter by tag slug)
- `active` (filter by status true/false)

---

## 🔒 Pagination Example

```
GET /api/blog?page=2&limit=5

Response:
{
  "posts": [...],
  "total": 47,
  "page": 2,
  "limit": 5,
  "totalPages": 10
}

Frontend: Implement pagination UI using:
- totalPages: Number of pages to display
- page: Current page
- limit: Items per page
```

---

## 📌 Important Notes

1. **File Uploads**: Multipart form-data only, max 5MB per file
2. **Images Only**: JPEG, PNG, GIF, WebP accepted
3. **Token Expiration**: accessToken expires in 1 day
4. **CORS**: Enabled for all origins
5. **Rate Limiting**: None currently implemented (add in production)
6. **Validation**: All DTOs validated at global level (whitelist & transform)
7. **Swagger Docs**: Available at `http://localhost:5000/api/docs`

Generated: April 4, 2026
