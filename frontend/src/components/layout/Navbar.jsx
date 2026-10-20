import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { logout as apiLogout } from '../../services/api.js';
import styles from './Navbar.module.css';

/* ── Navigation definition ───────────────────────────────────── */
const PRIMARY_NAV = [
  { label: 'Home',        href: '/' },
  { label: 'Services',    href: '/services' },
  { label: 'Diet Plan Studio', href: '/diet-plan-studio' },
  { label: 'Shop',        href: '/shop' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Calculators', href: '/calculators' },
  { label: 'Contact',     href: '/contact' },
];

const MORE_NAV = [
  { label: '💎 Subscriptions',  href: '/subscriptions' },
  { label: '👤 About Us',       href: '/about' },
];

export default function Navbar() {
  const { user, isAdmin, canManageBlog } = useAuth();
  const [isScrolled,    setIsScrolled]    = useState(false);
  const [isMobileOpen,  setIsMobileOpen]  = useState(false);
  const [isMoreOpen,    setIsMoreOpen]    = useState(false);
  const [isUserOpen,    setIsUserOpen]    = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const moreRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setIsMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setIsUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Close mobile on route change */
  useEffect(() => { setIsMobileOpen(false); setIsMoreOpen(false); setIsUserOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await apiLogout();
    navigate('/');
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.email?.charAt(0).toUpperCase()
    : '';

  return (
    <>
      <nav
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" className={styles.navLogo} aria-label="DietAndWell Home">
          <span className={styles.navDiet}>Diet</span>
          <span className={styles.navAnd}>&</span>
          <span className={styles.navWell}>Well</span>
        </Link>

        {/* Desktop Links */}
        <div className={styles.navLinks} role="menubar">
          {PRIMARY_NAV.map(item => (
            <Link
              key={item.href}
              to={item.href}
              role="menuitem"
              className={`${styles.navLink} ${location.pathname === item.href ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className={styles.moreWrapper}>
            <button
              className={`${styles.navLink} ${styles.moreBtn} ${isMoreOpen ? styles.active : ''}`}
              onClick={() => setIsMoreOpen(v => !v)}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              More
              <svg className={`${styles.moreChevron} ${isMoreOpen ? styles.open : ''}`}
                width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

            {isMoreOpen && (
              <div className={styles.dropdown} role="menu">
                {MORE_NAV.map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    role="menuitem"
                    className={styles.dropdownItem}
                  >
                    <span>{item.label}</span>
                    {item.badge && <span className={styles.dropdownBadge}>{item.badge}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          {user ? (
            <div ref={userRef} className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setIsUserOpen(v => !v)}
                aria-label="User menu"
              >
                <div className={styles.userAvatar}>{initials}</div>
                <span className={styles.userName}>{user.firstName || 'Profile'}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>

              {isUserOpen && (
                <div className={`${styles.dropdown} ${styles.dropdownRight}`} role="menu">
                  {canManageBlog && (
                    <Link to="/admin" className={styles.dropdownItem} role="menuitem">
                      {isAdmin ? '📊 Admin Dashboard' : '📝 Blog Manager'}
                    </Link>
                  )}
                  <Link to="/profile" className={styles.dropdownItem} role="menuitem">
                    👤 My Profile
                  </Link>
                  <Link to="/library" className={styles.dropdownItem} role="menuitem">
                    📚 My Library
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={handleLogout} role="menuitem">
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className={styles.navActionGhost}>Login</Link>
              <Link to="/register" className={styles.navActionBtn}>Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`${styles.hamburger} ${isMobileOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setIsMobileOpen(v => !v)}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Mobile Menu ─────────────────────────────────────── */}
      {isMobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileOpen(false)}>
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
            {[...PRIMARY_NAV, ...MORE_NAV].map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`${styles.mobileLink} ${location.pathname === item.href ? styles.active : ''}`}
              >
                {item.label}
                {item.badge && <span className={styles.dropdownBadge}>{item.badge}</span>}
              </Link>
            ))}

            <div className={styles.mobileDivider} />

            {user ? (
              <>
                {canManageBlog && (
                  <Link to="/admin" className={styles.mobileLink}>{isAdmin ? '📊 Admin Dashboard' : '📝 Blog Manager'}</Link>
                )}
                <Link to="/profile" className={styles.mobileLink}>👤 My Profile</Link>
                <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={handleLogout}>
                  🚪 Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className={styles.mobileLinkGhost}>Login</Link>
                <Link to="/register" className={styles.mobileLinkPrimary}>Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
