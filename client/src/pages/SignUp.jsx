import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import DhatriLogo from '../components/DhatriLogo.jsx';

export default function SignUp() {
  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthYear, setBirthYear] = useState(2000);
  const [isMenstruating, setIsMenstruating] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        birthYear: Number(birthYear),
        isMenstruating,
        biologicalSeason: 'regulating_exploring'
      });
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem'
    }}>
      <div className="dhatri-card" style={{
        maxWidth: '960px',
        width: '100%',
        padding: 0,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-card)'
      }}>
        {/* Left Column: Wellness Hero Illustration */}
        <div style={{
          backgroundColor: 'var(--bg-accent-soft)',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          borderRight: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            maxWidth: '300px',
            width: '100%',
            marginBottom: '1.5rem'
          }}>
            <img
              src="/images/dhatri-wellness-girl.png"
              alt="Dhatri Wellness — Caring Companion holding a pink heart"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1 / 1',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)',
                filter: 'drop-shadow(0 12px 24px rgba(112, 43, 76, 0.12))'
              }}
              onError={(e) => {
                if (e.currentTarget.src.indexOf('dhatri-wellness-girl.svg') === -1) {
                  e.currentTarget.src = '/images/dhatri-wellness-girl.svg';
                }
              }}
            />
          </div>
          <span className="pill-badge pill-rose" style={{ marginBottom: '0.75rem' }}>
            🌸 Dhatri (धात्री)
          </span>
          <h3 style={{
            fontSize: '1.25rem',
            color: 'var(--color-burgundy)',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-serif)'
          }}>
            Your Living Health Continuum
          </h3>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            maxWidth: '280px',
            margin: 0
          }}>
            Track your cycle, symptoms, sleep, and biomarkers across time without fragmented records.
          </p>
        </div>

        {/* Right Column: Sign Up Form */}
        <div style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <DhatriLogo size="medium" to="/" />
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-burgundy)', marginTop: '1.25rem', marginBottom: '0.4rem' }}>
              Create Your Health Profile
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Begin an unbroken living health record.
            </p>
          </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--bg-accent-soft)',
            color: 'var(--color-burgundy)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--color-primary-rose)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shanya Rathor"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="shanya@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Birth Year</label>
              <input
                type="number"
                min="1950"
                max="2015"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Menstrual Cycle</label>
              <select
                value={isMenstruating ? 'yes' : 'no'}
                onChange={(e) => setIsMenstruating(e.target.value === 'yes')}
                className="form-select"
              >
                <option value="yes">Active Cycle</option>
                <option value="no">Not Applicable / Opt out</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            {loading ? 'Creating Profile...' : 'Complete & Enter Dhatri'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: 'var(--color-primary-rose)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
