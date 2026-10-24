import React, { useState } from 'react';
import { useHealthData } from '../contexts/HealthDataContext.jsx';
import Icon from './Icon.jsx';

export default function HealthAlertsBanner({ onOpenDossier }) {
  const { alerts = [], allAlerts = [], dismissedCount = 0, dismissAlert, restoreAlerts } = useHealthData();
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  const [showDismissedMode, setShowDismissedMode] = useState(false);

  const displayedAlerts = showDismissedMode ? allAlerts : alerts;

  if (!displayedAlerts || displayedAlerts.length === 0) {
    if (dismissedCount > 0) {
      return (
        <div className="dhatri-card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🌿</span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Personalized Health Monitoring</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>All current trend observations have been reviewed and dismissed.</div>
            </div>
          </div>
          <button
            onClick={restoreAlerts}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
          >
            Review Dismissed Alerts ({dismissedCount})
          </button>
        </div>
      );
    }
    return null;
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'elevated':
        return { label: 'High Priority Observation', bg: 'rgba(217, 111, 137, 0.2)', text: 'var(--color-burgundy)', icon: 'alert-triangle' };
      case 'moderate':
        return { label: 'Notable Trend Signal', bg: 'rgba(217, 111, 137, 0.12)', text: 'var(--color-primary-rose)', icon: 'activity' };
      default:
        return { label: 'Physiological Rhythm Note', bg: 'rgba(129, 151, 124, 0.15)', text: 'var(--color-sage)', icon: 'info' };
    }
  };

  return (
    <div className="dhatri-card animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '5px solid var(--color-primary-rose)', padding: '1.5rem 1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🔬</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-burgundy)', margin: 0 }}>
                Personalized Health Monitoring & Alert System
              </h3>
              <span className="pill-badge pill-rose" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {alerts.length} Active {alerts.length === 1 ? 'Observation' : 'Observations'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Automated multi-signal trend analysis across your diagnostic lab reports, symptom journals, and menstrual cycle rhythm.
            </p>
          </div>
        </div>

        {dismissedCount > 0 && (
          <button
            onClick={() => setShowDismissedMode(!showDismissedMode)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {showDismissedMode ? 'Show Active Only' : `Show All (${dismissedCount} dismissed)`}
          </button>
        )}
      </div>

      {/* Alert Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedAlerts.map((alert) => {
          const badge = getSeverityBadge(alert.severity);
          const isExpanded = expandedAlertId === alert.id;

          return (
            <div
              key={alert.id}
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                padding: '1.1rem 1.25rem',
                opacity: alert.isDismissed ? 0.65 : 1,
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: badge.bg,
                        color: badge.text,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon name={badge.icon} size={12} /> {badge.label}
                    </span>
                    {alert.isDismissed && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        (Dismissed)
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1.02rem', color: 'var(--color-burgundy)', marginBottom: '4px' }}>
                    {alert.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>
                    {alert.summary}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                    title="View supporting records"
                  >
                    <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} />
                    {isExpanded ? 'Hide Records' : 'View Records'}
                  </button>

                  {!alert.isDismissed && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="btn-icon"
                      style={{ width: '30px', height: '30px' }}
                      title="Dismiss alert"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Underlying Records & Clinical Recommendation */}
              {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }} className="animate-fade-in">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Supporting User Records ({alert.evidence?.length || 0}):
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                    {alert.evidence?.map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-card)',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>{ev.label}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-rose)' }}>{ev.value}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{ev.refRange}</span>
                        </div>
                        {ev.status && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-sage)', marginTop: '2px' }}>
                            {ev.status}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Recommendation Box */}
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-sage)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.84rem', color: 'var(--color-deep-green)', marginBottom: '3px' }}>
                      <Icon name="check-circle" size={15} color="var(--color-sage)" /> Recommended Next Step:
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {alert.recommendation}
                    </div>
                    {onOpenDossier && (
                      <button
                        onClick={onOpenDossier}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', marginTop: '8px' }}
                      >
                        📋 Open 3-Minute Doctor Dossier
                      </button>
                    )}
                  </div>

                  {/* Safety Disclaimer */}
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ⚖️ {alert.disclaimer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
