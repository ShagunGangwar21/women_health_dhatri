import React from 'react';
import { Link } from 'react-router-dom';

export default function DhatriLogo({ size = 'medium', showTagline = true, to = '/' }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isSmall ? '8px' : '12px', userSelect: 'none' }}>
      {/* Botanical Lotus Emblem */}
      <div style={{
        width: isSmall ? '34px' : isLarge ? '50px' : '42px',
        height: isSmall ? '34px' : isLarge ? '50px' : '42px',
        borderRadius: '50%',
        background: 'var(--color-blush-pink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(112, 43, 76, 0.12)',
        flexShrink: 0
      }}>
        <svg viewBox="0 0 64 64" width={isSmall ? "24" : isLarge ? "36" : "30"} height={isSmall ? "24" : isLarge ? "36" : "30"} fill="none">
          {/* Crescent */}
          <path d="M16 36 C14 22, 26 12, 40 12 C43 12, 46 13, 48 14 C36 16, 26 26, 26 38 C26 48, 34 54, 44 54 C32 54, 18 48, 16 36 Z" fill="#702B4C" />
          {/* Lotus Petals */}
          <path d="M32 18 C30 26, 28 34, 32 44 C36 34, 34 26, 32 18 Z" fill="#D96F89" />
          <path d="M32 26 C24 28, 20 36, 24 44 C27 40, 29 34, 32 32 Z" fill="#F8C5CE" />
          <path d="M32 26 C40 28, 44 36, 40 44 C37 40, 35 34, 32 32 Z" fill="#D96F89" />
          <path d="M22 46 C28 50, 36 50, 42 46 C38 48, 26 48, 22 46 Z" fill="#81977C" />
          <circle cx="32" cy="16" r="2.5" fill="#702B4C" />
        </svg>
      </div>

      {/* Brand Name & Devanagari Pill */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: isSmall ? '1.25rem' : isLarge ? '1.9rem' : '1.5rem',
            fontWeight: 700,
            color: 'var(--color-burgundy)',
            letterSpacing: '0.02em',
            lineHeight: 1
          }}>
            Dhatri
          </span>
          <span style={{
            fontSize: isSmall ? '0.68rem' : '0.78rem',
            fontWeight: 600,
            background: 'var(--color-blush-pink)',
            color: 'var(--color-burgundy)',
            padding: '2px 7px',
            borderRadius: '12px',
            letterSpacing: '0.02em',
            display: 'inline-block'
          }}>
            धात्री
          </span>
        </div>
        {showTagline && !isSmall && (
          <span style={{
            fontSize: isLarge ? '0.75rem' : '0.68rem',
            fontWeight: 600,
            color: 'var(--color-sage)',
            letterSpacing: '0.08em',
            marginTop: '2px',
            textTransform: 'uppercase'
          }}>
            Your Wellness Bestie
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>;
  }
  return content;
}
