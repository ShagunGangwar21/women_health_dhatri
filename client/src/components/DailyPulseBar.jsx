import React, { useState } from 'react';
import { useHealthData } from '../contexts/HealthDataContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Icon from './Icon.jsx';

export default function DailyPulseBar() {
  const { dailyData, saveDailyCheckIn } = useHealthData();
  const { t } = useLanguage();
  const today = dailyData?.todayLog;

  const [mood, setMood] = useState(today?.mood || 'grounded');
  const [sleepHours, setSleepHours] = useState(today?.sleepHours || 7.5);
  const [energyLevel, setEnergyLevel] = useState(today?.energyLevel || 3);
  const [hydration, setHydration] = useState(today?.hydrationGlasses || 6);
  const [saved, setSaved] = useState(false);

  // Synchronize with persistent backend records upon load/refresh
  React.useEffect(() => {
    if (today) {
      if (today.mood) setMood(today.mood);
      if (today.sleepHours !== undefined) setSleepHours(today.sleepHours);
      if (today.energyLevel !== undefined) setEnergyLevel(today.energyLevel);
      if (today.hydrationGlasses !== undefined) setHydration(today.hydrationGlasses);
    }
  }, [today]);

  const moods = [
    { id: 'grounded', labelKey: 'grounded', fallback: 'Grounded', emoji: '🌱' },
    { id: 'happy', labelKey: 'radiant', fallback: 'Radiant', emoji: '✨' },
    { id: 'calm', labelKey: 'calm', fallback: 'Calm', emoji: '🌸' },
    { id: 'drained', labelKey: 'drained', fallback: 'Drained', emoji: '🌧️' },
    { id: 'anxious', labelKey: 'restless', fallback: 'Restless', emoji: '⚡' }
  ];

  const handleQuickSave = async (overrides = {}) => {
    const payload = {
      date: new Date().toISOString().split('T')[0],
      mood: overrides.mood || mood,
      sleepHours: overrides.sleepHours !== undefined ? overrides.sleepHours : sleepHours,
      energyLevel: overrides.energyLevel !== undefined ? overrides.energyLevel : energyLevel,
      hydrationGlasses: overrides.hydration !== undefined ? overrides.hydration : hydration
    };
    await saveDailyCheckIn(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="dhatri-card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-sage)', fontWeight: 700 }}>
            {t('dashboard.ambientPulse', null, 'Daily Ambient Pulse')}
          </span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '2px' }}>
            {t('dashboard.baselinePrompt', null, 'How is your baseline today?')}
          </h3>
        </div>
        {saved && (
          <span className="pill-badge pill-sage animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="check" size={14} /> {t('common.success', null, 'Saved')}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {/* Mood Selector */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            {t('dashboard.currentFeeling', null, 'Current Feeling')}
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {moods.map((m) => {
              const isSelected = mood === m.id;
              const label = t(`dashboard.feelings.${m.labelKey}`, null, m.fallback);
              return (
                <button
                  key={m.id}
                  onClick={() => { setMood(m.id); handleQuickSave({ mood: m.id }); }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--control-active-border)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--control-active-bg)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--control-active-text)' : 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{m.emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level (1-5) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('dashboard.energyLevel', null, 'Energy Level')}
            </label>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-rose)' }}>{energyLevel}/5</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setEnergyLevel(lvl); handleQuickSave({ energyLevel: lvl }); }}
                style={{
                  flex: 1,
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: energyLevel >= lvl ? 'var(--color-primary-rose)' : 'var(--bg-accent-soft)',
                  color: energyLevel >= lvl ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Hours */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('dashboard.sleepLastNight', null, 'Sleep Last Night')}
            </label>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-sage)' }}>{sleepHours} hrs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { const val = Math.max(sleepHours - 0.5, 3); setSleepHours(val); handleQuickSave({ sleepHours: val }); }}
              className="btn-icon"
              style={{ width: '30px', height: '30px' }}
            >
              -
            </button>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: '45px', textAlign: 'center' }}>
              {sleepHours}h
            </span>
            <button
              onClick={() => { const val = Math.min(sleepHours + 0.5, 14); setSleepHours(val); handleQuickSave({ sleepHours: val }); }}
              className="btn-icon"
              style={{ width: '30px', height: '30px' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Hydration */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('dashboard.waterToday', null, 'Water Today')}
            </label>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {hydration} {t('dashboard.glasses', null, 'glasses')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { const val = Math.max(hydration - 1, 0); setHydration(val); handleQuickSave({ hydration: val }); }}
              className="btn-icon"
              style={{ width: '30px', height: '30px' }}
            >
              -
            </button>
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: Math.min(hydration, 8) }).map((_, i) => (
                <span key={i} style={{ color: 'var(--color-sage)', fontSize: '0.9rem' }}>💧</span>
              ))}
            </div>
            <button
              onClick={() => { const val = hydration + 1; setHydration(val); handleQuickSave({ hydration: val }); }}
              className="btn-icon"
              style={{ width: '30px', height: '30px' }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
