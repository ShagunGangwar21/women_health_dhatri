import React, { useState, useEffect, useMemo } from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import ClinicalAlertBanner from '../components/ClinicalAlertBanner';
import DoctorDossierModal from '../components/DoctorDossierModal';
import Icon from '../components/Icon';

const GRAPH_OPTIONS = [
  { id: 'health_vs_time', label: 'Health Metrics vs Time', icon: 'activity' },
  { id: 'symptom_severity_time', label: 'Symptom Severity vs Time', icon: 'zap' },
  { id: 'symptom_frequency_time', label: 'Symptom Frequency vs Time', icon: 'disc' },
  { id: 'cycle_trends', label: 'Menstrual Cycle Trends', icon: 'calendar' },
  { id: 'sleep_vs_energy', label: 'Sleep vs Energy', icon: 'moon' },
  { id: 'nutrition_water', label: 'Nutrition & Water Intake', icon: 'heart' },
  { id: 'mood_vs_energy', label: 'Mood & Energy Balance', icon: 'sparkles' },
  { id: 'custom_comparison', label: 'Custom Comparison', icon: 'journey' }
];

const METRIC_DEFINITIONS = {
  sleepHours: { label: 'Sleep Duration', unit: 'hrs', max: 12, min: 0, color: '#5A1E3C', type: 'hours' },
  energyLevel: { label: 'Energy Vitality', unit: '/5', max: 5, min: 1, color: '#C74E72', type: 'score' },
  hydrationGlasses: { label: 'Water Hydration', unit: 'glasses', max: 16, min: 0, color: '#4F725D', type: 'count' },
  nutritionScore: { label: 'Nutrition Balance', unit: '/5', max: 5, min: 1, color: '#D97706', type: 'score' },
  moodScore: { label: 'Mood Balance', unit: '/5', max: 5, min: 1, color: '#702B4C', type: 'score' },
  maxSymptomSeverity: { label: 'Peak Symptom Severity', unit: '/5', max: 5, min: 1, color: '#E53935', type: 'score' }
};

export default function HealthTrends() {
  const { fetchTrends, fetchDoctorSummary, saveDailyCheckIn, logSymptom, currentCyclePhase } = useHealthData();
  const { t, language, isHindi, formatDate } = useLanguage();

  // State filters
  const [selectedGraph, setSelectedGraph] = useState('health_vs_time');
  const [timeRange, setTimeRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [selectedSymptom, setSelectedSymptom] = useState('all');

  // Custom Comparison Selectors
  const [customMetricA, setCustomMetricA] = useState('sleepHours');
  const [customMetricB, setCustomMetricB] = useState('energyLevel');

  // Data fetching state
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor Dossier Modal state
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Quick Check-in modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInSleep, setCheckInSleep] = useState(7.5);
  const [checkInEnergy, setCheckInEnergy] = useState(3);
  const [checkInWater, setCheckInWater] = useState(7);
  const [checkInNutrition, setCheckInNutrition] = useState(4);
  const [checkInMood, setCheckInMood] = useState('grounded');
  const [checkInSymptom, setCheckInSymptom] = useState('');
  const [checkInSeverity, setCheckInSeverity] = useState(2);
  const [checkInSaving, setCheckInSaving] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');

  // Hover state for tooltip
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Load trends from backend
  const loadTrends = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { timeRange };
      if (timeRange === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      if (selectedSymptom !== 'all') {
        params.symptomFilter = selectedSymptom;
      }
      const data = await fetchTrends(params);
      if (data?.success) {
        setTrendsData(data);
      } else {
        setError(data?.message || 'Failed to load health trends.');
      }
    } catch (err) {
      setError('Network error loading trends.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [timeRange, customStart, customEnd, selectedSymptom]);

  const handleSaveCheckIn = async (e) => {
    e.preventDefault();
    setCheckInSaving(true);
    setCheckInMsg('');
    try {
      // 1. Save daily check-in
      await saveDailyCheckIn({
        date: checkInDate,
        sleepHours: Number(checkInSleep),
        energyLevel: Number(checkInEnergy),
        hydrationGlasses: Number(checkInWater),
        nutritionScore: Number(checkInNutrition),
        mood: checkInMood,
        moodScore: checkInMood === 'happy' ? 5 : checkInMood === 'grounded' || checkInMood === 'calm' ? 4 : 2
      });

      // 2. If symptom entered, log symptom with duplicate prevention
      if (checkInSymptom) {
        await logSymptom({
          date: checkInDate,
          category: checkInSymptom,
          name: checkInSymptom.replace('_', ' '),
          severity: Number(checkInSeverity),
          cyclePhase: currentCyclePhase
        });
      }

      setCheckInMsg('✓ Saved successfully! Updating trends...');
      setTimeout(() => {
        setShowCheckInModal(false);
        setCheckInMsg('');
        loadTrends();
      }, 1000);
    } catch (err) {
      setCheckInMsg('Failed to save check-in.');
    } finally {
      setCheckInSaving(false);
    }
  };

  const timeline = trendsData?.timeline || [];
  const insights = trendsData?.insights || {};
  const clinicalAlerts = trendsData?.clinicalAlerts || [];

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Decide which series to plot based on selectedGraph
  const seriesToPlot = useMemo(() => {
    switch (selectedGraph) {
      case 'health_vs_time':
        return [
          { key: 'sleepHours', label: 'Sleep (hrs)', color: '#5A1E3C', unit: 'h', max: 12 },
          { key: 'energyLevel', label: 'Energy (1-5)', color: '#C74E72', unit: '/5', max: 5 },
          { key: 'hydrationGlasses', label: 'Water (glasses)', color: '#4F725D', unit: 'gl', max: 15 },
          { key: 'nutritionScore', label: 'Nutrition (1-5)', color: '#D97706', unit: '/5', max: 5 }
        ];
      case 'symptom_severity_time':
        return [
          { key: 'maxSymptomSeverity', label: 'Peak Symptom Severity (1-5)', color: '#E53935', unit: '/5', max: 5 }
        ];
      case 'sleep_vs_energy':
        return [
          { key: 'sleepHours', label: 'Sleep (hrs)', color: '#5A1E3C', unit: 'h', max: 12 },
          { key: 'energyLevel', label: 'Energy (1-5)', color: '#C74E72', unit: '/5', max: 5 }
        ];
      case 'nutrition_water':
        return [
          { key: 'hydrationGlasses', label: 'Hydration (glasses)', color: '#4F725D', unit: 'glasses', max: 15 },
          { key: 'nutritionScore', label: 'Nutrition Score (1-5)', color: '#D97706', unit: '/5', max: 5 }
        ];
      case 'mood_vs_energy':
        return [
          { key: 'moodScore', label: 'Mood Score (1-5)', color: '#702B4C', unit: '/5', max: 5 },
          { key: 'energyLevel', label: 'Energy (1-5)', color: '#C74E72', unit: '/5', max: 5 }
        ];
      case 'custom_comparison':
        const defA = METRIC_DEFINITIONS[customMetricA] || METRIC_DEFINITIONS.sleepHours;
        const defB = METRIC_DEFINITIONS[customMetricB] || METRIC_DEFINITIONS.energyLevel;
        return [
          { key: customMetricA, label: defA.label, color: defA.color, unit: defA.unit, max: defA.max },
          { key: customMetricB, label: defB.label, color: defB.color, unit: defB.unit, max: defB.max }
        ];
      default:
        return [
          { key: 'sleepHours', label: 'Sleep', color: '#5A1E3C', unit: 'h', max: 12 },
          { key: 'energyLevel', label: 'Energy', color: '#C74E72', unit: '/5', max: 5 }
        ];
    }
  }, [selectedGraph, customMetricA, customMetricB]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span className="pill-badge pill-rose">📊 {language === 'hi' ? 'स्वास्थ्य रुझान' : 'Health Intelligence'}</span>
            <span className="pill-badge pill-sage">Longitudinal Trends</span>
          </div>
          <h1 style={{ color: 'var(--color-burgundy)', fontSize: '2rem', margin: 0 }}>
            {language === 'hi' ? 'मेरा स्वास्थ्य रुझान' : language === 'hinglish' ? 'My Health Trends & Graphs' : 'My Health Trends'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: '0.4rem 0 0', maxWidth: '640px' }}>
            {language === 'hi'
              ? 'अपने लक्षणों, नींद, पोषण और चक्र के बीच संबंध देखें और समय के साथ बदलाव समझें।'
              : 'Interactive visual intelligence connecting your daily symptoms, sleep, hydration, and cycle rhythm against your personal baseline.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            ✏️ {language === 'hi' ? 'आज का चेक-इन' : '+ Daily Check-In'}
          </button>
          <button
            onClick={() => setIsDossierOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            📋 {language === 'hi' ? 'डॉक्टर डोजियर' : 'Doctor Dossier'}
          </button>
        </div>
      </div>

      {/* Safety Alert Banner (Emergency, Doctor Consultation, Self-Care) */}
      <ClinicalAlertBanner
        alerts={clinicalAlerts}
        onOpenDossier={() => setIsDossierOpen(true)}
      />

      {/* Main Trends Visual Card */}
      <div className="dhatri-card" style={{ padding: '1.75rem', marginBottom: '2rem', boxShadow: 'var(--shadow-md)' }}>
        {/* Controls Bar 1: Graph Type Selector */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '0.5rem',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {GRAPH_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedGraph(opt.id)}
              className={selectedGraph === opt.id ? 'btn btn-primary' : 'btn btn-outline'}
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.84rem',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon name={opt.icon} size={14} />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Controls Bar 2: Filters, Time Range & Chart Mode */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Time Range Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '4px' }}>
              {language === 'hi' ? 'अवधि:' : 'Range:'}
            </span>
            {[
              { id: '7d', label: language === 'hi' ? '7 दिन' : 'Last 7 Days' },
              { id: '30d', label: language === 'hi' ? '30 दिन' : 'Last 30 Days' },
              { id: '90d', label: language === 'hi' ? '3 महीने' : 'Last 3 Months' },
              { id: 'custom', label: language === 'hi' ? 'कस्टम' : 'Custom Range' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: timeRange === r.id ? '1px solid var(--color-burgundy)' : '1px solid var(--border-subtle)',
                  backgroundColor: timeRange === r.id ? 'var(--color-blush-pink)' : 'transparent',
                  color: timeRange === r.id ? 'var(--color-burgundy)' : 'var(--text-secondary)'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle & Symptom Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {selectedGraph === 'symptom_severity_time' && (
              <select
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', minWidth: '160px' }}
              >
                <option value="all">All Symptoms</option>
                <option value="cramps">Pelvic Cramps</option>
                <option value="fatigue">Fatigue / Energy</option>
                <option value="headache">Headache / Migraine</option>
                <option value="bloating">Abdominal Bloating</option>
                <option value="mood_swings">Mood Shifts</option>
                <option value="breast_tenderness">Breast Tenderness</option>
                <option value="acne">Acne / Skin</option>
              </select>
            )}

            {/* Custom Metric Selectors */}
            {selectedGraph === 'custom_comparison' && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  value={customMetricA}
                  onChange={(e) => setCustomMetricA(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                >
                  {Object.keys(METRIC_DEFINITIONS).map(k => (
                    <option key={k} value={k}>{METRIC_DEFINITIONS[k].label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>vs</span>
                <select
                  value={customMetricB}
                  onChange={(e) => setCustomMetricB(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                >
                  {Object.keys(METRIC_DEFINITIONS).map(k => (
                    <option key={k} value={k}>{METRIC_DEFINITIONS[k].label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Line / Bar Switch */}
            <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <button
                onClick={() => setChartType('line')}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: chartType === 'line' ? 'var(--color-burgundy)' : 'var(--bg-primary)',
                  color: chartType === 'line' ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                📈 Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: chartType === 'bar' ? 'var(--color-burgundy)' : 'var(--bg-primary)',
                  color: chartType === 'bar' ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                📊 Bar
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Inputs if selected */}
        {timeRange === 'custom' && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1.25rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-accent-soft)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Start:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>End:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
              />
            </div>
          </div>
        )}

        {/* Missing Data & Data Origin Notice */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            📝 <strong>Data Type:</strong> User-Reported Living Health Observations (Not Clinical In-Lab Measurements)
          </div>
          <div>
            {trendsData && (
              <span>
                Logged: <strong>{trendsData.daysWithData} days</strong> | Missing entries: <strong>{trendsData.missingDaysCount} days</strong> (Missing days are marked as gaps, never assumed zero/healthy)
              </span>
            )}
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div style={{
          position: 'relative',
          width: '100%',
          overflowX: 'auto',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '1rem 0.5rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
              Loading interactive health intelligence chart...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-burgundy)' }}>
              {error}
            </div>
          ) : timeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              No timeline data found for this range. Click "Daily Check-In" to log today's health metrics!
            </div>
          ) : selectedGraph === 'symptom_frequency_time' ? (
            /* Symptom Frequency Bar Chart */
            <div style={{ padding: '1rem 1.5rem' }}>
              <h4 style={{ color: 'var(--color-burgundy)', fontSize: '0.98rem', marginBottom: '1rem' }}>
                Reported Days per Symptom (Filtered Window)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(trendsData?.symptomAnalysis || []).map((item, idx) => {
                  const maxPossibleDays = timeline.length || 30;
                  const pct = Math.min(100, Math.round((item.currentDays / maxPossibleDays) * 100));
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>
                          {item.label}
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: item.status === 'worsening' ? '#FFEBEE' : item.status === 'persistent' ? '#FFF3E0' : 'var(--bg-accent-soft)',
                            color: item.status === 'worsening' ? '#C62828' : item.status === 'persistent' ? '#E65100' : 'var(--color-burgundy)'
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        </span>
                        <span>
                          <strong>{item.currentDays} days</strong> ({pct}% of timeframe) | Avg Sev: <strong>{item.currentAvgSeverity || 'N/A'}/5</strong>
                        </span>
                      </div>
                      {/* Bar Fill */}
                      <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--border-subtle)', borderRadius: '7px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: item.status === 'worsening' ? '#E53935' : item.status === 'persistent' ? '#FB8C00' : 'var(--color-primary-rose)',
                          borderRadius: '7px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {item.summaryText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Responsive SVG Chart (Line or Bar) */
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: '100%', height: 'auto', maxHeight: '360px', display: 'block' }}
            >
              {/* Y-Axis Grid Lines & Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding.top + chartH * (1 - pct);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartW}
                      y2={y}
                      stroke="var(--border-subtle)"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="var(--text-muted)"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {pct === 1 ? 'Peak' : pct === 0.5 ? 'Mid' : pct === 0 ? 'Min' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Cycle Phase Shading Strips along the bottom of the chart */}
              {timeline.map((point, idx) => {
                if (point.cyclePhase !== 'menstrual' && point.cyclePhase !== 'luteal') return null;
                const x = padding.left + (idx / Math.max(1, timeline.length - 1)) * chartW;
                const stepW = chartW / Math.max(1, timeline.length);
                return (
                  <rect
                    key={idx}
                    x={x - stepW / 2}
                    y={padding.top}
                    width={stepW}
                    height={chartH}
                    fill={point.cyclePhase === 'menstrual' ? 'rgba(217, 78, 116, 0.12)' : 'rgba(112, 43, 76, 0.05)'}
                  />
                );
              })}

              {/* Series Curves / Bars */}
              {seriesToPlot.map(series => {
                const maxVal = series.max || 10;
                const coords = timeline.map((pt, idx) => {
                  const val = pt[series.key];
                  const x = padding.left + (idx / Math.max(1, timeline.length - 1)) * chartW;
                  if (val === null || val === undefined) {
                    return { x, y: null, val: null, date: pt.date, point: pt };
                  }
                  const y = padding.top + chartH * (1 - Math.min(1, Math.max(0, val / maxVal)));
                  return { x, y, val, date: pt.date, point: pt };
                });

                if (chartType === 'bar') {
                  const barW = Math.max(4, (chartW / timeline.length) * 0.4);
                  return (
                    <g key={series.key}>
                      {coords.map((c, i) => {
                        if (c.y === null) return null;
                        return (
                          <rect
                            key={i}
                            x={c.x - barW / 2}
                            y={c.y}
                            width={barW}
                            height={chartH - (c.y - padding.top)}
                            fill={series.color}
                            opacity={0.85}
                            rx={2}
                            onMouseEnter={() => setHoveredPoint({ ...c, seriesName: series.label, unit: series.unit })}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ cursor: 'pointer' }}
                          />
                        );
                      })}
                    </g>
                  );
                }

                // Line Chart: Build path with gap support
                let pathD = '';
                let currentSubpath = '';
                coords.forEach((c) => {
                  if (c.y === null) {
                    if (currentSubpath) {
                      pathD += currentSubpath + ' ';
                      currentSubpath = '';
                    }
                  } else {
                    if (!currentSubpath) {
                      currentSubpath = `M ${c.x} ${c.y}`;
                    } else {
                      currentSubpath += ` L ${c.x} ${c.y}`;
                    }
                  }
                });
                if (currentSubpath) pathD += currentSubpath;

                return (
                  <g key={series.key}>
                    {/* The Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={series.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Dots on Data Points */}
                    {coords.map((c, i) => {
                      if (c.y === null) {
                        // Empty Marker for Missing Data
                        return (
                          <circle
                            key={i}
                            cx={c.x}
                            cy={padding.top + chartH}
                            r={3}
                            fill="none"
                            stroke="var(--text-muted)"
                            strokeDasharray="2 2"
                            strokeWidth="1.2"
                            onMouseEnter={() => setHoveredPoint({ ...c, isMissing: true, seriesName: series.label })}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ cursor: 'pointer' }}
                          />
                        );
                      }
                      return (
                        <circle
                          key={i}
                          cx={c.x}
                          cy={c.y}
                          r={hoveredPoint?.date === c.date && hoveredPoint?.seriesName === series.label ? 6 : 4}
                          fill={series.color}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          onMouseEnter={() => setHoveredPoint({ ...c, seriesName: series.label, unit: series.unit })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* X-Axis Date Ticks */}
              {timeline.map((point, idx) => {
                const interval = Math.max(1, Math.floor(timeline.length / 6));
                if (idx % interval !== 0 && idx !== timeline.length - 1) return null;
                const x = padding.left + (idx / Math.max(1, timeline.length - 1)) * chartW;
                const dateLabel = point.date.slice(5); // MM-DD
                return (
                  <g key={idx}>
                    <line x1={x} y1={padding.top + chartH} x2={x} y2={padding.top + chartH + 5} stroke="var(--border-card)" />
                    <text
                      x={x}
                      y={padding.top + chartH + 18}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {dateLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.9rem',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.82rem',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <div style={{ fontWeight: 700, color: 'var(--color-burgundy)', marginBottom: '2px' }}>
                📅 {hoveredPoint.date}
                {hoveredPoint.point?.cyclePhase && hoveredPoint.point.cyclePhase !== 'none' && (
                  <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: 'var(--color-primary-rose)' }}>
                    ({hoveredPoint.point.cyclePhase})
                  </span>
                )}
              </div>
              {hoveredPoint.isMissing ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No entry logged for this day. (Not assumed healthy)
                </div>
              ) : (
                <div>
                  <strong>{hoveredPoint.seriesName}:</strong> {hoveredPoint.val} {hoveredPoint.unit}
                  {hoveredPoint.point?.notes && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Notes: "{hoveredPoint.point.notes}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          {seriesToPlot.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '12px', height: '8px', border: '1px dashed var(--text-muted)' }} />
            <span>Missing Data Indicator</span>
          </div>
        </div>
      </div>

      {/* Summary Insights Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--color-burgundy)', fontSize: '1.25rem', marginBottom: '1rem' }}>
          💡 {language === 'hi' ? 'स्वास्थ्य विश्लेषण व रुझान' : 'Automated Health Insights & Trajectory'}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {/* Sleep Insight */}
          {insights.sleep && (
            <div className="dhatri-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-burgundy)', fontSize: '0.92rem' }}>
                  🌙 Sleep Trajectory
                </span>
                <span className={`pill-badge ${insights.sleep.direction === 'decreasing' ? 'pill-rose' : 'pill-sage'}`} style={{ fontSize: '0.72rem' }}>
                  {insights.sleep.direction.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {insights.sleep.insightText}
              </p>
            </div>
          )}

          {/* Energy Insight */}
          {insights.energy && (
            <div className="dhatri-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-burgundy)', fontSize: '0.92rem' }}>
                  ⚡ Vitality & Energy
                </span>
                <span className={`pill-badge ${insights.energy.direction === 'decreasing' ? 'pill-rose' : 'pill-sage'}`} style={{ fontSize: '0.72rem' }}>
                  {insights.energy.direction.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {insights.energy.insightText}
              </p>
            </div>
          )}

          {/* Hydration Insight */}
          {insights.hydration && (
            <div className="dhatri-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-burgundy)', fontSize: '0.92rem' }}>
                  💧 Hydration Balance
                </span>
                <span className="pill-badge pill-sage" style={{ fontSize: '0.72rem' }}>
                  {insights.hydration.direction.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {insights.hydration.insightText}
              </p>
            </div>
          )}

          {/* Peak Symptom Severity Insight */}
          {insights.symptomSeverity && (
            <div className="dhatri-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-burgundy)', fontSize: '0.92rem' }}>
                  🎯 Symptom Intensity
                </span>
                <span className={`pill-badge ${insights.symptomSeverity.direction === 'increasing' ? 'pill-rose' : 'pill-sage'}`} style={{ fontSize: '0.72rem' }}>
                  {insights.symptomSeverity.direction.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {insights.symptomSeverity.insightText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Daily Check-In Modal */}
      {showCheckInModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(3px)'
        }}>
          <div className="dhatri-card" style={{ maxWidth: '540px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-burgundy)', fontSize: '1.25rem' }}>
                ✏️ Daily Symptom & Wellness Check-In
              </h3>
              <button onClick={() => setShowCheckInModal(false)} className="btn-icon">✕</button>
            </div>

            {checkInMsg && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: checkInMsg.includes('✓') ? 'var(--color-sage-soft)' : 'var(--bg-accent-soft)',
                color: checkInMsg.includes('✓') ? 'var(--color-sage)' : 'var(--color-burgundy)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                marginBottom: '1rem'
              }}>
                {checkInMsg}
              </div>
            )}

            <form onSubmit={handleSaveCheckIn}>
              <div className="form-group">
                <label className="form-label">Check-In Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="18"
                    value={checkInSleep}
                    onChange={(e) => setCheckInSleep(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Energy Level (1–5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={checkInEnergy}
                    onChange={(e) => setCheckInEnergy(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Hydration (glasses)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={checkInWater}
                    onChange={(e) => setCheckInWater(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Nutrition Nourishment (1–5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={checkInNutrition}
                    onChange={(e) => setCheckInNutrition(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mood State</label>
                <select
                  value={checkInMood}
                  onChange={(e) => setCheckInMood(e.target.value)}
                  className="form-select"
                >
                  <option value="grounded">Grounded & Centered</option>
                  <option value="happy">Happy & Energetic</option>
                  <option value="calm">Calm & Restful</option>
                  <option value="drained">Drained / Fatigued</option>
                  <option value="anxious">Anxious / Overwhelmed</option>
                  <option value="irritable">Irritable / Sensitive</option>
                  <option value="sad">Low / Emotional</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--color-burgundy)', margin: '0 0 0.75rem' }}>
                  Optional: Log Symptom for this Date
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Symptom</label>
                    <select
                      value={checkInSymptom}
                      onChange={(e) => setCheckInSymptom(e.target.value)}
                      className="form-select"
                    >
                      <option value="">(None / No symptoms)</option>
                      <option value="cramps">Pelvic Cramps</option>
                      <option value="fatigue">Low Energy / Fatigue</option>
                      <option value="headache">Headache / Migraine</option>
                      <option value="bloating">Abdominal Bloating</option>
                      <option value="mood_swings">Mood Shifts</option>
                      <option value="breast_tenderness">Breast Tenderness</option>
                      <option value="acne">Skin Flare-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Severity (1–5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={checkInSeverity}
                      onChange={(e) => setCheckInSeverity(e.target.value)}
                      disabled={!checkInSymptom}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkInSaving}
                  className="btn btn-primary"
                >
                  {checkInSaving ? 'Recording...' : 'Save Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Dossier Modal */}
      <DoctorDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onFetchDossier={fetchDoctorSummary}
      />
    </div>
  );
}
