import React from 'react';
import { Link } from 'react-router-dom';
import DhatriLogo from './DhatriLogo.jsx';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-card)',
      padding: '4rem 0 2.5rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <DhatriLogo size="medium" />
            <p style={{ fontSize: '0.92rem', maxWidth: '320px', color: 'var(--text-secondary)' }}>
              A personalized women's wellness, longitudinal health intelligence, and biological memory platform. Empowering women with self-knowledge and preparing confident clinical consultations.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="pill-badge pill-rose">Holistic Care</span>
              <span className="pill-badge pill-sage">Evidence-Based</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.92rem' }}>
              <li><Link to="/about">About Dhatri (धात्री)</Link></li>
              <li><Link to="/features">Intelligent Features</Link></li>
              <li><Link to="/learn">Evidence-Based Library</Link></li>
              <li><Link to="/care">Clinical Care & Providers</Link></li>
              <li><Link to="/onboarding">Personalized Onboarding</Link></li>
            </ul>
          </div>

          {/* Health Modules */}
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Wellness Tools</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.92rem' }}>
              <li><Link to="/app/cycle">Cycle & Phase Estimator</Link></li>
              <li><Link to="/app/symptoms">Symptom Context Logger</Link></li>
              <li><Link to="/app/reports">Lab Biomarkers & Reports</Link></li>
              <li><Link to="/app/insights">Cross-System Insights</Link></li>
              <li><Link to="/app/assistant">AI Wellness Assistant</Link></li>
            </ul>
          </div>

          {/* Trust & Safety Notice */}
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Trust & Medical Notice</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
              <strong>Educational Disclaimer:</strong> Dhatri provides health intelligence and educational context. It does not provide medical diagnosis, treatment, or prescriptions. Always consult a qualified physician for clinical decisions.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-primary-rose)', fontWeight: 600 }}>
              National Emergency: 112 | Women's Helpline: 1091
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <p>© 2026 Dhatri (धात्री) Health Intelligence. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/contact">Contact Support</Link>
            <Link to="/about">Privacy Sovereign Pledge</Link>
            <Link to="/features">Security & Cryptography</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
