import React from 'react';

export default function CyclePhaseWheel({ cycleDay = 14, cycleLength = 28, phase = 'Ovulatory', isMenstruating = true }) {
  if (!isMenstruating) {
    return (
      <div className="dhatri-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-sage-soft)',
          color: 'var(--text-sage)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.75rem'
        }}>
          🌿
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Continuous Wellness Mode</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Cycle calculations are turned off. Dhatri is actively monitoring your sleep, nutrition, mood, and biomarker trends longitudinally.
        </p>
      </div>
    );
  }

  // Calculate stroke progress
  const progressPercent = Math.min(Math.max((cycleDay / cycleLength) * 100, 4), 100);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getPhaseColor = () => {
    switch (phase?.toLowerCase()) {
      case 'menstrual': return 'var(--color-primary-rose)';
      case 'follicular': return 'var(--color-sage)';
      case 'ovulatory': return '#E59866';
      case 'luteal': return 'var(--color-burgundy)';
      default: return 'var(--color-primary-rose)';
    }
  };

  const getPhaseDescription = () => {
    switch (phase?.toLowerCase()) {
      case 'menstrual': return 'Estrogen and progesterone are at baseline. Prioritize warm nutrition, iron reserves, and physical recovery.';
      case 'follicular': return 'Estrogen is climbing. Rising vitality, cognitive focus, and higher metabolic resilience.';
      case 'ovulatory': return 'Peak estrogen and LH surge. Maximum physical stamina and natural social energy.';
      case 'luteal': return 'Progesterone dominates. Basal body temperature elevates; prioritize restorative sleep and hydration.';
      default: return 'Monitoring your personal biological rhythm.';
    }
  };

  return (
    <div className="dhatri-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0.5rem 0 1.25rem' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--bg-accent-soft)"
            strokeWidth="12"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={getPhaseColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 800ms ease, stroke 400ms ease' }}
          />
        </svg>

        {/* Center Text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Cycle Day
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {cycleDay}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            of ~{cycleLength} days
          </span>
        </div>
      </div>

      {/* Phase Badge & Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
        <span className="pill-badge" style={{ backgroundColor: getPhaseColor(), color: '#FFF8F3', fontSize: '0.82rem', padding: '4px 12px' }}>
          {phase} Phase
        </span>
      </div>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.45 }}>
        {getPhaseDescription()}
      </p>
    </div>
  );
}
