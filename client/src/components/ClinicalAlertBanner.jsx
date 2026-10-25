import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from './Icon';

export default function ClinicalAlertBanner({ alerts = [], onOpenDossier }) {
  const { t, language } = useLanguage();
  const [expandedAlerts, setExpandedAlerts] = useState({});

  if (!alerts || alerts.length === 0) return null;

  const toggleExpand = (id) => {
    setExpandedAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const emergencyAlerts = alerts.filter(a => a.guidanceLevel === 'emergency' || a.level === 'emergency');
  const consultAlerts = alerts.filter(a => a.guidanceLevel === 'doctor_consultation' || a.level === 'doctor_consultation');
  const monitoringAlerts = alerts.filter(a => a.guidanceLevel === 'monitoring' || a.level === 'monitoring');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
      {/* 1. EMERGENCY ALERTS — CRITICAL SAFETY TIER (NEVER SUPPRESSED) */}
      {emergencyAlerts.map(alert => (
        <div
          key={alert.id}
          id="emergency-clinical-alert"
          style={{
            backgroundColor: '#FFF0F2',
            border: '2px solid #E53935',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 8px 24px rgba(229, 57, 53, 0.16)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#E53935',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.2rem',
                animation: 'pulse 1.8s infinite'
              }}>
                🚨
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#E53935',
                    color: '#FFFFFF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {language === 'hi' ? 'आपातकालीन चेतावनी' : language === 'hinglish' ? 'Emergency Alert' : 'Medical Emergency Alert'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#B71C1C', fontWeight: 600 }}>
                    {language === 'hi' ? 'तुरंत चिकित्सीय सहायता लें' : 'Immediate Medical Attention Recommended'}
                  </span>
                </div>
                <h3 style={{ color: '#B71C1C', fontSize: '1.15rem', margin: '0.4rem 0 0.25rem', fontWeight: 700 }}>
                  {alert.title || (language === 'hi' ? 'गंभीर लक्षण संकेत' : 'Urgent Clinical Symptom Signal')}
                </h3>
                <p style={{ color: '#5F1414', fontSize: '0.92rem', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  {alert.summary || alert.trigger}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleExpand(alert.id)}
              style={{
                background: 'none',
                border: '1px solid #E53935',
                color: '#B71C1C',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {expandedAlerts[alert.id] ? (language === 'hi' ? 'कम देखें' : 'Hide details') : (language === 'hi' ? 'विवरण देखें' : 'Emergency criteria')}
            </button>
          </div>

          {/* Action Callout */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#FFEBEE',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid #E53935',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '0.88rem', color: '#B71C1C', fontWeight: 600 }}>
              ⚡ {alert.actionSummary || 'Please seek urgent in-person medical evaluation immediately at the nearest ER or urgent care facility.'}
            </div>
            {onOpenDossier && (
              <button
                onClick={onOpenDossier}
                className="btn"
                style={{
                  backgroundColor: '#B71C1C',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                📋 {language === 'hi' ? 'डॉक्टर सारांश देखें' : 'View Doctor Dossier'}
              </button>
            )}
          </div>

          {/* Expandable Criteria */}
          {expandedAlerts[alert.id] && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #FFCDD2', fontSize: '0.86rem', color: '#5F1414' }}>
              {alert.diffFromBaseline && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>{language === 'hi' ? 'बेसलाइन से अंतर' : 'Baseline Difference'}:</strong> {alert.diffFromBaseline}
                </div>
              )}
              {alert.urgentCareCriteria && alert.urgentCareCriteria.length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>{language === 'hi' ? 'कब तुरंत आपातकालीन सहायता लें' : 'When Emergency Medical Assessment is Needed'}:</strong>
                  <ul style={{ margin: '0.4rem 0 0 1.25rem', padding: 0 }}>
                    {alert.urgentCareCriteria.map((crit, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{crit}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#8E0000', fontStyle: 'italic', marginTop: '0.5rem' }}>
                ⚠️ {alert.disclaimer || 'Dhatri is an observational tracking companion. This alert is based on clinically recognized safety criteria and does not replace emergency medical diagnosis.'}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 2. DOCTOR CONSULTATION RECOMMENDED TIER */}
      {consultAlerts.map(alert => (
        <div
          key={alert.id}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--color-primary-rose)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-accent-soft)',
                color: 'var(--color-burgundy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.1rem',
                border: '1px solid var(--border-card)'
              }}>
                🩺
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="pill-badge pill-rose" style={{ fontSize: '0.74rem' }}>
                    {language === 'hi' ? 'डॉक्टर परामर्श अनुशंसित' : language === 'hinglish' ? 'Doctor Consult Recommended' : 'Doctor Consultation Recommended'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {alert.title}
                  </span>
                </div>
                <h4 style={{ color: 'var(--color-burgundy)', fontSize: '1.08rem', margin: '0.4rem 0 0.25rem' }}>
                  {alert.summary || alert.trigger}
                </h4>
                {alert.diffFromBaseline && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                    📊 <strong>{language === 'hi' ? 'ट्रेंड अवलोकन' : 'Trend Observation'}:</strong> {alert.diffFromBaseline}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleExpand(alert.id)}
              className="btn-icon"
              style={{ width: '32px', height: '32px', border: '1px solid var(--border-subtle)' }}
              title="Toggle details"
            >
              <Icon name={expandedAlerts[alert.id] ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
          </div>

          <div style={{
            marginTop: '0.9rem',
            padding: '0.65rem 0.9rem',
            backgroundColor: 'var(--bg-accent-soft)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--color-burgundy)', fontWeight: 500 }}>
              💡 {alert.actionSummary || alert.recommendation || 'Consider scheduling a consultation with your gynecologist or healthcare practitioner.'}
            </span>
            {onOpenDossier && (
              <button
                onClick={onOpenDossier}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                📋 {language === 'hi' ? 'डॉक्टर डोजियर बनाएं' : 'Generate Doctor Dossier'}
              </button>
            )}
          </div>

          {expandedAlerts[alert.id] && (
            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
              {alert.urgentCareCriteria && alert.urgentCareCriteria.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{language === 'hi' ? 'कब तत्काल सहायता लें' : 'When Urgent Medical Assessment is Needed'}:</strong>
                  <ul style={{ margin: '0.3rem 0 0 1.25rem', padding: 0, color: 'var(--text-secondary)' }}>
                    {alert.urgentCareCriteria.map((c, i) => (
                      <li key={i} style={{ marginBottom: '0.2rem' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ℹ️ {alert.disclaimer || 'This notification highlights an observational pattern comparing your records against your historical baseline.'}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 3. SELF-CARE & MONITORING TIER */}
      {monitoringAlerts.map(alert => (
        <div
          key={alert.id}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage-soft)',
                color: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1rem'
              }}>
                🌿
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill-badge pill-sage" style={{ fontSize: '0.72rem' }}>
                    {language === 'hi' ? 'आत्म-देखभाल व निगरानी' : 'Self-Care & Monitoring'}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-burgundy)' }}>
                    {alert.title}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.3rem 0 0.4rem' }}>
                  {alert.summary || alert.trigger}
                </p>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-sage)', fontWeight: 500 }}>
                  🌱 {alert.recommendation}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleExpand(alert.id)}
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
            >
              <Icon name={expandedAlerts[alert.id] ? 'chevron-up' : 'chevron-down'} size={14} />
            </button>
          </div>

          {expandedAlerts[alert.id] && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>{language === 'hi' ? 'डॉक्टर को कब दिखाएं' : 'When to Seek Medical Help'}:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                If symptoms worsen above severity level 3, persist continuously for more than 3 days, or fail to respond to comfort measures, transition to a doctor consultation.
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
