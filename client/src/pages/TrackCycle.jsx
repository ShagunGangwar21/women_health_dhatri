import React, { useState } from 'react';
import { useHealthData } from '../contexts/HealthDataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import CalendarView from '../components/CalendarView.jsx';
import Icon from '../components/Icon.jsx';

export default function TrackCycle() {
  const { user, updateProfile } = useAuth();
  const { cycleData, symptoms, logPeriod, deletePeriod } = useHealthData();
  const { t, formatDate } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState('medium');
  const [pain, setPain] = useState(2);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Settings
  const [isMenstruating, setIsMenstruating] = useState(user?.isMenstruating !== false);
  const [cycleLength, setCycleLength] = useState(user?.averageCycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState(user?.averagePeriodDuration || 5);
  const [settingsSaved, setSettingsSaved] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.isMenstruating !== undefined) setIsMenstruating(user.isMenstruating);
      if (user.averageCycleLength) setCycleLength(user.averageCycleLength);
      if (user.averagePeriodDuration) setPeriodDuration(user.averagePeriodDuration);
    }
  }, [user]);

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setStartDate(dateStr);
    setShowLogModal(true);
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await logPeriod({
      startDate,
      endDate: endDate || null,
      flowIntensity: flow,
      painLevel: Number(pain),
      notes
    });
    setSaving(false);
    if (ok) {
      setShowLogModal(false);
      setSuccessMsg(t('common.success', null, 'Period logged successfully!'));
      setTimeout(() => setSuccessMsg(''), 3000);
      setNotes('');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    await updateProfile({
      isMenstruating,
      averageCycleLength: Number(cycleLength),
      averagePeriodDuration: Number(periodDuration)
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const estimates = cycleData?.estimates;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-rose">Bi-Temporal Rhythm</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
            {t('trackCycle.title', null, 'Cycle & Menstrual Calendar')}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            {t('trackCycle.subtitle', null, 'Log periods, observe hormonal rhythm shifts, and review algorithmic estimates clearly labeled as approximations.')}
          </p>
        </div>

        <button
          onClick={() => { setStartDate(new Date().toISOString().split('T')[0]); setShowLogModal(true); }}
          className="btn btn-primary"
        >
          <Icon name="plus" size={18} /> {t('trackCycle.recordPeriod', null, 'Log Period Flow')}
        </button>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: 'var(--bg-sage-soft)', border: '1px solid var(--color-sage)', color: 'var(--text-sage)', padding: '0.8rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Estimates & Guidance Card */}
      {estimates?.hasEnoughData ? (
        <div className="dhatri-card" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '4px solid var(--color-primary-rose)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>
              {t('trackCycle.estimatedNext', null, 'Calendar Rhythm Estimates')}
            </h3>
            <span className="pill-badge pill-sage">Mathematical Approximation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('trackCycle.estimatedNext', null, 'Estimated Next Period')}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary-rose)', marginTop: '2px' }}>
                {estimates.estimatedNextPeriod?.startDate ? (formatDate ? formatDate(estimates.estimatedNextPeriod.startDate) : estimates.estimatedNextPeriod.startDate) : '—'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fertile Window (Est.)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-sage)', marginTop: '2px' }}>
                {estimates.estimatedFertileWindow?.startDate} to {estimates.estimatedFertileWindow?.endDate}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Ovulation</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#E59866', marginTop: '2px' }}>
                {estimates.estimatedOvulationDate}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {estimates.disclaimer}
          </p>
        </div>
      ) : (
        <div className="dhatri-card" style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'center', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Log at least one period start date to generate mathematical calendar projections.
          </p>
        </div>
      )}

      {/* Main Interactive Monthly Calendar */}
      <CalendarView
        cycleLogs={cycleData?.cycleLogs || []}
        symptoms={symptoms || []}
        estimates={estimates}
        onDateClick={handleDateClick}
        selectedDate={selectedDate}
      />

      {/* Cycle History Table & Management */}
      <div className="dhatri-card">
        <h3 style={{ fontSize: '1.25rem', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
          {t('trackCycle.periodHistory', null, 'Cycle History')} ({cycleData?.cycleLogs?.length || 0} Entries)
        </h3>

        {cycleData?.cycleLogs?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No period logs recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>{t('trackCycle.startDate', null, 'Start Date')}</th>
                  <th style={{ padding: '10px 12px' }}>{t('trackCycle.endDate', null, 'End Date')}</th>
                  <th style={{ padding: '10px 12px' }}>{t('trackCycle.flowIntensity', null, 'Flow Intensity')}</th>
                  <th style={{ padding: '10px 12px' }}>{t('trackCycle.painScore', null, 'Pain Level')}</th>
                  <th style={{ padding: '10px 12px' }}>{t('common.notes', null, 'Notes')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>{t('common.actions', null, 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {cycleData.cycleLogs.map((log) => (
                  <tr key={log._id || log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{formatDate ? formatDate(log.startDate) : log.startDate}</td>
                    <td style={{ padding: '10px 12px' }}>{log.endDate ? (formatDate ? formatDate(log.endDate) : log.endDate) : '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="pill-badge pill-rose" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                        {log.flowIntensity}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{log.painLevel}/10</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{log.notes || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => deletePeriod(log._id || log.id)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px', color: 'var(--color-primary-rose)' }}
                        title="Delete log"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cycle Settings & Non-Menstruating Toggle */}
      <div className="dhatri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-burgundy)' }}>Personal Cycle Settings</h3>
          {settingsSaved && <span className="pill-badge pill-sage">{t('common.success', null, 'Settings Updated')}</span>}
        </div>

        <form onSubmit={handleUpdateSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Menstrual Tracking Mode</label>
            <select
              value={isMenstruating ? 'active' : 'opt_out'}
              onChange={(e) => setIsMenstruating(e.target.value === 'active')}
              className="form-select"
            >
              <option value="active">Active Menstrual Tracking</option>
              <option value="opt_out">Non-Menstruating / Opt Out</option>
            </select>
          </div>

          <div>
            <label className="form-label">{t('trackCycle.avgLength', null, 'Average Cycle Length')} ({t('trackCycle.days', null, 'Days')})</label>
            <input
              type="number"
              min="20"
              max="60"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="form-input"
              disabled={!isMenstruating}
            />
          </div>

          <div>
            <label className="form-label">{t('trackCycle.avgDuration', null, 'Average Period Bleed Duration')} ({t('trackCycle.days', null, 'Days')})</label>
            <input
              type="number"
              min="1"
              max="15"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(e.target.value)}
              className="form-input"
              disabled={!isMenstruating}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
              {t('common.save', null, 'Save Rhythm Preferences')}
            </button>
          </div>
        </form>
      </div>

      {/* Log Period Modal */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1000
        }}>
          <div className="dhatri-card" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-burgundy)' }}>{t('trackCycle.recordPeriod', null, 'Log Period')}</h3>
              <button onClick={() => setShowLogModal(false)} className="btn-icon">✕</button>
            </div>

            <form onSubmit={handleSavePeriod}>
              <div className="form-group">
                <label className="form-label">{t('trackCycle.startDate', null, 'Period Start Date')}</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('trackCycle.endDate', null, 'End Date (Optional)')}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('trackCycle.flowIntensity', null, 'Flow Intensity')}</label>
                <select value={flow} onChange={(e) => setFlow(e.target.value)} className="form-select">
                  <option value="spotting">Spotting</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                  <option value="variable">Variable</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label">{t('trackCycle.painScore', null, 'Cramp / Pain Severity')}</label>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-rose)' }}>{pain}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pain}
                  onChange={(e) => setPain(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--color-primary-rose)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('common.notes', null, 'Notes & Physical Sensations')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Heavy drag in lower back, herbal tea helped..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  {t('common.cancel', null, 'Cancel')}
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>
                  {saving ? t('common.submitting', null, 'Saving...') : t('trackCycle.savePeriod', null, 'Save Period Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
