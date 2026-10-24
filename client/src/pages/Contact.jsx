import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: 'feedback', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem', maxWidth: '860px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="pill-badge pill-rose" style={{ marginBottom: '0.8rem' }}>
          Get in Touch
        </span>
        <h1 style={{ color: 'var(--color-burgundy)', marginBottom: '0.8rem' }}>
          Contact Dhatri (धात्री)
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Have feedback, need technical support, or want to partner with our clinical research team?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {/* Contact Form */}
        <div className="dhatri-card">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="animate-fade-in">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🌸</div>
              <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>Thank You for Reaching Out</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your message has been received by the Dhatri care team. We will review and respond to your email shortly.
              </p>
              <button onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: 'feedback', message: '' }); }} className="btn btn-secondary">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Shagun Gangwar"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="shagun@example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  className="form-select"
                >
                  <option value="feedback">Product Feedback & Suggestion</option>
                  <option value="support">Technical Support</option>
                  <option value="privacy">Privacy & Data Sovereign Request</option>
                  <option value="medical_advisory">Clinical Partnership Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Share your thoughts with us..."
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Emergency & Helpline Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="dhatri-card" style={{ borderLeft: '4px solid var(--color-primary-rose)' }}>
            <h4 style={{ color: 'var(--color-burgundy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="shield" size={18} color="var(--color-primary-rose)" /> Emergency & Crisis Care
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
              Dhatri is not an emergency medical provider. If you are experiencing acute severe pain, heavy hemorrhaging, or syncope, please call:
            </p>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
              • National Emergency: 112 <br />
              • Women's Helpline: 1091 <br />
              • Mental Health Support (KIRAN): 1800-599-0019
            </div>
          </div>

          <div className="dhatri-card">
            <h4 style={{ color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>
              Privacy & Zero-Knowledge Architecture
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Your reproductive and laboratory records remain strictly confidential. We never monetize or sell personal health records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
