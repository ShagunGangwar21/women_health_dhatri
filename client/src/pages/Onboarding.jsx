import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import DhatriLogo from '../components/DhatriLogo.jsx';
import Icon from '../components/Icon.jsx';

export default function Onboarding() {
  const { user, register, demoLogin, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [season, setSeason] = useState('regulating_exploring');
  const [concern, setConcern] = useState('');
  const [isMenstruating, setIsMenstruating] = useState(true);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);

  const seasons = [
    {
      id: 'regulating_exploring',
      title: 'Regulating & Exploring Rhythms',
      description: 'Understanding cycle phases, hormonal energy variance, and physical baseline.',
      emoji: '🌸'
    },
    {
      id: 'persistent_concern',
      title: 'Investigating a Persistent Concern',
      description: 'Recurring pain, unexplained fatigue, skin flare-ups, or delayed diagnosis.',
      emoji: '🔍'
    },
    {
      id: 'perimenopause',
      title: 'Perimenopause / Menopause Transition',
      description: 'Navigating vasomotor symptoms, sleep shifts, and changing biological seasons.',
      emoji: '🌿'
    },
    {
      id: 'postpartum',
      title: 'Postpartum & Maternal Recovery',
      description: 'Pelvic floor health, hormonal recovery, and rebuilding metabolic reserves.',
      emoji: '🤱'
    },
    {
      id: 'longevity',
      title: 'Longitudinal Vitality & Longevity',
      description: 'Preventive metabolic health, bone density, and biomarker tracking.',
      emoji: '✨'
    }
  ];

  const handleFinish = async () => {
    // If not logged in, trigger demo or guest creation
    try {
      if (user) {
        await updateProfile({
          biologicalSeason: season,
          primaryConcern: concern || 'Longitudinal biological monitoring',
          isMenstruating,
          averageCycleLength: Number(cycleLength),
          averagePeriodDuration: Number(periodDuration)
        });
      } else {
        await demoLogin();
      }
      navigate('/app');
    } catch {
      navigate('/app');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem'
    }}>
      <div className="dhatri-card" style={{ maxWidth: '640px', width: '100%', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <DhatriLogo size="small" to="/" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.25rem' }}>
            <span style={{ width: '28px', height: '4px', borderRadius: '2px', backgroundColor: step >= 1 ? 'var(--color-primary-rose)' : 'var(--border-subtle)' }} />
            <span style={{ width: '28px', height: '4px', borderRadius: '2px', backgroundColor: step >= 2 ? 'var(--color-primary-rose)' : 'var(--border-subtle)' }} />
            <span style={{ width: '28px', height: '4px', borderRadius: '2px', backgroundColor: step >= 3 ? 'var(--color-primary-rose)' : 'var(--border-subtle)' }} />
          </div>
        </div>

        {/* Step 1: Biological Season */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.45rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem', textAlign: 'center' }}>
              What is your current biological season?
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.75rem' }}>
              Dhatri adapts its intelligence to your lived phase of womanhood.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              {seasons.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSeason(s.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: season === s.id ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                    backgroundColor: season === s.id ? 'var(--bg-accent-soft)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{s.emoji}</span>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-burgundy)', marginBottom: '2px' }}>{s.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Cycle Baseline or Opt-Out */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.45rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem', textAlign: 'center' }}>
              Cycle & Baseline Rhythm
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.75rem' }}>
              Help us calibrate your bi-temporal coordinates.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Do you currently menstruate?</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsMenstruating(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: isMenstruating ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                    backgroundColor: isMenstruating ? 'var(--bg-accent-soft)' : 'var(--bg-card)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Yes, Active Cycle
                </button>
                <button
                  type="button"
                  onClick={() => setIsMenstruating(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: !isMenstruating ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                    backgroundColor: !isMenstruating ? 'var(--bg-accent-soft)' : 'var(--bg-card)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  No / Irregular / Opt Out
                </button>
              </div>
            </div>

            {isMenstruating && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Typical Cycle Length</label>
                  <input
                    type="number"
                    min="20"
                    max="50"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days between period starts (avg 28)</span>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Period Duration</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(e.target.value)}
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days of bleeding (avg 5)</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Primary Concern & Zero Guilt Contract */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.45rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem', textAlign: 'center' }}>
              What brought you here today?
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.75rem' }}>
              What is one thing about your body you wish someone had listened to?
            </p>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g., I notice intense fatigue and migraines during my late luteal phase, but my blood reports are called 'normal'..."
                className="form-textarea"
                rows={4}
              />
            </div>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>Our Promise:</strong> Dhatri will never judge you, nag you, or diagnose you. Your data is sovereign and client-protected.
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>
                ← Back
              </button>
              <button onClick={handleFinish} className="btn btn-primary" style={{ flex: 2 }}>
                Enter My Health Dashboard 🌸
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
