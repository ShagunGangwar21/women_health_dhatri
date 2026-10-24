import React from 'react';
import Icon from './Icon.jsx';

export default function UrgentCareBanner({ message, onDismiss }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-accent-soft)',
      border: '1px solid var(--color-primary-rose)',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      margin: '1rem 0'
    }} className="animate-fade-in no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon name="shield" size={20} color="var(--color-burgundy)" />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          {message || 'Dhatri provides health intelligence and trend synthesis. It is not an emergency triage or clinical diagnosis service.'}
        </span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="btn-icon" style={{ width: '28px', height: '28px' }}>
          ✕
        </button>
      )}
    </div>
  );
}
