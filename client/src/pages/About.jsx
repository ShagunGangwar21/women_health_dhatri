import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem', maxWidth: '920px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="pill-badge pill-rose" style={{ marginBottom: '0.8rem' }}>
          Origin & Purpose
        </span>
        <h1 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
          About Dhatri (धात्री)
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          In Sanskrit, <em>Dhatri</em> represents the earth, the supporter, the nurturer, and the protector of vitality.
        </p>
      </div>

      <div className="dhatri-card" style={{ marginBottom: '2.5rem', lineHeight: '1.7' }}>
        <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
          The Problem We Are Solving
        </h3>
        <p style={{ marginBottom: '1rem' }}>
          Women's health information exists in fragments. Symptoms happen at different times. Blood reports are uploaded months apart. Menstrual history is separated from medical records. Sleep, stress, and nutrition are treated in silos.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          As a result, crucial health patterns remain hidden. Diagnoses for conditions like Endometriosis and PCOS are delayed by up to 7 to 10 years. Women are told "your labs are normal" or "it's just stress," while their lived experience says otherwise.
        </p>
        <p>
          <strong>Dhatri is not a period tracker, a symptom checker, or a telemedicine middleman.</strong> It is a longitudinal intelligence system that acts as the permanent biological memory and pattern synthesizer for women.
        </p>
      </div>

      {/* Product Philosophy */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--color-burgundy)', marginBottom: '2rem' }}>
          Our Unbroken Philosophy
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="dhatri-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👁️</div>
            <h4 style={{ color: 'var(--color-primary-rose)', marginBottom: '0.4rem' }}>1. Observe</h4>
            <p style={{ fontSize: '0.86rem' }}>Zero-friction capture of lived sensations, sleep, reports, and micro-notes without tedious checklists.</p>
          </div>

          <div className="dhatri-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
            <h4 style={{ color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>2. Connect</h4>
            <p style={{ fontSize: '0.86rem' }}>Anchoring every event across both calendar time and biological/hormonal phase coordinates.</p>
          </div>

          <div className="dhatri-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
            <h4 style={{ color: 'var(--color-sage)', marginBottom: '0.4rem' }}>3. Understand</h4>
            <p style={{ fontSize: '0.86rem' }}>Synthesizing multi-month latent correlations without alarmist or presumptive automated diagnosis.</p>
          </div>

          <div className="dhatri-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</div>
            <h4 style={{ color: 'var(--color-primary-rose)', marginBottom: '0.4rem' }}>4. Act</h4>
            <p style={{ fontSize: '0.86rem' }}>Arming you with physician-aligned SBAR dossiers and tailored consultation questions for your doctor.</p>
          </div>
        </div>
      </div>

      {/* The 3 Founding Pledges */}
      <div className="dhatri-card" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid var(--color-primary-rose)' }}>
        <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
          Our Three Guiding Pledges to You
        </h3>
        <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
          <li>
            <strong>We will never diagnose you:</strong> Diagnosis belongs to your licensed doctor. Context, clarity, and biological memory belong to you.
          </li>
          <li>
            <strong>Your data is sovereign:</strong> We never sell your personal or reproductive health data to third-party ad brokers or insurance algorithms.
          </li>
          <li>
            <strong>Zero tracking guilt:</strong> If you don't open Dhatri for 3 weeks, your story does not break. Human biology is not a streak.
          </li>
        </ol>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/onboarding" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem' }}>
          Begin Your Living Health Story →
        </Link>
      </div>
    </div>
  );
}
