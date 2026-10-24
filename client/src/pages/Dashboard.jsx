import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useHealthData } from '../contexts/HealthDataContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import DailyPulseBar from '../components/DailyPulseBar.jsx';
import HealthAlertsBanner from '../components/HealthAlertsBanner.jsx';
import CyclePhaseWheel from '../components/CyclePhaseWheel.jsx';
import DoctorDossierModal from '../components/DoctorDossierModal.jsx';
import Icon from '../components/Icon.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { cycleData, reportData, appointments, goals } = useHealthData();
  const { t, formatDate } = useLanguage();
  const [dossierOpen, setDossierOpen] = useState(false);
  const [dossierSummary, setDossierSummary] = useState(null);

  const estimates = cycleData?.estimates;
  const cycleDay = estimates?.currentCycleDay || 14;
  const cycleLength = estimates?.averageCycleLength || user?.averageCycleLength || 28;
  const phase = estimates?.currentPhase || 'Ovulatory';

  const upcomingAppt = appointments?.find(a => a.status === 'upcoming') || appointments?.[0];

  const handleOpenDossier = async () => {
    try {
      const res = await fetch('/api/reports/doctor-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dhatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDossierSummary(data.summary);
      } else {
        // Fallback summary
        setDossierSummary({
          patientName: user?.name || 'Priya Sharma',
          birthYear: user?.birthYear || 1998,
          primaryConcern: user?.primaryConcern || 'Luteal phase fatigue & ferritin trend',
          menstrualStatus: `Regular (${cycleLength}d cycle)`,
          reportCount: reportData?.totalReports || 2,
          recentBiomarkerHighlights: [
            { name: 'Serum Ferritin', value: 18, unit: 'ng/mL', referenceRange: '12-150', status: 'low' },
            { name: 'Hemoglobin', value: 12.2, unit: 'g/dL', referenceRange: '12-15.5', status: 'normal' },
            { name: 'TSH', value: 2.1, unit: 'mIU/L', referenceRange: '0.4-4.2', status: 'optimal' }
          ],
          sbar: {
            situation: 'Patient presenting with recurring luteal fatigue and headaches.',
            background: `18-month downward trend in ferritin from 34 to 18 ng/mL despite normal TSH.`,
            assessmentReadyData: 'Symptoms correlate with late luteal hormonal drop.',
            clinicianInquiries: [
              'Evaluate serum ferritin drift in relation to heavy menses.',
              'Assess whether iron saturation and TIBC testing are indicated.'
            ]
          }
        });
      }
      setDossierOpen(true);
    } catch {
      setDossierOpen(true);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Personalized Greeting Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-rose">{t('dashboard.livingHealthStory', null, 'Living Health Story')}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {formatDate ? formatDate(new Date()) : new Date().toLocaleDateString()}
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--color-burgundy)' }}>
            {t('dashboard.welcome', null, 'Welcome back,')} {user?.name || 'Priya'} 🌸
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            {user?.primaryConcern ? `Focus: ${user.primaryConcern}` : t('dashboard.focus', null, 'Focus: Overall hormonal balance and wellness')}
          </p>
        </div>

        {/* Quick Actions Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={handleOpenDossier}
            className="btn btn-outline"
            style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem' }}
          >
            📋 {t('dashboard.viewDossier', null, '3-Min Doctor Dossier')}
          </button>
          <Link to="/app/assistant" className="btn btn-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem' }}>
            <Icon name="assistant" size={17} /> {t('dashboard.askAI', null, 'Ask Dhatri AI')}
          </Link>
        </div>
      </div>

      {/* 10-Second Daily Ambient Pulse */}
      <DailyPulseBar />

      {/* Personalized Health Monitoring and Alert System */}
      <HealthAlertsBanner onOpenDossier={handleOpenDossier} />

      {/* Main Grid: Biological Phase Wheel + Quick Actions + Today's Insight */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Cycle Phase Wheel */}
        <CyclePhaseWheel
          cycleDay={cycleDay}
          cycleLength={cycleLength}
          phase={phase}
          isMenstruating={user?.isMenstruating !== false}
        />

        {/* Today's Insight Card */}
        <div className="dhatri-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span className="pill-badge pill-sage" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Icon name="sparkles" size={14} /> {t('dashboard.activeObservation', null, "Today's Biological Insight")}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phase-Aware</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-burgundy)', marginBottom: '0.6rem' }}>
              Progesterone & Neuro-Vascular Resilience
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              During your <strong>{phase} Phase</strong>, your body temperature and metabolic demands slightly increase. If you experienced fatigue on cycle days 20–22 in previous months, ensure adequate electrolyte hydration and magnesium-rich evening meals.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Source: ACOG Endocrine Review</span>
            <Link to="/app/insights" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-rose)' }}>
              {t('dashboard.viewRecords', null, 'Explore Latent Patterns →')}
            </Link>
          </div>
        </div>

        {/* Quick Health Navigation Cards */}
        <div className="dhatri-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: '4px' }}>
            {t('dashboard.quickActions', null, 'Quick Logging & Actions')}
          </h4>

          <Link
            to="/app/cycle"
            className="dhatri-card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-accent-soft)',
              color: 'var(--text-primary)',
              textDecoration: 'none'
            }}
          >
            <div style={{ color: 'var(--color-primary-rose)' }}><Icon name="calendar" size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{t('trackCycle.recordPeriod', null, 'Log Period Flow')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Record bleed start or flow intensity</div>
            </div>
            <Icon name="chevron-right" size={16} color="var(--text-muted)" />
          </Link>

          <Link
            to="/app/symptoms"
            className="dhatri-card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-sage-soft)',
              color: 'var(--text-primary)',
              textDecoration: 'none'
            }}
          >
            <div style={{ color: 'var(--color-sage)' }}><Icon name="symptom" size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{t('symptoms.recordSignal', null, 'Record Symptom')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cramps, migraine, mood, skin</div>
            </div>
            <Icon name="chevron-right" size={16} color="var(--text-muted)" />
          </Link>

          <Link
            to="/app/reports"
            className="dhatri-card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              textDecoration: 'none'
            }}
          >
            <div style={{ color: 'var(--color-burgundy)' }}><Icon name="report" size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{t('reports.addDocument', null, 'Upload Lab Report')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PDF / photo of CBC, thyroid, hormones</div>
            </div>
            <Icon name="chevron-right" size={16} color="var(--text-muted)" />
          </Link>
        </div>
      </div>

      {/* Secondary Row: Upcoming Care & Goal Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Upcoming Appointment */}
        <div className="dhatri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--color-burgundy)' }}>{t('care.scheduledVisitsTitle', null, 'Upcoming Consultation')}</h4>
            <Link to="/app/care" style={{ fontSize: '0.82rem', color: 'var(--color-primary-rose)', fontWeight: 600 }}>
              {t('common.all', null, 'View All')}
            </Link>
          </div>

          {upcomingAppt ? (
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {upcomingAppt.providerName}
                </span>
                <span className="pill-badge pill-sage" style={{ fontSize: '0.72rem' }}>
                  {upcomingAppt.type === 'video_consultation' ? 'Video' : 'In-Person'}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-sage)', fontWeight: 600, marginBottom: '0.5rem' }}>
                {upcomingAppt.specialty}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                📅 {upcomingAppt.date} at {upcomingAppt.time} • {upcomingAppt.clinicName}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/app/care" className="btn btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                  Checklist & Questions ({upcomingAppt.questionsForDoctor?.length || 2})
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {t('care.noUpcoming', null, 'No upcoming appointments.')} <Link to="/app/care" style={{ color: 'var(--color-primary-rose)' }}>Schedule prep →</Link>
            </div>
          )}
        </div>

        {/* Goals & Habits */}
        <div className="dhatri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--color-burgundy)' }}>{t('goals.title', null, 'Daily Wellness Goals')}</h4>
            <Link to="/app/goals" style={{ fontSize: '0.82rem', color: 'var(--color-primary-rose)', fontWeight: 600 }}>
              {t('common.edit', null, 'Manage')}
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goals?.slice(0, 3).map((g) => (
              <div key={g._id || g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{g.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Streak: {g.streakDays} days • {g.currentValue}/{g.targetValue} {g.unit}
                  </div>
                </div>
                <span className={`pill-badge ${g.isCompleted ? 'pill-sage' : 'pill-rose'}`} style={{ fontSize: '0.72rem' }}>
                  {g.isCompleted ? 'Done' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Dossier Modal */}
      <DoctorDossierModal
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
        summary={dossierSummary}
      />
    </div>
  );
}
