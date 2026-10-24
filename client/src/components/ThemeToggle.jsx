import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import Icon from './Icon.jsx';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn-icon ${className}`}
      title={isDark ? 'Switch to Warm Cream Light Mode' : 'Switch to Deep Plum Dark Mode'}
      aria-label="Toggle visual theme"
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={19} color={isDark ? '#F8C5CE' : '#702B4C'} />
    </button>
  );
}
