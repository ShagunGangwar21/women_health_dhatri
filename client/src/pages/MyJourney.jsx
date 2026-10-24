import React from 'react';
import { useHealthData } from '../contexts/HealthDataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Icon from '../components/Icon.jsx';

export default function MyJourney() {
  const { user } = useAuth();
  const { cycleData, symptoms, reportData, dailyData } = useHealthData();
  const { t, formatDate, isHindi } = useLanguage();

  // Combine logs into a unified longitudinal timeline
  const timelineEvents = [];

  // Add reports
  reportData?.reports?.forEach(r => {
    timelineEvents.push({
      date: r.date,
      type: 'report',
      title: r.title,
      badge: r.category,
      desc: r.biomarkers?.map(b => `${b.name}: ${b.value} ${b.unit}`).join(' • ') || 'Diagnostic report indexed',
      icon: 'report'
    });
  });

  // Add cycle start dates
  cycleData?.cycleLogs?.forEach(c => {
    timelineEvents.push({
      date: c.startDate,
      type: 'cycle',
      title: isHindi ? `पीरियड प्रवाह (${c.flowIntensity})` : `Menstrual Cycle Start (Flow: ${c.flowIntensity})`,
      badge: `${isHindi ? 'दर्द स्तर' : 'Pain'}: ${c.painLevel}/10`,
      desc: c.notes || (isHindi ? 'माहवारी चक्र शुरू होने का रिकॉर्ड' : 'Recorded start of period bleed'),
      icon: 'calendar'
    });
  });

  // Add symptoms
  symptoms?.forEach(s => {
    timelineEvents.push({
      date: s.date,
      type: 'symptom',
      title: `${isHindi ? 'दर्ज लक्षण:' : 'Logged:'} ${(s.name || s.category || 'General').replace('_', ' ').toUpperCase()}`,
      badge: `Severity ${s.severity}/5 • ${s.cyclePhase} phase`,
      desc: s.notes || s.contextTags?.join(', ') || 'Recorded symptom',
      icon: 'symptom'
    });
  });

  // Sort chronologically descending
  timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="pill-badge pill-rose">{t('journey.biologicalSeason', null, 'Living Health Story')}</span>
        </div>
        <h1 style={{ fontSize: '1.9rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
          {t('journey.title', null, 'My Longitudinal Health Journey')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('journey.subtitle', null, "An unbroken timeline of your body's observations, lab events, and cyclical patterns across months and years.")}
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="dhatri-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {isHindi ? 'कुल ट्रैक किए गए चक्र' : 'Total Cycles Tracked'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-burgundy)', marginTop: '4px' }}>
            {cycleData?.cycleLogs?.length || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>Avg {user?.averageCycleLength || 28} days</div>
        </div>

        <div className="dhatri-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {isHindi ? 'कुल दर्ज लक्षण' : 'Recorded Symptoms'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary-rose)', marginTop: '4px' }}>
            {symptoms?.length || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{isHindi ? 'मल्टी-सिग्नल टाइमलाइन' : 'Across categories'}</div>
        </div>

        <div className="dhatri-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {isHindi ? 'डायग्नोस्टिक लैब रिपोर्ट्स' : 'Diagnostic Lab Panels'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-sage)', marginTop: '4px' }}>
            {reportData?.totalReports || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{isHindi ? 'बायोमार्कर्स ट्रैकिंग' : 'Over 18 months'}</div>
        </div>

        <div className="dhatri-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {isHindi ? 'दैनिक एम्बिएंट पल्स' : 'Daily Ambient Pulses'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-burgundy)', marginTop: '4px' }}>
            {dailyData?.logs?.length || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-sage)' }}>Avg sleep {dailyData?.stats?.avgSleep || 7}h</div>
        </div>
      </div>

      {/* Cross-Marker Longitudinal Synthesis Card */}
      <div className="dhatri-card" style={{ marginBottom: '2.5rem', backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid var(--color-burgundy)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🧬</span>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>
            {isHindi ? 'क्रॉस-सिस्टम स्वास्थ्य विश्लेषण' : 'Cross-System Latent Synthesis'}
          </h3>
        </div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {isHindi
            ? 'आपके सीरम फेरिटिन रुझान, ल्यूटियल फ़ेज़ के सिरदर्द और ऊर्जा के स्तर का एक साथ विश्लेषण करके धात्री ने पाया कि ये लक्षण अलग-थलग नहीं हैं, बल्कि हार्मोनल बदलावों और पोषण स्तर से जुड़े हैं।'
            : 'By synthesizing your Serum Ferritin drift alongside your late luteal headaches and subjective energy dips, Dhatri has identified a multi-system metabolic pattern rather than isolated fatigue.'}
        </p>
        <span className="pill-badge pill-rose" style={{ fontSize: '0.78rem' }}>
          {isHindi ? 'डॉक्टर डोज़ियर समीक्षा के लिए तैयार' : 'Ready for Physician Review in Doctor Dossier'}
        </span>
      </div>

      {/* The Longitudinal Timeline */}
      <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '1.5rem' }}>
        {t('journey.symptomTrajectory', null, 'Chronological Biological Timeline')}
      </h3>

      {timelineEvents.length === 0 ? (
        <div className="dhatri-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {isHindi ? 'आपकी स्वास्थ्य कहानी अभी शुरू हो रही है। चक्र दर्ज करें, लक्षण जोड़ें या लैब रिपोर्ट अपलोड करें।' : "Your Health Story is ready for its first chapter. Log a cycle, record a sensation, or upload a lab report to begin."}
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Vertical Timeline Track Line */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            backgroundColor: 'var(--border-card)'
          }} />

          {timelineEvents.map((evt, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Dot on Timeline */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '14px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: evt.type === 'report' ? 'var(--color-sage)' : evt.type === 'cycle' ? 'var(--color-primary-rose)' : 'var(--control-active-bg)',
                border: '1px solid var(--control-active-border)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Icon name={evt.icon} size={13} color="#FFFFFF" />
              </div>

              {/* Event Card */}
              <div className="dhatri-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    📅 {formatDate ? formatDate(evt.date) : evt.date}
                  </span>
                  <span className={`pill-badge ${evt.type === 'report' ? 'pill-sage' : evt.type === 'cycle' ? 'pill-rose' : ''}`} style={{ fontSize: '0.72rem' }}>
                    {evt.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {evt.title}
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {evt.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
