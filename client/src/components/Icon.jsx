import React from 'react';

export default function Icon({ name, size = 20, color = 'currentColor', className = '', ...props }) {
  const getPath = () => {
    switch (name) {
      case 'home':
        return <path d="M3 10.5L12 3l9 7.5v10.5a1.5 1.5 0 01-1.5 1.5h-5a1.5 1.5 0 01-1.5-1.5v-5h-2v5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 013 21V10.5z" />;
      case 'journey':
        return <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010-16zm-1-13h2v6h-2zm0 8h2v2h-2z" />;
      case 'calendar':
        return (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={color} strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
            <circle cx="8" cy="14" r="1.2" fill={color} />
            <circle cx="12" cy="14" r="1.2" fill={color} />
            <circle cx="16" cy="14" r="1.2" fill={color} />
            <circle cx="8" cy="18" r="1.2" fill={color} />
            <circle cx="12" cy="18" r="1.2" fill={color} />
          </>
        );
      case 'cycle':
        return (
          <>
            <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
            <path d="M12 7v5l3 3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="3" r="2" fill={color} />
          </>
        );
      case 'symptom':
      case 'heart-pulse':
        return (
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'report':
      case 'file-text':
        return (
          <>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke={color} strokeWidth="2" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'insight':
      case 'sparkles':
        return (
          <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2zm7 13l1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15z" fill={color} />
        );
      case 'learn':
      case 'book':
        return (
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20v-14H6.5A2.5 2.5 0 004 5.5v14zm0 0a2.5 2.5 0 002.5 2.5H20M9 7h6M9 11h4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'care':
      case 'stethoscope':
        return (
          <>
            <path d="M4.5 3v6a5.5 5.5 0 0011 0V3M15.5 9a5.5 5.5 0 01-11 0" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M10 14.5v3.5a3 3 0 003 3h3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="21" r="2" fill={color} />
          </>
        );
      case 'goal':
      case 'target':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
            <circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="2" />
            <circle cx="12" cy="12" r="2" fill={color} />
          </>
        );
      case 'assistant':
      case 'chat':
        return (
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'profile':
      case 'user':
        return (
          <>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" fill="none" stroke={color} strokeWidth="2" />
          </>
        );
      case 'settings':
        return (
          <>
            <circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'sun':
        return (
          <>
            <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="2" />
            <line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'moon':
        return (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'droplet':
        return <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'check':
        return <path d="M20 6L9 17l-5-5" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
      case 'plus':
        return <path d="M12 5v14M5 12h14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />;
      case 'trash':
        return (
          <>
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'print':
        return (
          <>
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" fill="none" stroke={color} strokeWidth="2" />
            <path d="M6 14h12v8H6z" fill="none" stroke={color} strokeWidth="2" />
          </>
        );
      case 'chevron-right':
        return <path d="M9 18l6-6-6-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'chevron-left':
        return <path d="M15 18l-6-6 6-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'shield':
        return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'search':
        return (
          <>
            <circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'mic':
        return (
          <>
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'mic-off':
        return (
          <>
            <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      default:
        return <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="2" />;
    }
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      {getPath()}
    </svg>
  );
}
