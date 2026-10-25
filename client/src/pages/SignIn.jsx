import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import DhatriLogo from '../components/DhatriLogo.jsx';

export default function SignIn() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleForgotPassword = async () => {
    if (!resetEmail) return;
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      setResetMessage(data.message || 'Recovery instructions sent.');
    } catch (err) {
      setResetMessage('Recovery request submitted.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Demo login error.');
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
      padding: '2rem 1.5rem'
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
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative'
        }}>
          <div style={{
            maxWidth: '300px',
            width: '100%',
            marginBottom: '1.5rem',
            position: 'relative'
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
            Listen to Your Body's Wisdom
          </h3>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            maxWidth: '280px',
            margin: 0
          }}>
            An unbroken, private living health record designed to help you understand your rhythms and advocate for yourself.
          </p>
        </div>

        {/* Right Column: Sign In Form */}
        <div style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <DhatriLogo size="medium" to="/" />
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-burgundy)', marginTop: '1.25rem', marginBottom: '0.4rem' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Sign in to continue your living health journey.
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-rose)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password Accordion */}
          {showForgot && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-accent-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-burgundy)', margin: '0 0 0.5rem 0' }}>
                Reset Account Password
              </h4>
              {resetMessage ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--color-sage)', lineHeight: 1.4 }}>
                  ✓ {resetMessage}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Enter your email to receive recovery instructions.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Account email..."
                      style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.82rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span style={{ padding: '0 10px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* One-Click Demo Access */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem' }}
          >
            ⚡ Instant Demo Access (Priya Sharma)
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
            Don't have an account yet?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary-rose)', fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
