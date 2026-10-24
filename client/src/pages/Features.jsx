import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function Features() {
  const featuresList = [
    {
      title: 'Bi-Temporal Rhythm Engine',
      category: 'Biological Grounding',
      icon: 'calendar',
      description: 'Maps symptoms, reports, and energy to two simultaneous clocks: Calendar Time (e.g. October 2024 vs. 2026) and Biological Phase Time (e.g. Luteal Day 21 vs. Follicular Day 6). Projections are clearly marked as mathematical estimates.'
    },
    {
      title: 'Multimodal Health Capture',
      category: 'Zero Friction',
      icon: 'sparkles',
      description: 'Capture micro-voice observations, photos of blood panels, or 10-second sensory check-ins. No 40-question questionnaires or punitive logging streaks.'
    },
    {
      title: 'Longitudinal Lab Memory',
      category: 'Diagnostic Clarity',
      icon: 'file-text',
      description: 'Normalizes and stores laboratory biomarkers across years. Tracks subtle multi-month drifts in Ferritin, TSH, Vitamin D, and Hemoglobin that single-visit clinical charts miss.'
    },
    {
      title: 'AI Wellness Companion (English & Hindi)',
      category: 'Intelligent Education',
      icon: 'chat',
      description: 'Explains medical jargon in plain language or Hinglish, summarizes authorized symptom notes, and answers health questions with strict medical safety guardrails.'
    },
    {
      title: 'The 3-Minute Doctor Dossier',
      category: 'Clinical Bridge',
      icon: 'stethoscope',
      description: 'Transforms months of messy observations into a physician-aligned SBAR briefing (Situation, Background, Assessment-ready data) with tailored questions for your consultation.'
    },
    {
      title: 'Inclusive Baseline Adaptation',
      category: 'Personalized Care',
      icon: 'user',
      description: 'Inclusive of regular cycles, irregular patterns, perimenopause, postpartum, and non-menstruating users. Never assumes every user menstruates.'
    }
  ];

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
        <span className="pill-badge pill-rose" style={{ marginBottom: '0.8rem' }}>
          Platform Capabilities
        </span>
        <h1 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
          Intelligent Architecture for Female Biology
        </h1>
        <p style={{ fontSize: '1.1rem' }}>
          Dhatri replaces fragmented point-trackers with a unified longitudinal intelligence graph.
        </p>
      </div>

      {/* Grid of Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem'
      }}>
        {featuresList.map((f, i) => (
          <div key={i} className="dhatri-card dhatri-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-accent-soft)',
                color: 'var(--color-primary-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon name={f.icon} size={24} />
              </div>
              <span className="pill-badge pill-sage" style={{ fontSize: '0.75rem' }}>{f.category}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-burgundy)' }}>{f.title}</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{f.description}</p>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="dhatri-card" style={{ marginBottom: '4rem', overflowX: 'auto' }}>
        <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '1.5rem' }}>
          How Dhatri Compares to Traditional Approaches
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Dimension</th>
              <th style={{ padding: '12px' }}>Ordinary Period Apps</th>
              <th style={{ padding: '12px' }}>Hospital EHR Portals</th>
              <th style={{ padding: '12px', color: 'var(--color-primary-rose)' }}>Dhatri (धात्री)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Primary Focus</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Fertility dates & ad sales</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>PDF storage & billing</td>
              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-burgundy)' }}>Longitudinal Intelligence Graph</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Scope</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Menstrual bleed only</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Isolated single clinic visits</td>
              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-burgundy)' }}>Hormones + Metabolic + Sleep + Labs</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Temporal Logic</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Calendar day only</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Encounter date</td>
              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-burgundy)' }}>Bi-Temporal (Calendar + Biological Phase)</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: 600 }}>Doctor Integration</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Disconnected</td>
              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Overwhelming raw chart drop</td>
              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-burgundy)' }}>3-Minute SBAR Clinical Briefing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/onboarding" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem' }}>
          Get Started with Dhatri →
        </Link>
      </div>
    </div>
  );
}
