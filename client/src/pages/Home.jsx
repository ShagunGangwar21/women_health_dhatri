import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Home() {
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        padding: '3.5rem 0 5rem',
        background: 'radial-gradient(ellipse at top left, var(--bg-accent-soft) 0%, transparent 65%)',
        overflow: 'hidden'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '3.5rem'
        }}>
          {/* Left Column: Headlines & CTAs */}
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="pill-badge pill-rose">
                🌸 Dhatri (धात्री)
              </span>
              <span className="pill-badge pill-sage">
                Women's Health Intelligence
              </span>
            </div>

            <h1 style={{ color: 'var(--color-burgundy)', lineHeight: 1.15 }}>
              Your Wellness <br />
              <span style={{ color: 'var(--color-primary-rose)', fontStyle: 'italic' }}>Bestie</span>
            </h1>

            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Small steps. Big changes.
            </p>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
              A personalized women's wellness and health-history platform that connects your cycle, symptoms, sleep, nutrition, and blood reports into meaningful understanding—helping you advocate for your body and prepare for better medical consultations.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
              <Link to={isAuthenticated ? '/app' : '/onboarding'} className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Get Started
              </Link>
              <Link to="/learn" className="btn btn-secondary" style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem' }}>
                Learn More
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={async () => { await demoLogin(); window.location.href = '/app'; }}
                  className="btn btn-outline"
                  style={{ padding: '0.9rem 1.4rem', fontSize: '0.95rem' }}
                >
                  ⚡ Explore Demo
                </button>
              )}
            </div>

            {/* Value Highlights */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary-rose)', fontSize: '1.1rem' }}>✓</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Holistic Care</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-sage)', fontSize: '1.1rem' }}>✓</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Evidence-Based</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-burgundy)', fontSize: '1.1rem' }}>✓</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Privacy First</span>
              </div>
            </div>
          </div>

          {/* Right Column: Woman-Centered Hero Illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              position: 'relative',
              maxWidth: '460px',
              width: '100%',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--border-card)',
              background: 'var(--bg-card)'
            }} className="animate-pulse-gentle">
              <img
                src="/hero-girl.svg"
                alt="Girl illustration with long burgundy hair, closed eyes, pink heart, and botanical leaves"
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => {
                  if (e.currentTarget.src.indexOf('hero-girl.png') === -1) {
                    e.currentTarget.src = '/hero-girl.png';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="pill-badge pill-rose" style={{ marginBottom: '0.8rem' }}>
              First-Principles Design
            </span>
            <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '0.8rem' }}>
              Everything in One Living Health Story
            </h2>
            <p>
              Your body does not operate in isolated episodes. Dhatri brings together symptoms, lifestyle context, and diagnostic labs to reveal recurring biological rhythms.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Card 1: Intelligent Cycle & Phase Tracking */}
            <div className="dhatri-card dhatri-card-interactive">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-blush-pink)',
                color: 'var(--color-burgundy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Icon name="calendar" size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Bi-Temporal Tracking</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Track cycle days and hormonal phases (Menstrual, Follicular, Ovulatory, Luteal) alongside calendar months. Projections are clearly marked as mathematical estimates.
              </p>
            </div>

            {/* Card 2: Health Records & Lab Trends */}
            <div className="dhatri-card dhatri-card-interactive">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-sage-soft)',
                color: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Icon name="report" size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Diagnostic Memory</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Store PDF and photo blood tests. Track silent drifts across 18+ months in Ferritin, TSH, Vitamin D, and Hemoglobin that episodic doctor visits miss.
              </p>
            </div>

            {/* Card 3: AI Wellness Assistant */}
            <div className="dhatri-card dhatri-card-interactive">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-accent-soft)',
                color: 'var(--color-primary-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Icon name="assistant" size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Wellness Companion</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Explains laboratory jargon, connects symptoms, and answers questions in English or Hindi / Hinglish—grounded in strict clinical safety without fake diagnosis.
              </p>
            </div>

            {/* Card 4: Clinical Bridge */}
            <div className="dhatri-card dhatri-card-interactive">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-soft-pink)',
                color: 'var(--color-burgundy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Icon name="care" size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3-Minute Doctor Dossier</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Generate print-ready physician briefings in standard SBAR format with tailored questions, turning rushed 12-minute appointments into collaborative partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Banner Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '3rem'
        }}>
          <div>
            <span className="pill-badge pill-sage" style={{ marginBottom: '0.8rem' }}>
              Evidence-Based Learning
            </span>
            <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
              Menstrual Health is Much More Than Hygiene
            </h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              From iron bank reserves to progesterone's influence on neurotransmitters, our curated article library bridges the gap between complex endocrinology and your everyday vitality.
            </p>
            <Link to="/learn" className="btn btn-outline">
              Explore Articles & Sources →
            </Link>
          </div>
          <div>
            <img
              src="/benefits-image.png"
              alt="Menstrual health illustration"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}
            />
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #702B4C, #8B345D)',
        color: '#FFF8F3',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 style={{ color: '#FFF8F3', marginBottom: '1rem' }}>
            Ready to Meet Your Wellness Bestie?
          </h2>
          <p style={{ color: 'var(--color-blush-pink)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Begin tracking with zero tracking guilt. No streaks, no judgment, just thoughtful intelligence designed for your biology.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/onboarding" className="btn" style={{ backgroundColor: '#FFF8F3', color: '#702B4C', padding: '0.9rem 2.2rem' }}>
              Get Started for Free
            </Link>
            <Link to="/about" className="btn" style={{ border: '1.5px solid #FFF8F3', color: '#FFF8F3', padding: '0.9rem 1.8rem' }}>
              Read Our Mission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
