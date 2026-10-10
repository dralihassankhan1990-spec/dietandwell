// ═══════════════════════════════════════════════════════════════
// DietAndWell — Frontend API Service
// FILE: /frontend/src/services/api.js
//
// AGENT: All fetch calls go here. Pages/components import from here.
// Never write fetch() calls inside component files.
// ═══════════════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── AUTH HELPER ─────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('dietandwell_admin_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

// ── PUBLIC ENDPOINTS ────────────────────────────────────────────

/**
 * Get all published blogs
 * @param {Object} params - { limit, category, search }
 */
export async function getBlogs({ limit, category, search } = {}) {
  const params = new URLSearchParams();
  if (limit)    params.set('limit', limit);
  if (category) params.set('category', category);
  if (search)   params.set('search', search);
  const res = await fetch(`${BASE_URL}/blogs?${params}`);
  return handleResponse(res);
}

/**
 * Get single blog post by slug
 * @param {string} slug
 */
export async function getBlogBySlug(slug) {
  const res = await fetch(`${BASE_URL}/blogs/${slug}`);
  return handleResponse(res);
}

/**
 * Submit contact form
 * @param {{ fullName, email, phone, message }} data
 */
export async function submitContact(data) {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Subscribe to newsletter
 * @param {string} email
 */
export async function subscribeNewsletter(email) {
  const res = await fetch(`${BASE_URL}/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

/**
 * Save calculator result and email to user
 * @param {{ email, type, result }} data
 */
export async function saveCalculatorResult(data) {
  const res = await fetch(`${BASE_URL}/calculators/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * Admin login
 * @param {{ email, password }} credentials
 * @returns {{ token: string }}
 */
export async function adminLogin(credentials) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse(res);
  if (data.token) localStorage.setItem('dietandwell_admin_token', data.token);
  return data;
}

export function adminLogout() {
  localStorage.removeItem('dietandwell_admin_token');
}

/**
 * Get all blogs (admin — includes drafts)
 */
export async function adminGetBlogs() {
  const res = await fetch(`${BASE_URL}/admin/blogs`, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * Create blog post
 * @param {Object} blog
 */
export async function adminCreateBlog(blog) {
  const res = await fetch(`${BASE_URL}/admin/blogs`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(blog),
  });
  return handleResponse(res);
}

/**
 * Update blog post
 * @param {string} id
 * @param {Object} updates
 */
export async function adminUpdateBlog(id, updates) {
  const res = await fetch(`${BASE_URL}/admin/blogs/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

/**
 * Delete blog post
 * @param {string} id
 */
export async function adminDeleteBlog(id) {
  const res = await fetch(`${BASE_URL}/admin/blogs/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Upload image
 * @param {File} file
 * @returns {{ url: string }}
 */
export async function adminUploadImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

/**
 * Get contact submissions (admin)
 */
export async function adminGetContacts() {
  const res = await fetch(`${BASE_URL}/admin/contacts`, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * Get newsletter subscribers (admin)
 */
export async function adminGetSubscribers() {
  const res = await fetch(`${BASE_URL}/admin/subscribers`, { headers: authHeaders() });
  return handleResponse(res);
}
