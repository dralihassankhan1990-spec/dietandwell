/* ================================================================
   DietAndWell — Frontend API Service
   FILE: src/services/api.js
   Backend: NestJS, global prefix /api, default port 8000
   (backend/src/main.ts). Every path below was verified against the
   backend controllers in ../backend/src — see ENDPOINT NOTES at the
   bottom for gaps the backend does not implement yet.
   ================================================================ */

const BASE     = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const BASE_URL = BASE.replace(/\/api$/, '');

/* ── helpers ─────────────────────────────────────────────────── */
export const getToken   = () => localStorage.getItem('accessToken');
export const getBaseUrl = () => BASE_URL;

function authHeaders(isFormData = false) {
  const h = {};
  if (!isFormData) h['Content-Type'] = 'application/json';
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

let refreshPromise = null;

function clearStoredAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function renewAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const user = getCurrentUser();
    if (!refreshToken || !user?.id) throw new Error('No refresh session');

    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, refreshToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.accessToken || !data.refreshToken) {
      throw new Error(data.message || 'Session expired');
    }
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function req(method, path, body = null, isFormData = false, retry = true) {
  const opts = { method, headers: authHeaders(isFormData) };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  let res = await fetch(`${BASE}${path}`, opts);
  if (res.status === 401 && retry && path !== '/auth/refresh') {
    try {
      const token = await renewAccessToken();
      opts.headers.Authorization = `Bearer ${token}`;
      res = await fetch(`${BASE}${path}`, opts);
    } catch {
      clearStoredAuth();
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message.join('. ') : data.message;
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data;
}

/** Converts a relative upload path to a full URL */
export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('/images/')) return path;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* ═══════════════════════════════════════════════════════════════
   AUTH  (backend: auth.controller.ts)
═══════════════════════════════════════════════════════════════ */
export async function login(email, password) {
  const data = await req('POST', '/auth/login', { email, password });
  if (data.accessToken)  localStorage.setItem('accessToken',  data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  if (data.user)         localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function register(payload) {
  const data = await req('POST', '/auth/register', payload);
  if (data.accessToken)  localStorage.setItem('accessToken',  data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  if (data.user)         localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function logout() {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } finally {
    clearStoredAuth();
  }
}

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

export function isAdmin() {
  const u = getCurrentUser();
  return u?.role === 'admin';
}

export function isLoggedIn() { return !!getToken(); }

export async function getMe() {
  return req('GET', '/auth/me');
}

export async function updateProfile(payload) {
  const user = await req('PATCH', '/auth/me', payload);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

/* ═══════════════════════════════════════════════════════════════
   BLOG — Public  (backend: blog.controller.ts)
   GET /blog returns PUBLISHED posts only. Admin list is
   adminGetBlogs() below (GET /blog/admin/all, drafts included).
═══════════════════════════════════════════════════════════════ */
export async function getBlogs({ page = 1, limit = 12, search, category, tag } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (search)   p.set('search',   search);
  if (category) p.set('category', category);
  if (tag)      p.set('tag',      tag);
  return req('GET', `/blog?${p}`);
}

export async function getBlogBySlug(slug) {
  return req('GET', `/blog/${slug}`);
}

export async function getBlogCategories() {
  return req('GET', '/blog/categories');
}

export async function getBlogTags() {
  return req('GET', '/blog/tags');
}

/* ═══════════════════════════════════════════════════════════════
   BLOG — Admin  (backend: blog.controller.ts)
   Create/Update DTO accepts ONLY: title, content, excerpt,
   featuredImage, contentImages, published, metaTitle,
   metaDescription, tags[], categories[]. The backend has
   ValidationPipe(forbidNonWhitelisted) — any extra field (e.g.
   `status`, `slug`, `coverImage`) is rejected with 400.
═══════════════════════════════════════════════════════════════ */
export async function adminGetBlogs({ page = 1, limit = 100, search, category, tag } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (search)   p.set('search',   search);
  if (category) p.set('category', category);
  if (tag)      p.set('tag',      tag);
  return req('GET', `/blog/admin/all?${p}`);
}

export async function adminCreateBlog(payload) {
  return req('POST', '/blog', payload);
}

export async function adminUpdateBlog(id, payload) {
  return req('PATCH', `/blog/${id}`, payload);
}

export async function adminDeleteBlog(id) {
  return req('DELETE', `/blog/${id}`);
}

export async function uploadBlogFeaturedImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/upload/blog/featured`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

/** Cover-image upload reuses the existing blog featured-image endpoint
 *  (POST /upload/blog/featured, returns { url }) — the returned URL is
 *  stored in the post's `coverImage` field. */
export const uploadBlogCoverImage = uploadBlogFeaturedImage;

export async function uploadBlogContentImages(files) {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  const res = await fetch(`${BASE}/upload/blog/content`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT  (backend: contact.controller.ts)
   Create DTO: { name, email, phone?, message }.
═══════════════════════════════════════════════════════════════ */
export async function submitContact(payload) {
  return req('POST', '/contact', payload);
}

export async function adminGetContacts({ page = 1, limit = 20 } = {}) {
  return req('GET', `/contact?page=${page}&limit=${limit}`);
}

export async function adminMarkContactRead(id) {
  return req('PATCH', `/contact/${id}/read`);
}
export async function adminReplyContact(id, message) {
  return req('POST', `/contact/${id}/reply`, { message });
}
export async function explainStudioPreview(region) {
  return req('POST', '/diet-plan-studio/explain-preview', { region });
}

/* ═══════════════════════════════════════════════════════════════
   NEWSLETTER  (backend: newsletter.controller.ts)
   POST /newsletter/subscribe — public, idempotent (re-subscribing
   an existing address returns success, no duplicate row).
   GET /newsletter/subscribers + DELETE /newsletter/subscribers/:id
   — admin only.
═══════════════════════════════════════════════════════════════ */
export async function subscribeNewsletter(email) {
  return req('POST', '/newsletter/subscribe', { email });
}

export async function adminGetSubscribers({ page = 1, limit = 20 } = {}) {
  return req('GET', `/newsletter/subscribers?page=${page}&limit=${limit}`);
}

export async function adminDeleteSubscriber(id) {
  return req('DELETE', `/newsletter/subscribers/${id}`);
}

/* ═══════════════════════════════════════════════════════════════
   METRICS  (backend: metrics.controller.ts)
═══════════════════════════════════════════════════════════════ */
export async function getMetrics() {
  return req('GET', '/metrics');
}

/* ═══════════════════════════════════════════════════════════════
   SERVICES  (backend: services.controller.ts — GET only)
═══════════════════════════════════════════════════════════════ */
export async function getServices() {
  return req('GET', '/services');
}

export async function getServiceBySlug(slug) {
  return req('GET', `/services/${slug}`);
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCTS  (backend: products.controller.ts)
═══════════════════════════════════════════════════════════════ */
export async function getProducts({ page = 1, limit = 20, search, category, type } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (search)   p.set('search',   search);
  if (category) p.set('category', category);
  if (type)     p.set('type',     type);
  return req('GET', `/products?${p}`);
}

export async function getProductBySlug(slug) {
  return req('GET', `/products/${slug}`);
}

export async function getProductCategories() {
  return req('GET', '/products/categories');
}

/* ═══════════════════════════════════════════════════════════════
   CART + ORDERS  (backend: cart.controller.ts, orders.controller.ts)
═══════════════════════════════════════════════════════════════ */
export async function getCart() {
  return req('GET', '/cart');
}

export async function addToCart(productId, quantity = 1, variantLabel) {
  return req('POST', '/cart/items', { productId, quantity, ...(variantLabel ? { variantLabel } : {}) });
}

export async function updateCartItem(itemId, quantity) {
  return req('PATCH', `/cart/items/${itemId}`, { quantity });
}

export async function removeCartItem(itemId) {
  return req('DELETE', `/cart/items/${itemId}`);
}

export async function clearCart() {
  return req('DELETE', '/cart');
}

export async function createOrder({ shippingAddress, notes }) {
  return req('POST', '/orders', { shippingAddress, notes });
}

export async function getMyOrders({ page = 1, limit = 10 } = {}) {
  return req('GET', `/orders?page=${page}&limit=${limit}`);
}

export async function adminGetPhysicalOrders(status = 'all', { page = 1, limit = 50 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (status && status !== 'all') p.set('status', status);
  return req('GET', `/orders/admin/all?${p}`);
}

export async function adminUpdatePhysicalOrder(id, status) {
  return req('PATCH', `/orders/${id}/status`, { status });
}

/* ═══════════════════════════════════════════════════════════════
   USERS — Admin  (backend: users.controller.ts)
═══════════════════════════════════════════════════════════════ */
export async function adminGetUsers() {
  return req('GET', '/users');
}

/* ═══════════════════════════════════════════════════════════════
   CALCULATORS  (backend: calculators.controller.ts)
   GET  /calculators                      (public list)
   POST /calculators/calculate        { type, inputData }
   POST /calculators/calculate/save   { type, inputData, saveResult: true } (JWT)
   POST /calculators/save             { email, type, result, inputs? } (public, emails result; no DB row)
   GET  /calculators/my-results       (JWT)
   Valid `type` values (CalculatorType enum): bmi, tdee, macro,
   body_fat, water_intake, qurbani_meat. There is NO ideal-weight
   type.
═══════════════════════════════════════════════════════════════ */
export async function getCalculators() {
  return req('GET', '/calculators');
}
export async function runCalculator(type, inputData) {
  return req('POST', '/calculators/calculate', { type, inputData });
}

export async function saveCalculatorResult(type, inputData) {
  return req('POST', '/calculators/calculate/save', { type, inputData, saveResult: true });
}

export async function getMyCalculatorResults(type) {
  const q = type ? `?type=${encodeURIComponent(type)}` : '';
  return req('GET', `/calculators/my-results${q}`);
}

/* ═══════════════════════════════════════════════════════════════
   SHOP — ROUND 1  (Modification Round 1, frontend worker)
   Backend contract (binding on both workers, Oct 2026):
   GET    /categories                       → [{id,name,slug,image,description,sortOrder}]
   GET    /categories/:slug                 → {category, products:[...]}
   POST   /categories                       (admin JWT) → 201
   PATCH  /categories/:id                   (admin)     → 200
   DELETE /categories/:id                   (admin)     → 200
   GET    /products?category=<slug>&type=digital|physical
   POST   /products                         (admin, multipart images[]+digitalFile, or JSON) → 201
   PATCH  /products/:id                     (admin) → 200
   DELETE /products/:id                     (admin) → 200
   POST   /digital-orders                   PUBLIC {productId,name,contact,email,paymentMethod:'request'|'bank_transfer'} → 201
   GET    /digital-orders                   (admin) ?status=pending
   PATCH  /digital-orders/:id               (admin) {status:'granted'|'rejected'} → 200
   GET    /digital-orders/mine              (auth)
   GET    /digital-orders/:id/download      (auth) → file stream (403 unless granted & owner/admin)
   GET    /settings/public                  PUBLIC → {bank_account_details, support_phone, support_email}
   GET    /settings                         (admin) → [{key,value}]
   PUT    /settings                         (admin) {key,value} → 200
   GET    /users                            (admin)
   POST   /users                            (admin) {email,password,firstName,lastName,role}
   PATCH  /users/:id                        (admin) {role?,isActive?,password?}
═══════════════════════════════════════════════════════════════ */

/* ── Categories ────────────────────────────────────────────── */
export async function getCategories() {
  return req('GET', '/categories');
}

export async function getCategoryBySlug(slug) {
  return req('GET', `/categories/${encodeURIComponent(slug)}`);
}

export async function adminCreateCategory(payload) {
  return req('POST', '/categories', payload);
}

export async function adminUpdateCategory(id, payload) {
  return req('PATCH', `/categories/${id}`, payload);
}

export async function adminDeleteCategory(id) {
  return req('DELETE', `/categories/${id}`);
}

/* ── Products — admin ────────────────────────────────────────
   Accepts a plain object (sent as JSON) OR a FormData (sent as
   multipart — use fields `images[]` for each image file and
   `digitalFile` for the single digital file). */
export async function adminCreateProduct(payload) {
  return req('POST', '/products', payload, payload instanceof FormData);
}

export async function adminUpdateProduct(id, payload) {
  return req('PATCH', `/products/${id}`, payload, payload instanceof FormData);
}

export async function adminDeleteProduct(id) {
  return req('DELETE', `/products/${id}`);
}

/* ── Digital orders — public request + user library ────────── */
export async function submitDigitalOrder(payload) {
  // JWT is attached automatically by req() when the user is logged in.
  return req('POST', '/digital-orders', payload);
}

export async function getMyDigitalOrders() {
  return req('GET', '/digital-orders/mine');
}

/* Download MUST go through fetch (not a plain <a>) so the
   Authorization header is sent. Returns {blob, filename}. */
export async function downloadDigitalOrder(id) {
  const res = await fetch(`${BASE}/digital-orders/${id}/download`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.message || `Download failed (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  let filename = 'download';
  const cd = res.headers.get('Content-Disposition');
  const m = cd && cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (m) filename = decodeURIComponent(m[1] || m[2]);
  return { blob, filename };
}

/* ── Digital orders — admin ────────────────────────────────── */
export async function adminGetDigitalOrders(status = 'pending') {
  const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return req('GET', `/digital-orders${q}`);
}

export async function adminUpdateDigitalOrder(id, status) {
  return req('PATCH', `/digital-orders/${id}`, { status });
}

/* ── Settings ──────────────────────────────────────────────── */
export async function getPublicSettings() {
  return req('GET', '/settings/public');
}

export async function adminGetSettings() {
  return req('GET', '/settings');
}

export async function adminUpdateSetting(key, value) {
  return req('PUT', '/settings', { key, value });
}

/* ── Users — admin ─────────────────────────────────────────── */
export async function adminCreateUser(payload) {
  return req('POST', '/users', payload);
}

export async function adminUpdateUser(id, payload) {
  return req('PATCH', `/users/${id}`, payload);
}

/* All user-facing data actions in the current frontend have matching
   backend routes. Payment-provider services remain intentionally disabled
   until real JazzCash/Easypaisa merchant credentials are configured. */
