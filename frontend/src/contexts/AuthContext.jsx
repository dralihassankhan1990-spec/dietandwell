/* ================================================================
   Auth Context + Protected Route
   FILE: src/contexts/AuthContext.jsx
   
   Wraps the entire app. Provides:
     - user state accessible everywhere
     - login / logout / updateUser functions
     - ProtectedRoute component (renders <Outlet/> or redirects)
     - AdminRoute component (admin-only guard)
   ================================================================ */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser, getToken, getMe } from '../services/api.js';

/* ── Context ─────────────────────────────────────────────────── */
const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

/* ── Provider ────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* Hydrate from localStorage on mount, then verify with backend */
  const hydrate = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    /* Immediately load from localStorage for instant UI */
    const cached = getCurrentUser();
    if (cached) setUser(cached);

    /* Then verify token is still valid */
    try {
      const fresh = await getMe();
      setUser(fresh);
      localStorage.setItem('user', JSON.stringify(fresh));
    } catch {
      /* Token expired or invalid — clear everything */
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { hydrate(); }, [hydrate]);

  const updateUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    canManageBlog: user?.role === 'admin' || user?.role === 'editor',
    updateUser,
    hydrate,
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-inner">
          <div className="auth-loading-spinner" />
          <p className="auth-loading-text">Loading…</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── ProtectedRoute — requires login ─────────────────────────── */
export function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/* ── AdminRoute — admin dashboard or editor blog manager ────── */
export function AdminRoute() {
  const { isLoggedIn, canManageBlog, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!canManageBlog) return <Navigate to="/profile" replace />;
  return <Outlet />;
}
