import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import DhatriLogo from './DhatriLogo.jsx';
import Icon from './Icon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const menuItems = [
    { label: t('nav.dashboard', {}, 'Dashboard'), path: '/app', icon: 'home', end: true },
    { label: t('nav.journey', {}, 'My Journey'), path: '/app/journey', icon: 'journey' },
    { label: t('nav.trackCycle', {}, 'Track Cycle'), path: '/app/cycle', icon: 'calendar', badge: user?.isMenstruating === false ? (isHindi ? 'छूट' : 'Opted out') : null },
    { label: t('nav.symptoms', {}, 'Symptoms'), path: '/app/symptoms', icon: 'symptom' },
    { label: t('nav.reports', {}, 'Reports'), path: '/app/reports', icon: 'report' },
    { label: t('nav.insights', {}, 'Insights'), path: '/app/insights', icon: 'insight', highlight: true },
    { label: t('nav.learn', {}, 'Learn'), path: '/app/learn', icon: 'learn' },
    { label: t('nav.care', {}, 'Care / Appointments'), path: '/app/care', icon: 'care' },
    { label: t('nav.goals', {}, 'My Goals'), path: '/app/goals', icon: 'goal' },
    { label: t('nav.assistant', {}, 'AI Wellness Assistant'), path: '/app/assistant', icon: 'assistant', badge: 'AI', special: true },
    { label: t('nav.profile', {}, 'Profile'), path: '/app/profile', icon: 'profile' },
    { label: t('nav.settings', {}, 'Settings'), path: '/app/settings', icon: 'settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      {/* Top Header & Logo */}
      <div>
        <div style={{
          padding: '1.25rem 1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {!collapsed ? <DhatriLogo size="small" to="/app" /> : (
            <Link to="/app" title="Dhatri Home">
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-blush-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-burgundy)' }}>D</span>
              </div>
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ThemeToggle />
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="btn-icon desktop-only"
              style={{ width: '32px', height: '32px' }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
            </button>
          </div>
        </div>

        {/* 12 Routes Navigation List */}
        <nav style={{ padding: '0.85rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileDrawerOpen(false)}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '0.75rem' : '0.65rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.92rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? 'var(--nav-item-active-text)'
                  : item.special
                  ? 'var(--color-primary-rose)'
                  : 'var(--nav-item-text)',
                backgroundColor: isActive
                  ? 'var(--nav-item-active-bg)'
                  : item.special
                  ? 'var(--bg-accent-soft)'
                  : 'var(--nav-item-bg)',
                border: isActive
                  ? '1px solid var(--nav-item-active-border)'
                  : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative'
              })}
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={item.icon}
                    size={20}
                    color={
                      isActive
                        ? 'var(--nav-item-active-icon)'
                        : item.special
                        ? 'var(--color-primary-rose)'
                        : 'var(--nav-item-icon)'
                    }
                  />
                  {!collapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: item.special ? 'var(--color-primary-rose)' : 'var(--badge-bg)',
                      color: item.special ? '#FFF8F3' : 'var(--badge-text)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Card & Sign Out */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)'
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-soft-pink)',
                color: 'var(--color-burgundy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Priya Sharma'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user?.biologicalSeason ? 'Exploring Baseline' : 'Active Member'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Sign Out"
            >
              <Icon name="trash" size={15} color="var(--color-primary-rose)" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="btn-icon"
            style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            title="Sign Out"
          >
            <Icon name="trash" size={16} color="var(--color-primary-rose)" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        style={{
          width: collapsed ? '78px' : '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-card)',
          transition: 'width var(--transition-normal)',
          zIndex: 100,
          display: 'none',
          overflowY: 'auto'
        }}
        className="app-desktop-sidebar"
      >
        {navContent}
      </aside>

      {/* Mobile Header Bar & Drawer Toggle */}
      <div
        className="app-mobile-topbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--header-bg)',
          borderBottom: '1px solid var(--border-card)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}
      >
        <DhatriLogo size="small" to="/app" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle />
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="btn-icon"
            aria-label="Open App Menu"
          >
            <Icon name="settings" size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Modal */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex'
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--sidebar-bg)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            {navContent}
          </div>
        </div>
      )}

      <style>{`
        .sidebar-nav-item {
          outline: none;
        }
        .sidebar-nav-item:hover:not(.active) {
          background-color: var(--nav-item-hover-bg) !important;
          color: var(--nav-item-hover-text) !important;
        }
        .sidebar-nav-item:hover:not(.active) svg {
          color: var(--nav-item-hover-icon) !important;
        }
        .sidebar-nav-item:focus-visible {
          outline: 2px solid var(--border-focus);
          outline-offset: 2px;
        }
        @media (min-width: 992px) {
          .app-desktop-sidebar { display: block !important; }
          .app-mobile-topbar { display: none !important; }
        }
        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
