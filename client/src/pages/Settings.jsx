import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateHealthReportPdf } from '../utils/healthReportPdfGenerator';
import Icon from '../components/Icon';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { cycles, symptoms, reports, goals, appointments, dailyData, alerts } = useHealthData();
  const { user } = useAuth();
  const { language, setLanguage, t, isHindi } = useLanguage();

  const [aiConsent, setAiConsent] = useState(true);
  const [reportOcrConsent, setReportOcrConsent] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [savedNotice, setSavedNotice] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportNotice, setExportNotice] = useState('');
  const [exportError, setExportError] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedNotice(t('settings.savedNotice', {}, 'Preferences saved successfully.'));
    setTimeout(() => setSavedNotice(''), 4000);
  };

  // Feature 1: Complete Health Archive Export (JSON)
  const handleExportJson = () => {
    try {
      setExportError('');
      const exportBundle = {
        schemaVersion: '2.0',
        exportTimestamp: new Date().toISOString(),
        platform: 'Dhatri (धात्री) — Women\'s Health Intelligence Platform',
        user: {
          id: user?._id || user?.id,
          name: user?.name,
          email: user?.email,
          birthYear: user?.birthYear || 2000,
          biologicalSeason: user?.biologicalSeason || 'regulating_exploring',
          primaryConcern: user?.primaryConcern || 'Overall hormonal balance and wellness',
          cycleRegularity: user?.cycleRegularity || 'regular',
          averageCycleLength: user?.averageCycleLength || 28,
          averagePeriodDuration: user?.averagePeriodDuration || 5,
          theme,
          language
        },
        cycleSettingsAndHistory: {
          isMenstruating: user?.isMenstruating !== false,
          averageCycleLength: user?.averageCycleLength || 28,
          averagePeriodDuration: user?.averagePeriodDuration || 5,
          cycles: cycles || []
        },
        symptomRecords: (symptoms || []).map(s => ({
          id: s._id || s.id,
          date: s.date,
          name: s.name,
          category: s.category,
          severity: s.severity,
          duration: s.duration,
          durationHours: s.durationHours,
          cyclePhase: s.cyclePhase || s.cyclePhaseAtLog,
          contextFactors: s.contextTags || [],
          notes: s.notes || '',
          recordedAt: s.createdAt
        })),
        clinicalDocumentsAndBiomarkers: (reports || []).map(r => ({
          id: r._id || r.id,
          title: r.title,
          category: r.category,
          date: r.date || r.reportDate,
          laboratoryCenter: r.labName || r.laboratory,
          biomarkers: r.biomarkers || [],
          ocrExtracted: r.ocrExtracted || false
        })),
        goalsAndLifestyleLogs: {
          goals: goals || [],
          dailyAmbientCheckIns: dailyData?.logs || [],
          todayLog: dailyData?.todayLog || null,
          ambientAverages: dailyData?.stats || { avgSleep: 7, avgEnergy: 3, avgWater: 6 }
        },
        appointments: (appointments || []).map(a => ({
          id: a._id || a.id,
          providerName: a.providerName,
          specialty: a.specialty,
          clinicName: a.clinicName,
          date: a.date,
          time: a.time,
          status: a.status,
          visitReason: a.visitReason || a.reason,
          questionsForDoctor: a.questionsForDoctor || [],
          prepChecklist: a.prepChecklist || []
        })),
        healthInsightsAndObservations: alerts || []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `dhatri_health_archive_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportNotice(isHindi ? 'हेल्थ आर्काइव (JSON) सफलतापूर्वक डाउनलोड हो गया।' : 'Complete Health Archive (JSON) downloaded successfully.');
      setTimeout(() => setExportNotice(''), 4500);
    } catch (err) {
      console.error('JSON export error:', err);
      setExportError(isHindi ? 'JSON एक्सपोर्ट करने में विफल। पुनः प्रयास करें।' : 'Failed to export JSON archive.');
      setTimeout(() => setExportError(''), 4500);
    }
  };

  // Feature 1: Complete Health Report Export (PDF)
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      setExportError('');
      setExportNotice('');

      const exportBundle = {
        user: {
          name: user?.name,
          email: user?.email,
          birthYear: user?.birthYear,
          biologicalSeason: user?.biologicalSeason,
          primaryConcern: user?.primaryConcern
        },
        cycles: cycles || [],
        symptoms: symptoms || [],
        reports: reports || [],
        appointments: appointments || [],
        goals: goals || []
      };

      const filename = await generateHealthReportPdf(exportBundle, language);
      setExportNotice(isHindi ? `हेल्थ रिपोर्ट PDF (${filename}) सफलतापूर्वक तैयार हो गई।` : `Health Report PDF (${filename}) generated and downloaded.`);
      setTimeout(() => setExportNotice(''), 5000);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportError(isHindi ? 'PDF तैयार करने में समस्या आई। पुनः प्रयास करें।' : 'Failed to generate PDF health report.');
      setTimeout(() => setExportError(''), 5000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="settings-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('settings.badge', {}, 'System & Privacy Configuration')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>
            {t('settings.title', {}, 'Application Settings')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px' }}>
            {t('settings.subtitle', {}, 'Control your visual interface, privacy parameters, language orientation, and data portability.')}
          </p>
        </div>
      </div>

      {savedNotice && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-sage)', fontSize: '0.9rem' }}>
          ✓ {savedNotice}
        </div>
      )}

      {exportNotice && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--text-sage)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-sage)', fontSize: '0.9rem' }}>
          ✓ {exportNotice}
        </div>
      )}

      {exportError && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(217, 83, 79, 0.15)', color: 'var(--color-primary-rose)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary-rose)', fontSize: '0.9rem' }}>
          ⚠️ {exportError}
        </div>
      )}

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Appearance Settings */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
            <Icon name="sun" size={20} color="var(--color-rose)" /> {t('settings.appearanceTitle', {}, 'Appearance & Theme Mode')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              id="theme-light-card"
              onClick={() => setTheme('light')}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: theme === 'light' ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>☀️</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{t('settings.lightMode', {}, 'Light Mode')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('settings.lightModeDesc', {}, 'Warm cream, blush pink, botanical sage')}</div>
            </div>

            <div
              id="theme-dark-card"
              onClick={() => setTheme('dark')}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: theme === 'dark' ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌙</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{t('settings.darkMode', {}, 'Dark Mode')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('settings.darkModeDesc', {}, 'Deep plum (#191317), charcoal, muted rose')}</div>
            </div>

            <div
              id="theme-system-card"
              onClick={() => {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(systemDark ? 'dark' : 'light');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💻</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{t('settings.systemAuto', {}, 'System Auto')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('settings.systemAutoDesc', {}, 'Synchronize with operating system')}</div>
            </div>
          </div>
        </div>

        {/* Feature 2: Complete Language & Communication Localisation */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
            <Icon name="globe" size={20} color="var(--color-rose)" /> {t('settings.languageTitle', {}, 'Language & Communication')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <label
              id="lang-option-en"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '1.1rem',
                borderRadius: 'var(--radius-md)',
                border: language === 'en' ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                background: language === 'en' ? 'var(--control-hover-bg)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <input
                type="radio"
                name="appLanguage"
                value="en"
                checked={language === 'en'}
                onChange={() => setLanguage('en')}
                style={{ accentColor: 'var(--color-primary-rose)', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  {t('settings.langEnglish', {}, 'English (Standard)')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t('settings.langEnglishDesc', {}, 'Clinical and educational terms in English')}
                </div>
              </div>
            </label>

            <label
              id="lang-option-hi"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '1.1rem',
                borderRadius: 'var(--radius-md)',
                border: language === 'hi' ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                background: language === 'hi' ? 'var(--control-hover-bg)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <input
                type="radio"
                name="appLanguage"
                value="hi"
                checked={language === 'hi'}
                onChange={() => setLanguage('hi')}
                style={{ accentColor: 'var(--color-primary-rose)', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  {t('settings.langHindi', {}, 'Hindi (हिंदी - देवनागरी लिपि)')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t('settings.langHindiDesc', {}, 'शुद्ध एवं सहज हिंदी संवाद (देवनागरी लिपि)')}
                </div>
              </div>
            </label>

            <label
              id="lang-option-hinglish"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '1.1rem',
                borderRadius: 'var(--radius-md)',
                border: language === 'hinglish' ? '2px solid var(--color-primary-rose)' : '1px solid var(--border-card)',
                background: language === 'hinglish' ? 'var(--control-hover-bg)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <input
                type="radio"
                name="appLanguage"
                value="hinglish"
                checked={language === 'hinglish'}
                onChange={() => setLanguage('hinglish')}
                style={{ accentColor: 'var(--color-primary-rose)', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  {t('settings.langHinglish', {}, 'Hinglish (मिक्स हिंदी-English - रोमन लिपि)')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t('settings.langHinglishDesc', {}, 'दैनिक बोलचाल की सहज हिंदी और अंग्रेज़ी का मिश्रण')}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Privacy & Clinical Consent */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
            <Icon name="shield" size={20} color="var(--color-deep-green)" /> {t('settings.privacyTitle', {}, 'Privacy & Consent Governance')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                style={{ accentColor: 'var(--color-deep-green)', width: '18px', height: '18px', marginTop: '0.2rem' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {t('settings.aiConsentTitle', {}, 'Authorize AI Health Intelligence Synthesis')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('settings.aiConsentDesc', {}, "Allows Dhatri's server-side LLM to formulate cross-system pattern correlations and prepare doctor consultation questions. No identifiable personal names are ever transmitted.")}
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={reportOcrConsent}
                onChange={(e) => setReportOcrConsent(e.target.checked)}
                style={{ accentColor: 'var(--color-deep-green)', width: '18px', height: '18px', marginTop: '0.2rem' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {t('settings.ocrConsentTitle', {}, 'Biomarker Digitization & Trend Parsing')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('settings.ocrConsentDesc', {}, 'Extract numeric values from uploaded lab reports (Ferritin, TSH, Hb) into longitudinal trajectory charts.')}
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={(e) => setDailyReminders(e.target.checked)}
                style={{ accentColor: 'var(--color-deep-green)', width: '18px', height: '18px', marginTop: '0.2rem' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {t('settings.remindersTitle', {}, 'Gentle Evening Wellness Pulse')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('settings.remindersDesc', {}, 'Optional 10-second prompt to record hydration, sleep quality, and daily energy before bed.')}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Feature 1: Complete Health Archive Export — PDF + JSON */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
            <Icon name="download" size={20} color="var(--color-rose)" /> {t('settings.dataPortabilityTitle', {}, 'Data Sovereignty & Portability')}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {t('settings.dataPortabilityDesc', {}, "Under Dhatri's privacy guarantee, your complete medical history belongs solely to you. You can export your full records in standard JSON or generate a multi-page clinical health PDF at any time.")}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button
              id="export-json-btn"
              type="button"
              onClick={handleExportJson}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.4rem' }}
            >
              <Icon name="download" size={17} />
              {t('settings.exportJsonBtn', {}, 'Export Health Archive (JSON)')}
            </button>

            <button
              id="export-pdf-btn"
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem' }}
            >
              <Icon name="file" size={17} />
              {isExportingPdf ? (isHindi ? 'PDF तैयार हो रहा है...' : 'Generating PDF...') : t('settings.downloadPdfBtn', {}, 'Download Health Report (PDF)')}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem' }}
          >
            {t('settings.saveAllPreferences', {}, 'Save All Preferences')}
          </button>
        </div>
      </form>
    </div>
  );
}
