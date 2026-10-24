import React from 'react';
import Icon from './Icon.jsx';

export default function DoctorDossierModal({ isOpen, onClose, summary }) {
  if (!isOpen || !summary) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column'
      }} className="animate-fade-in">
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <h3 style={{ fontSize: '1.2rem' }}>Dhatri 3-Minute Clinical Consultation Dossier</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
              <Icon name="print" size={16} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div style={{ padding: '2rem 2.5rem', color: 'var(--text-primary)' }} id="printable-dossier">
          {/* Header */}
          <div style={{ borderBottom: '2px solid var(--color-primary-rose)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--color-burgundy)', fontFamily: 'var(--font-serif)' }}>
                Longitudinal Health Summary for Clinical Consultation
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Compiled via Dhatri (धात्री) Health Intelligence Platform • Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="pill-badge pill-rose">Physician SBAR Format</span>
            </div>
          </div>

          {/* Patient Demographics & Baseline */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem'
          }}>
            <div><strong>Patient Name:</strong> {summary.patientName}</div>
            <div><strong>Birth Year:</strong> {summary.birthYear}</div>
            <div><strong>Menstrual Status:</strong> {summary.menstrualStatus}</div>
            <div><strong>Total Reports Indexed:</strong> {summary.reportCount}</div>
          </div>

          {/* SBAR Section 1: Situation */}
          <div style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '6px' }}>
              1. Situation (Chief Context)
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {summary.sbar?.situation}
            </p>
          </div>

          {/* SBAR Section 2: Background */}
          <div style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '6px' }}>
              2. Background & Longitudinal Baseline
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {summary.sbar?.background}
            </p>
          </div>

          {/* SBAR Section 3: Assessment-Ready Biomarkers */}
          <div style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '8px' }}>
              3. Objective Biomarker Trajectory
            </h4>
            {summary.recentBiomarkerHighlights && summary.recentBiomarkerHighlights.length > 0 ? (
              <div style={{ border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Biomarker</th>
                      <th style={{ padding: '8px 12px' }}>Value</th>
                      <th style={{ padding: '8px 12px' }}>Lab Reference</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentBiomarkerHighlights.map((bio, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{bio.name}</td>
                        <td style={{ padding: '8px 12px' }}>{bio.value} {bio.unit}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{bio.referenceRange || 'Standard'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span className={`pill-badge ${bio.status === 'low' || bio.status === 'high' ? 'pill-rose' : 'pill-sage'}`} style={{ fontSize: '0.72rem' }}>
                            {bio.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No lab biomarkers recorded yet.</p>
            )}
          </div>

          {/* SBAR Section 4: Clinician Inquiries */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '8px' }}>
              4. Evidence-Grounded Consultation Questions
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {summary.sbar?.clinicianInquiries?.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Educational Disclaimer */}
          <div style={{
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '1rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            lineHeight: 1.45
          }}>
            <strong>Physician Notice:</strong> This dossier was compiled by Dhatri from patient-authorized records to accelerate clinical intake. It does not provide medical diagnosis, clinical judgment, or therapeutic advice. All decisions remain with the treating physician.
          </div>
        </div>
      </div>
    </div>
  );
}
