import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import UrgentCareBanner from '../components/UrgentCareBanner';
import Icon from '../components/Icon';

const COMMON_SYMPTOMS = [
  { id: 'cramps', label: 'Pelvic Cramps', icon: 'zap', category: 'Physical' },
  { id: 'fatigue', label: 'Low Energy / Fatigue', icon: 'moon', category: 'Energy' },
  { id: 'migraine', label: 'Headache / Migraine', icon: 'activity', category: 'Neurological' },
  { id: 'bloating', label: 'Abdominal Bloating', icon: 'disc', category: 'Digestive' },
  { id: 'mood', label: 'Mood Shifts / Anxiety', icon: 'heart', category: 'Emotional' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', icon: 'circle', category: 'Physical' },
  { id: 'acne', label: 'Skin Flare-up / Acne', icon: 'sparkles', category: 'Skin' },
  { id: 'hot_flash', label: 'Temperature Fluctuation', icon: 'sun', category: 'Vasomotor' },
];

const CONTEXT_TAG_DEFS = [
  { key: 'workStress', label: 'High Work Stress' },
  { key: 'poorSleep', label: 'Poor Sleep (<6h)' },
  { key: 'caffeine', label: 'Caffeine (>2 cups)' },
  { key: 'workout', label: 'Intense Workout' },
  { key: 'skippedMeal', label: 'Skipped Meal' },
  { key: 'dehydrated', label: 'Dehydrated' },
  { key: 'travel', label: 'Travel / Jetlag' },
  { key: 'alcohol', label: 'Alcohol' },
];

export default function Symptoms() {
  const { symptoms, logSymptom, deleteSymptom, currentCyclePhase } = useHealthData();
  const { t, formatDate } = useLanguage();

  // Multi-symptom selection state
  const [selectedSymptoms, setSelectedSymptoms] = useState(['cramps']);
  
  // Independent configuration per symptom ID
  const [symptomConfigs, setSymptomConfigs] = useState({
    cramps: { severity: 3, duration: 'moderate', contextTags: [], notes: '' },
    fatigue: { severity: 2, duration: 'moderate', contextTags: [], notes: '' },
    migraine: { severity: 3, duration: 'fleeting', contextTags: [], notes: '' },
    bloating: { severity: 2, duration: 'moderate', contextTags: [], notes: '' },
    mood: { severity: 3, duration: 'all_day', contextTags: [], notes: '' },
    breast_tenderness: { severity: 2, duration: 'moderate', contextTags: [], notes: '' },
    acne: { severity: 2, duration: 'multi_day', contextTags: [], notes: '' },
    hot_flash: { severity: 3, duration: 'fleeting', contextTags: [], notes: '' },
  });

  // Track expanded cards in the configuration accordion
  const [expandedSymptoms, setExpandedSymptoms] = useState({ cramps: true });

  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Toggle symptom selection
  const handleToggleSymptom = (symId) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symId)) {
        const next = prev.filter((id) => id !== symId);
        return next;
      } else {
        // Auto-expand newly selected symptom
        setExpandedSymptoms((exp) => ({ ...exp, [symId]: true }));
        return [...prev, symId];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedSymptoms([]);
    setErrorMessage('');
  };

  // Toggle accordion card expansion
  const toggleExpand = (symId) => {
    setExpandedSymptoms((prev) => ({
      ...prev,
      [symId]: !prev[symId]
    }));
  };

  // Update specific field for a symptom
  const updateSymptomField = (symId, field, value) => {
    setSymptomConfigs((prev) => ({
      ...prev,
      [symId]: {
        ...(prev[symId] || { severity: 3, duration: 'moderate', contextTags: [], notes: '' }),
        [field]: value
      }
    }));
  };

  // Toggle context tag for a specific symptom
  const toggleSymptomTag = (symId, tagLabel) => {
    const current = symptomConfigs[symId]?.contextTags || [];
    const nextTags = current.includes(tagLabel)
      ? current.filter((t) => t !== tagLabel)
      : [...current, tagLabel];
    updateSymptomField(symId, 'contextTags', nextTags);
  };

  // Submit batch of selected symptoms
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (selectedSymptoms.length === 0) {
      setErrorMessage(t('symptoms.saveError', null, 'Please select at least one symptom to record.'));
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payloadSymptoms = selectedSymptoms.map((symId) => {
        const symDef = COMMON_SYMPTOMS.find((s) => s.id === symId) || { label: symId, category: 'Physical' };
        const cfg = symptomConfigs[symId] || { severity: 3, duration: 'moderate', contextTags: [], notes: '' };
        const durationHours =
          cfg.duration === 'fleeting' ? 1 : cfg.duration === 'all_day' ? 12 : cfg.duration === 'multi_day' ? 24 : 4;

        return {
          id: symId,
          name: symDef.label,
          category: symDef.id,
          severity: Number(cfg.severity),
          duration: cfg.duration,
          durationHours,
          contextTags: cfg.contextTags || [],
          notes: cfg.notes || '',
          date: logDate,
          cyclePhase: currentCyclePhase || 'unknown'
        };
      });

      const res = await logSymptom({
        date: logDate,
        cyclePhase: currentCyclePhase || 'unknown',
        symptoms: payloadSymptoms
      });

      if (res?.success) {
        setSuccessMessage(
          t('symptoms.saveSuccess', null, 'All selected symptoms successfully recorded and correlated with your health timeline.')
        );
        setErrorMessage('');
        // Reset selections
        setSelectedSymptoms([]);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(res?.message || 'Unable to save symptom entries. Please verify connection and try again.');
      }
    } catch (err) {
      console.error('Error submitting symptoms:', err);
      setErrorMessage('A network error occurred while submitting symptoms.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Insights calculation from user records
  const computeInsight = () => {
    if (!symptoms || symptoms.length === 0) {
      return {
        title: t('symptoms.insightTitle', null, 'Correlated Pattern Observation'),
        content: t('symptoms.noLogs', null, 'No symptoms recorded yet. Select symptoms above to start building your health pattern baseline.')
      };
    }
    if (symptoms.length < 3) {
      const recorded = symptoms.map((s) => s.name || s.category).join(', ');
      return {
        title: 'Initial Signal Intake Active',
        content: `You have recorded ${symptoms.length} symptom signal(s) (${recorded}). Continue logging through 1–2 cycles to uncover statistically meaningful correlations with sleep, nutrition, and phase transitions.`
      };
    }

    const freqMap = {};
    let totalSev = 0;
    const phaseMap = {};
    const tagMap = {};

    symptoms.forEach((s) => {
      const name = s.name || s.category || 'Symptom';
      freqMap[name] = (freqMap[name] || 0) + 1;
      totalSev += Number(s.severity || 2);
      const phase = s.cyclePhaseAtLog || s.cyclePhase || 'General';
      phaseMap[phase] = (phaseMap[phase] || 0) + 1;
      if (Array.isArray(s.contextTags)) {
        s.contextTags.forEach((t) => {
          tagMap[t] = (tagMap[t] || 0) + 1;
        });
      }
    });

    const topSymptom = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0][0];
    const avgSev = (totalSev / symptoms.length).toFixed(1);
    const topPhase = Object.entries(phaseMap).sort((a, b) => b[1] - a[1])[0][0];
    const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([tag]) => tag);

    const contextSnippet = topTags.length > 0 ? ` alongside context factors like "${topTags.join('" and "')}"` : '';

    return {
      title: t('symptoms.insightTitle', null, 'Correlated Pattern Observation'),
      content: `Across your ${symptoms.length} logged entries, your most frequent signal is "${topSymptom}" (average severity ${avgSev}/5), noted primarily during the ${topPhase} phase${contextSnippet}. Share this longitudinal frequency with your care team.`
    };
  };

  const dynamicInsight = computeInsight();

  const getSeverityBadgeClass = (sev) => {
    if (sev >= 4) return 'badge-burgundy';
    if (sev >= 3) return 'badge-rose';
    return 'badge-sage';
  };

  return (
    <div className="symptoms-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <UrgentCareBanner />

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-rose" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('symptoms.badge', null, 'Multi-Signal Symptom Journal')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>{t('symptoms.title', null, 'Log & Contextualize Symptoms')}</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px' }}>
            {t('symptoms.subtitle', null, 'Symptoms rarely happen in isolation. By logging severity alongside your cycle phase and lifestyle context, Dhatri identifies cross-system patterns over time.')}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-rose)' }}></div>
            <div style={{ fontSize: '0.88rem' }}>
              {t('symptoms.phaseLabel', null, 'Current Inferred Phase:')} <strong style={{ color: 'var(--color-burgundy)', textTransform: 'uppercase' }}>{currentCyclePhase || 'NOT SET'}</strong>
            </div>
          </div>
          <Link to="/app/trends" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}>
            📊 View Health Trends & Graphs →
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Form Card: Multi-selection and Individual Configuration */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="edit" size={20} color="var(--color-rose)" /> {t('symptoms.recordSignal', null, "Record Today's Signal")}
            </h2>
            {selectedSymptoms.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-rose" style={{ fontWeight: 600 }}>
                  {t('symptoms.selectedCount', { count: selectedSymptoms.length }, `${selectedSymptoms.length} symptoms selected`)}
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {t('symptoms.clearAll', null, 'Clear All')}
                </button>
              </div>
            )}
          </div>

          {successMessage && (
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-sage)', fontSize: '0.9rem' }}>
              ✓ {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(217, 83, 79, 0.15)', color: '#d9534f', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(217, 83, 79, 0.3)', fontSize: '0.9rem' }}>
              ⚠ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Step 1: Multi-Symptom Selection Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {t('symptoms.selectCommon', null, 'Select Common Symptom')}
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('symptoms.multiSelectPrompt', null, 'Select all symptoms experienced today (Multiple selection supported):')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' }}>
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.id);
                  const translatedLabel = t(`symptoms.commonList.${sym.id}`, null, sym.label);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      id={`symptom-toggle-${sym.id}`}
                      onClick={() => handleToggleSymptom(sym.id)}
                      aria-pressed={isSelected}
                      style={{
                        padding: '0.75rem 0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--control-active-border)' : '1px solid var(--border-card)',
                        background: isSelected ? 'var(--control-active-bg)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--control-active-text)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all var(--transition-fast)',
                        boxShadow: isSelected ? '0 2px 8px rgba(217, 111, 137, 0.2)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{isSelected ? '✓' : '+'}</span>
                      <span>{translatedLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shared Date Selection */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                {t('symptoms.dateOfOccurrence', null, 'Date of Occurrence')}
              </label>
              <input
                type="date"
                id="symptom-log-date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                style={{ width: '100%', maxWidth: '280px', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Step 2: Individual Configuration Per Selected Symptom */}
            {selectedSymptoms.length === 0 ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                <Icon name="activity" size={28} color="var(--color-rose)" />
                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  {t('symptoms.noSelectionPrompt', null, 'Click on one or more symptom buttons above to configure individual severity and duration.')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--color-burgundy)' }}>
                    {t('symptoms.individualDetailsHeading', null, 'Configure Individual Symptom Signals')}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedSymptoms.length} {selectedSymptoms.length === 1 ? 'symptom' : 'symptoms'} configured
                  </span>
                </div>

                {selectedSymptoms.map((symId) => {
                  const symDef = COMMON_SYMPTOMS.find((s) => s.id === symId) || { label: symId, category: 'Physical' };
                  const cfg = symptomConfigs[symId] || { severity: 3, duration: 'moderate', contextTags: [], notes: '' };
                  const isExpanded = !!expandedSymptoms[symId];
                  const translatedLabel = t(`symptoms.commonList.${symId}`, null, symDef.label);

                  return (
                    <div
                      key={symId}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--color-surface)',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleExpand(symId)}
                        style={{
                          padding: '0.85rem 1.25rem',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          userSelect: 'none',
                          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-rose)' }}></span>
                          <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>{translatedLabel}</strong>
                          <span className={`badge ${getSeverityBadgeClass(cfg.severity)}`} style={{ fontSize: '0.75rem' }}>
                            {t('symptoms.severityScore', null, 'Severity')}: {cfg.severity}/5
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSymptom(symId);
                            }}
                            title="Remove symptom"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              padding: '0.2rem 0.4rem'
                            }}
                          >
                            ✕
                          </button>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* Accordion Body: Independent Details */}
                      {isExpanded && (
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {/* Severity Slider */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                {t('symptoms.severityScore', null, 'Severity Score:')} <strong style={{ color: 'var(--color-burgundy)' }}>{cfg.severity} / 5</strong>
                              </label>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {t(`symptoms.severityLevels.${cfg.severity}`, null, cfg.severity === 1 ? 'Mild' : cfg.severity === 5 ? 'Severe' : 'Moderate')}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={cfg.severity}
                              onChange={(e) => updateSymptomField(symId, 'severity', Number(e.target.value))}
                              style={{ width: '100%', accentColor: 'var(--color-rose)', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              <span>1 (Mild)</span>
                              <span>2</span>
                              <span>3</span>
                              <span>4</span>
                              <span>5 (Severe)</span>
                            </div>
                          </div>

                          {/* Duration Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                              {t('symptoms.durationLabel', null, 'Duration')}
                            </label>
                            <select
                              value={cfg.duration}
                              onChange={(e) => updateSymptomField(symId, 'duration', e.target.value)}
                              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                            >
                              <option value="fleeting">{t('symptoms.durations.fleeting', null, 'Fleeting (< 1 hour)')}</option>
                              <option value="moderate">{t('symptoms.durations.moderate', null, 'Moderate (A few hours)')}</option>
                              <option value="all_day">{t('symptoms.durations.all_day', null, 'Persistent (Most of the day)')}</option>
                              <option value="multi_day">{t('symptoms.durations.multi_day', null, 'Continuous (Multi-day)')}</option>
                            </select>
                          </div>

                          {/* Context Factors */}
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                              {t('symptoms.contextFactors', null, 'Context Factors (Select all that applied)')}
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {CONTEXT_TAG_DEFS.map((tag) => {
                                const active = (cfg.contextTags || []).includes(tag.label);
                                const translatedTag = t(`symptoms.contextTagsList.${tag.key}`, null, tag.label);
                                return (
                                  <button
                                    type="button"
                                    key={tag.key}
                                    onClick={() => toggleSymptomTag(symId, tag.label)}
                                    style={{
                                      padding: '0.35rem 0.75rem',
                                      borderRadius: '20px',
                                      border: '1px solid',
                                      borderColor: active ? 'var(--color-sage)' : 'var(--border-card)',
                                      background: active ? 'var(--bg-sage-soft)' : 'var(--bg-secondary)',
                                      color: active ? 'var(--text-sage)' : 'var(--text-secondary)',
                                      fontSize: '0.78rem',
                                      fontWeight: active ? 600 : 500,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {active ? '✓ ' : '+ '}{translatedTag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Personal Notes */}
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                              {t('symptoms.personalNotes', null, 'Personal Notes & Observation')}
                            </label>
                            <textarea
                              rows="2"
                              value={cfg.notes}
                              onChange={(e) => updateSymptomField(symId, 'notes', e.target.value)}
                              placeholder={t('symptoms.personalNotesPlaceholder', null, 'E.g., Started around 3pm after back-to-back meetings. Took chamomile tea and warm compress.')}
                              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              id="save-symptoms-btn"
              className="btn btn-primary"
              disabled={isSubmitting || selectedSymptoms.length === 0}
              style={{ width: '100%', padding: '0.85rem', opacity: selectedSymptoms.length === 0 ? 0.6 : 1 }}
            >
              {isSubmitting
                ? t('symptoms.savingBtn', null, 'Recording Signals...')
                : `${t('symptoms.saveBtn', null, 'Save to Health Timeline')} (${selectedSymptoms.length})`}
            </button>
          </form>
        </div>

        {/* History & Correlations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="history" size={20} color="var(--color-rose)" /> {t('symptoms.recentLogsTitle', null, 'Recent Symptom Logs')} ({symptoms.length})
            </h2>

            {symptoms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p>{t('symptoms.noLogs', null, 'No symptoms recorded yet. Select symptoms above to start building your health pattern baseline.')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto' }}>
                {symptoms.map((item) => (
                  <div
                    key={item._id || item.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDate ? formatDate(item.date) : new Date(item.date).toLocaleDateString()} • Phase: <span style={{ textTransform: 'capitalize' }}>{item.cyclePhaseAtLog || item.cyclePhase || 'General'}</span>
                          {item.duration && ` • ${item.duration}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${getSeverityBadgeClass(item.severity)}`}>
                          Severity {item.severity}/5
                        </span>
                        <button
                          onClick={() => deleteSymptom(item._id || item.id)}
                          title="Delete entry"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </div>

                    {item.contextTags && item.contextTags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {item.contextTags.map((tag, idx) => (
                          <span key={idx} style={{ fontSize: '0.72rem', background: 'var(--color-surface)', padding: '0.15rem 0.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Intelligence Observation Box */}
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(217, 111, 137, 0.06)', border: '1px solid var(--color-soft-pink)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icon name="sparkles" size={18} color="var(--color-rose)" /> {dynamicInsight.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {dynamicInsight.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
