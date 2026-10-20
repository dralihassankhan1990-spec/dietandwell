import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import './index.css';
import './styles/not-found.css';

import { AuthProvider, ProtectedRoute, AdminRoute } from './contexts/AuthContext.jsx';

import TopBar from './components/layout/TopBar.jsx';
import Navbar  from './components/layout/Navbar.jsx';
import Footer  from './components/layout/Footer.jsx';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Calculators = lazy(() => import('./pages/Calculators'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Subscriptions = lazy(() => import('./pages/Subscriptions.jsx'));
const Library = lazy(() => import('./pages/Library.jsx'));
const DietPlanStudio = lazy(() => import('./pages/DietPlanStudio.jsx'));

/* ── Scroll to top on route change ──────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/* ── 404 ─────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-emoji">🌿</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-text">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="not-found-link">← Back to Home</Link>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ScrollToTop />
        <div className="app-container">
          <TopBar />
          <Navbar />
          <main>
            <Suspense fallback={<div className="auth-loading" role="status"><div className="auth-loading-spinner" /><p>Loading page…</p></div>}>
            <Routes>
              {/* ── PUBLIC ──────────────────────────────────── */}
              <Route path="/"             element={<Home />} />
              <Route path="/about"        element={<About />} />
              <Route path="/services"     element={<Services />} />
              <Route path="/diet-plan-studio" element={<DietPlanStudio />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/blog"         element={<Blog />} />
              <Route path="/blog/:slug"   element={<BlogPost />} />
              <Route path="/calculators"  element={<Calculators />} />
              <Route path="/contact"      element={<Contact />} />
              <Route path="/login"        element={<Login />} />
              <Route path="/register"     element={<Register />} />

              {/* ── SHOP + SUBSCRIPTIONS — real pages (no ComingSoon) ─ */}
              <Route path="/shop"         element={<Shop />} />
              <Route path="/shop/:slug"   element={<ProductDetail />} />
              <Route path="/subscriptions" element={<Subscriptions />} />

              {/* ── PROTECTED — requires login ──────────────── */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart"    element={<Cart />} />
                <Route path="/library" element={<Library />} />
              </Route>

              {/* ── ADMIN — requires admin role ─────────────── */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>

              {/* ── 404 ─────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
