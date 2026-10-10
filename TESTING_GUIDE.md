# DietAndWell — Complete Testing Guide
## End-to-End Testing for All Features

**Last Updated:** April 11, 2026  
**Status:** ✅ All systems operational  
**Frontend:** http://localhost:3000  
**Backend:** http://localhost:8000  
**API Docs:** http://localhost:8000/api/docs

---

## 🔑 ADMIN CREDENTIALS

```
Email:    admin@dietandwell.com
Password: Admin123!
```

**To create/reset admin user:**
```bash
cd backend
npm run seed
```

---

## 📋 TEST PLAN

### Phase 1: Authentication & User Management (15 mins)
- [ ] Sign up as a new user
- [ ] Log in with new credentials
- [ ] Verify profile page loads with user info
- [ ] Verify admin badge shows for admin users
- [ ] Test logout
- [ ] Verify login redirects to /profile
- [ ] Verify admin redirects to /admin

### Phase 2: Home Page & Sections (10 mins)
- [ ] Homepage loads with zero errors
- [ ] Hero section displays correctly (image aligned left/right of text)
- [ ] Calculator cards section loads
- [ ] Click calculator card → navigates to /calculators with pre-selected calculator
- [ ] Flip-card nutrition section works (click to flip)
- [ ] All sections animate on scroll

### Phase 3: Contact Form (5 mins)
- [ ] Fill contact form with valid data
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Check backend: contact inquiry saved to database

### Phase 4: Admin Dashboard (20 mins)
#### Blog Management
- [ ] Login as admin
- [ ] Navigate to /admin
- [ ] Go to "📝 Blog Posts" tab
- [ ] Create new blog post with title, slug, excerpt, content
- [ ] Upload featured image for blog
- [ ] Click "Save" and verify success
- [ ] Verify post appears in list
- [ ] Edit the post (change title)
- [ ] Verify edit appears immediately
- [ ] Delete a post and verify removal

#### Contact Management
- [ ] Go to "📩 Contacts" tab
- [ ] Verify submitted contact forms appear
- [ ] Click on a contact to view full message
- [ ] Mark contact as read
- [ ] Verify read status updates

#### User Management
- [ ] Go to "👥 Users" tab
- [ ] Verify all registered users appear
- [ ] Verify admin badge visible on admin users

#### Analytics
- [ ] Go to "📊 Dashboard" tab
- [ ] Verify metrics display (total users, posts, contacts, etc.)

### Phase 5: Blog Page (10 mins)
- [ ] Navigate to /blog
- [ ] Verify created blog posts display
- [ ] Search for blog post by title
- [ ] Filter by category (if applicable)
- [ ] Click on blog post → navigates to /blog/:slug
- [ ] Verify full post content displays

### Phase 6: Calculators (10 mins)
- [ ] Navigate to /calculators
- [ ] Select a calculator (BMI Calculator)
- [ ] Fill in required inputs
- [ ] Calculate and verify results
- [ ] Select another calculator
- [ ] Verify results page shows previous results (history)

### Phase 7: Navigation & Links (5 mins)
- [ ] Navbar shows correct links based on auth status
- [ ] "Admin" link shows only for admin users
- [ ] "My Profile" shows only for logged-in users
- [ ] Subscriptions link visible to all
- [ ] Services page loads
- [ ] Shop page loads
- [ ] About page loads

### Phase 8: Error Handling (5 mins)
- [ ] Try to access /admin without being logged in → redirects to /login
- [ ] Try to access /admin as non-admin user → show error or redirect
- [ ] Submit contact form with invalid email → show validation error
- [ ] Try to register with weak password → show validation error

---

## 🧪 STEP-BY-STEP TEST EXECUTION

### STEP 1: Sign Up (New User Registration)

**URL:** http://localhost:3000/register

**Test Case 1.1:**
```
Input:
  First Name: John
  Last Name: Doe
  Email: john.doe@example.com
  Password: SecurePass123!
  Confirm Password: SecurePass123!

Expected:
  ✅ User created successfully
  ✅ Redirects to /profile
  ✅ User data displays on profile page
  ✅ Navbar shows "My Profile" and "Logout"
```

**Test Case 1.2 (Validation):**
```
Input:
  Email: invalid-email
  Password: weak

Expected:
  ✅ Shows error: "Email is required" or email format error
  ✅ Shows error: "Password must be at least 8 characters"
```

---

### STEP 2: Log In (Authentication)

**URL:** http://localhost:3000/login

**Test Case 2.1 (Regular User):**
```
Input:
  Email: john.doe@example.com
  Password: SecurePass123!

Expected:
  ✅ Success message appears
  ✅ Redirects to /profile
  ✅ Navbar shows "My Profile" and "Logout"
  ✅ Can access protected pages
```

**Test Case 2.2 (Admin User):**
```
Input:
  Email: admin@dietandwell.com
  Password: Admin123!

Expected:
  ✅ Success message appears
  ✅ Redirects to /admin (special admin route)
  ✅ Navbar shows "👨‍💼 Admin" badge
  ✅ Can access admin dashboard
```

**Test Case 2.3 (Invalid Credentials):**
```
Input:
  Email: wrong@email.com
  Password: WrongPass123!

Expected:
  ✅ Shows error: "Invalid email or password"
  ✅ Stays on /login page
```

---

### STEP 3: Contact Form (Public Feature)

**URL:** http://localhost:3000/contact

**Test Case 3.1 (Valid Submission):**
```
Input:
  Name: Jane Smith
  Email: jane@example.com
  Phone: +1-555-0123
  Message: I'm interested in your nutrition coaching services.

Expected:
  ✅ Form submitted successfully
  ✅ Success message: "Message sent! We'll respond within 24 hours."
  ✅ Form clears (fields reset)
  ✅ Backend: Contact inquiry saved to database

Database Check:
  Run in backend terminal:
    psql -U postgres -d dietandwell -c "SELECT * FROM contact_inquiries;"
  Should show: [Jane Smith, jane@example.com, message...]
```

---

### STEP 4: Admin Dashboard - Blog Management

**Prerequisites:** Must be logged in as admin

**URL:** http://localhost:3000/admin

**Test Case 4.1 (Create Blog Post):**

1. Navigate to `/admin`
2. Click tab "✏️ New Post"
3. Fill in:
   ```
   Title: "The Ultimate Guide to Macro Tracking"
   Slug: "ultimate-guide-macro-tracking"
   Excerpt: "Learn how to optimize your nutrition by tracking macros."
   Category: "Nutrition"
   Content: "Macro tracking is essential for achieving your fitness goals..."
   ```
4. Click "Upload Featured Image" and select an image
5. Click "Publish" button

**Expected Results:**
```
✅ Blog post created successfully
✅ Post appears in "📝 Blog Posts" tab
✅ Post accessible at /blog/ultimate-guide-macro-tracking
✅ Featured image displays
✅ Can see post author and publish date
```

**Test Case 4.2 (Edit Blog Post):**

1. Go to "📝 Blog Posts" tab
2. Find the newly created post
3. Click "Edit" button
4. Change title to: "Advanced Macro Tracking Strategies"
5. Click "Save"

**Expected Results:**
```
✅ Changes saved successfully
✅ Title updated in both admin and blog page
✅ Last updated timestamp changes
```

**Test Case 4.3 (Delete Blog Post):**

1. Go to "📝 Blog Posts" tab
2. Find a post
3. Click "Delete" button
4. Confirm deletion

**Expected Results:**
```
✅ Post removed from list
✅ Post no longer accessible at /blog/:slug
✅ Shows 404 if trying to access deleted post
```

---

### STEP 5: Admin Dashboard - Contact Management

**URL:** http://localhost:3000/admin → "📩 Contacts" tab

**Test Case 5.1 (View Submitted Contacts):**

1. Go to "📩 Contacts" tab
2. You should see the contact submitted in STEP 3

**Expected Results:**
```
✅ Contact from Jane Smith appears in list
✅ Shows: Name, Email, Date submitted
✅ Shows unread status (orange badge if unread)
```

**Test Case 5.2 (Mark Contact as Read):**

1. Click on Jane Smith's contact
2. Full message displays
3. Click "Mark as Read"

**Expected Results:**
```
✅ Contact marked as read (status changes)
✅ Orange badge disappears
✅ Can see full message and contact info
```

---

### STEP 6: Admin Dashboard - Dashboard/Metrics

**URL:** http://localhost:3000/admin → "📊 Dashboard" tab

**Expected Results:**
```
✅ Shows total count of:
   - Registered Users: 2 (admin + John Doe)
   - Blog Posts: ≥1 (the post we created)
   - Contact Messages: ≥1 (Jane Smith's message)
   - Views/Interactions (if tracked)
```

---

### STEP 7: Blog Page (Public)

**URL:** http://localhost:3000/blog

**Test Case 7.1 (View Blog Posts):**

1. Navigate to /blog
2. You should see the blog post you created in admin

**Expected Results:**
```
✅ Blog post card displays with:
   - Featured image
   - Title: "Advanced Macro Tracking Strategies"
   - Excerpt
   - Category badge
   - "Read More" button
```

**Test Case 7.2 (Read Full Blog Post):**

1. Click on blog post card
2. Navigate to /blog/ultimate-guide-macro-tracking

**Expected Results:**
```
✅ Full post page loads
✅ Featured image displays
✅ Full content renders
✅ Post metadata shows (author, date, etc.)
✅ Related posts appear below
```

---

### STEP 8: Home Page - Calculator Integration

**URL:** http://localhost:3000

**Test Case 8.1 (Calculator Cards):**

1. Scroll to "Your Health, Quantified" section
2. Click on "BMI Calculator" card

**Expected Results:**
```
✅ Navigates to /calculators
✅ BMI Calculator is pre-selected/highlighted
✅ Form for BMI inputs displays
```

**Test Case 8.2 (Calculate BMI):**

1. Fill in:
   ```
   Height: 180 cm
   Weight: 75 kg
   ```
2. Click "Calculate"

**Expected Results:**
```
✅ Result displays: BMI = 23.1 (healthy weight)
✅ Result saved (if logged in)
✅ Shows health range interpretation
```

---

### STEP 9: Navigation & Responsive Design

**Test Case 9.1 (Desktop Navigation):**

**Logged Out State (Navbar shows):**
- Home | Services | Blog | Calculators | Shop | Contact
- Login | Sign Up buttons

**Logged In State (Navbar shows):**
- Home | Services | Blog | Calculators | Shop | Contact | Subscriptions
- My Profile | Logout buttons

**Admin State (Navbar shows):**
- Home | Services | Blog | Calculators | Shop | Contact | Subscriptions
- 👨‍💼 Admin | My Profile | Logout buttons

**Test Case 9.2 (Mobile Navigation):**

1. Resize browser to mobile width (< 768px)
2. Click hamburger menu (☰)

**Expected Results:**
```
✅ Mobile menu opens
✅ All nav links accessible
✅ Login/Signup or Profile/Logout shows correctly
✅ Menu closes when link clicked
```

---

### STEP 10: Logout Flow

**URL:** Any page with Navbar visible

**Test Case 10.1 (Logout):**

1. Click "Logout" button in Navbar
2. Verify state

**Expected Results:**
```
✅ User logged out
✅ Redirects to home page (/)
✅ Navbar shows Login | Sign Up (not Profile/Logout)
✅ Cannot access /profile (redirects to /login)
✅ Cannot access /admin (redirects to /login)
✅ localStorage tokens cleared
```

---

## 🐛 KNOWN ISSUES & TROUBLESHOOTING

### Issue: Contact form submission fails
```
Check: 
  1. Backend is running (check port 8000)
  2. Database is running (PostgreSQL)
  3. Network tab in browser DevTools shows endpoint: /api/contact
  4. Response status (should be 201 or 200)
```

### Issue: Login redirect not working
```
Check:
  1. User role in database (admin/user)
  2. localStorage shows accessToken
  3. Browser DevTools → Application → LocalStorage
  4. API route /auth/me returns user with role
```

### Issue: Blog images not showing
```
Check:
  1. Image uploaded successfully (check /public/uploads/blogs/)
  2. Imageurl() function returns correct path
  3. CORS headers allow image serving
  4. Backend/public folder is static served
```

### Issue: Admin page shows 404 or no access
```
Check:
  1. User has role = 'admin' in database
  2. isAdmin() returns true
  3. getCurrentUser() shows correct role
  4. localStorage has valid accessToken
```

---

## ✅ FINAL VALIDATION CHECKLIST

- [ ] All pages load without console errors
- [ ] Homepage displays all sections correctly
- [ ] Authentication flow works (signup → login → profile)
- [ ] Admin can create/edit/delete blog posts
- [ ] Admin can manage contact inquiries
- [ ] Navbar shows correct links based on auth
- [ ] Contact form submits and saves to database
- [ ] Calculator integration works with sessionStorage
- [ ] All routes are accessible
- [ ] Mobile responsive design works
- [ ] Error pages display properly
- [ ] Database connections are stable

---

## 🚀 DEPLOYMENT CHECKLIST (When Ready)

- [ ] Update `.env` with production values
- [ ] Change JWT_SECRET to secure random string
- [ ] Update FRONTEND_URL to production domain
- [ ] Update DATABASE_HOST/PASSWORD for production DB
- [ ] Set NODE_ENV=production
- [ ] Run `npm run build` in both frontend and backend
- [ ] Test production build locally first
- [ ] Deploy backend first, then frontend
- [ ] Verify all APIs work in production
- [ ] Test email notifications (if implemented)
- [ ] Monitor error logs in production

---

## 📞 SUPPORT CONTACT INFO

Add your contact information here when you're ready to launch.

---

**End of Testing Guide**
