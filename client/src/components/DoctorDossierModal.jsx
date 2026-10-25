import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from './Icon';

export default function DoctorDossierModal({ isOpen, onClose, onFetchDossier }) {
  const { language, formatDate } = useLanguage();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      onFetchDossier()
        .then(res => {
          if (res?.dossier) setDossier(res.dossier);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, onFetchDossier]);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (!dossier) return;
    const text = [
      `=== DHATRI HEALTH SUMMARY — 3-MINUTE DOCTOR DOSSIER ===`,
      `Patient: ${dossier.patientInfo.name} | Biological Season: ${dossier.patientInfo.biologicalSeason}`,
      `Generated: ${new Date(dossier.generatedAt).toLocaleDateString()}`,
      `Cycle Status: ${dossier.cycleSummary.lastPeriodDate} | Flow: ${dossier.cycleSummary.flowIntensity} | Pain: ${dossier.cycleSummary.painLevel}`,
      ``,
      `--- PRIMARY COMPLAINTS & SYMPTOM TRENDS (Last 14 Days) ---`,
      ...(dossier.primaryComplaints.map(c => `• ${c.category}: Logged ${c.frequencyDays} days | Avg Severity: ${c.avgSeverity}/5 (Peak: ${c.maxSeverity}/5)${c.patientNotes.length ? ` | Notes: "${c.patientNotes.join(', ')}"` : ''}`)),
      ``,
      `--- LIFESTYLE & SLEEP CORRELATION ---`,
      `• Avg Sleep: ${dossier.lifestyleBaseline.averageSleepHours} hrs/night | Energy: ${dossier.lifestyleBaseline.averageEnergyLevel}`,
      ``,
      `--- CLINICAL SAFETY FLAGS ---`,
      ...(dossier.clinicalAlerts.map(a => `• [${a.level.toUpperCase()}]: ${a.trigger}`)),
      ``,
      `--- KEY BIOMARKERS (Diagnostic Reports) ---`,
      ...(dossier.biomarkers.map(b => `• ${b.name}: ${b.value} ${b.unit || ''} (Ref: ${b.referenceRange || 'N/A'}, Date: ${b.reportDate})`)),
      ``,
      `--- PATIENT ADVOCACY QUESTIONS ---`,
      ...(dossier.suggestedQuestionsForDoctor.map((q, i) => `${i + 1}. ${q}`)),
      ``,
      `DISCLAIMER: Self-reported longitudinal health history recorded via Dhatri. Not a formal diagnosis.`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="dhatri-card" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="pill-badge pill-rose">📋 Clinical Dossier</span>
              <span className="pill-badge pill-sage">SBAR Format</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--color-burgundy)', margin: '0.4rem 0 0' }}>
              3-Minute Doctor Consultation Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            Generating clinical summary dossier...
          </div>
        ) : !dossier ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Unable to generate doctor summary. Please ensure symptom logs are available.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Patient Header Block */}
            <div style={{
              backgroundColor: 'var(--bg-accent-soft)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.86rem'
            }}>
              <div><strong>Patient:</strong> {dossier.patientInfo.name}</div>
              <div><strong>Birth Year:</strong> {dossier.patientInfo.birthYear}</div>
              <div><strong>Cycle Phase:</strong> {dossier.cycleSummary.lastPeriodDate ? `Last: ${dossier.cycleSummary.lastPeriodDate}` : 'Tracking'}</div>
              <div><strong>Logged Signals:</strong> {dossier.patientInfo.totalSymptomsLogged} symptom logs</div>
            </div>

            {/* Primary Complaints */}
            <div>
              <h4 style={{ color: 'var(--color-burgundy)', fontSize: '0.98rem', marginBottom: '0.6rem' }}>
                1. Chief Complaints & Symptom Patterns (Past 14 Days)
              </h4>
              {dossier.primaryComplaints.length === 0 ? (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>No symptoms reported in the past 14 days.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dossier.primaryComplaints.map((c, i) => (
                    <div key={i} style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-primary)',
                      fontSize: '0.86rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-burgundy)' }}>
                        <span>{c.category}</span>
                        <span>Severity: {c.avgSeverity}/5 (Peak: {c.maxSeverity}/5)</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Reported across {c.frequencyDays} day(s) in the last 2 weeks.
                      </div>
                      {c.patientNotes.length > 0 && (
                        <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                          Patient notes: "{c.patientNotes.join('; ')}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lifestyle & Clinical Baseline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.9rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ margin: '0 0 0.5rem', color: 'var(--color-burgundy)' }}>🌙 Sleep & Energy Trajectory</h5>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.84rem' }}>
                  <strong>Average Sleep:</strong> {dossier.lifestyleBaseline.averageSleepHours} hrs/night
                </p>
                <p style={{ margin: 0, fontSize: '0.84rem' }}>
                  <strong>Energy Vitality:</strong> {dossier.lifestyleBaseline.averageEnergyLevel}
                </p>
              </div>

              <div style={{ padding: '0.9rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ margin: '0 0 0.5rem', color: 'var(--color-burgundy)' }}>🩸 Menstrual Rhythm Context</h5>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.84rem' }}>
                  <strong>Typical Flow:</strong> {dossier.cycleSummary.flowIntensity}
                </p>
                <p style={{ margin: 0, fontSize: '0.84rem' }}>
                  <strong>Pain Scale:</strong> {dossier.cycleSummary.painLevel}
                </p>
              </div>
            </div>

            {/* Key Biomarkers if available */}
            {dossier.biomarkers.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--color-burgundy)', fontSize: '0.98rem', marginBottom: '0.6rem' }}>
                  2. Diagnostic Biomarkers (User-Uploaded Lab Reports)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {dossier.biomarkers.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '0.5rem 0.8rem', backgroundColor: 'var(--bg-accent-soft)', borderRadius: 'var(--radius-sm)' }}>
                      <span><strong>{b.name}:</strong> {b.value} {b.unit}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Ref: {b.referenceRange || 'Standard'} ({b.reportDate})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Physician Questions */}
            <div>
              <h4 style={{ color: 'var(--color-burgundy)', fontSize: '0.98rem', marginBottom: '0.6rem' }}>
                3. Evidence-Based Discussion Points for Consultation
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {dossier.suggestedQuestionsForDoctor.map((q, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>{q}</li>
                ))}
              </ol>
            </div>

            {/* Privacy & Legal Disclaimer */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-sage)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}>
              🔒 <strong>Privacy & Clinical Disclaimer:</strong> {dossier.legalDisclaimer} Dhatri never sends your health data to third parties without your explicit authorization.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCopyText}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Text (SBAR)'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
              >
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
