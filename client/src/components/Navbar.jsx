import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DhatriLogo from './DhatriLogo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Features', path: '/features' },
    { label: 'Learn', path: '/learn' },
    { label: 'Care', path: '/care' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'var(--header-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid var(--border-card)' : '1px solid transparent',
      transition: 'border-color var(--transition-normal), box-shadow var(--transition-normal)',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Brand Logo */}
        <DhatriLogo size="medium" />

        {/* Desktop Nav Items */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '2rem'
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '0.96rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-primary-rose)' : 'var(--text-secondary)',
                position: 'relative',
                padding: '0.4rem 0'
              }}
            >
              {link.label}
              {isActive(link.path) && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2.5px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--color-primary-rose)'
                }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions: Theme Toggle + Auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/app" className="btn btn-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.9rem' }}>
                Dashboard 🌸
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn btn-outline"
                style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                title="Log Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/signin" className="btn btn-outline" style={{ display: 'none' }} id="desktop-signin">
                Sign In
              </Link>
              <Link to="/onboarding" className="btn btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon mobile-menu-btn"
            aria-label="Open mobile navigation"
            style={{ display: 'inline-flex' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-card)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)'
        }} className="animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '1.1rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-primary-rose)' : 'var(--text-primary)',
                padding: '0.5rem 0'
              }}
            >
              {link.label}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
          {!isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/signin" className="btn btn-outline" style={{ width: '100%' }}>
                Sign In
              </Link>
              <Link to="/onboarding" className="btn btn-primary" style={{ width: '100%' }}>
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/app" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Dashboard
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline" style={{ width: '100%' }}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline Responsive Styles */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          #desktop-signin { display: inline-flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
