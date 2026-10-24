import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import NearbyHealthcareMap from '../components/NearbyHealthcareMap.jsx';

export default function CarePublic() {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const url = `/api/appointments/directory?search=${encodeURIComponent(search)}&specialty=${encodeURIComponent(selectedSpecialty)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers || []);
        }
      } catch (err) {
        console.warn('Failed to load providers:', err);
      }
    };
    fetchProviders();
  }, [search, selectedSpecialty]);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
        <span className="pill-badge pill-rose" style={{ marginBottom: '0.8rem' }}>
          Clinical Alignment & Nearby Facilities
        </span>
        <h1 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
          Healthcare Support & Nearby Care Network
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Locate verified nearby hospitals, women's clinics, and pharmacies on OpenStreetMap, and prepare structured health summaries for your clinical consultations.
        </p>
      </div>

      {/* Real Interactive Leaflet OpenStreetMap Directory */}
      <div style={{ marginBottom: '4rem' }}>
        <NearbyHealthcareMap />
      </div>

      {/* How Dhatri Prepares You */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3.5rem'
      }}>
        <div className="dhatri-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>📄</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>1. 3-Minute Doctor Dossier</h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
            Synthesizes 12–24 months of symptom trends, cycle logs, and lab values into the standard medical SBAR format that physicians can review in 90 seconds.
          </p>
        </div>

        <div className="dhatri-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>❓</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>2. Evidence-Based Questions</h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
            Formulates 3 specific questions tailored to your primary concerns (e.g. asking for iron saturation panels or hormonal phase correlations).
          </p>
        </div>

        <div className="dhatri-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🩺</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>3. Specialist Directory</h3>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
            Browse vetted clinical specializations across Gynecology, Reproductive Endocrinology, Pelvic Floor Physical Therapy, and Nutrition.
          </p>
        </div>
      </div>

      {/* Demo Notice */}
      <div style={{
        backgroundColor: 'var(--bg-accent-soft)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.25rem',
        marginBottom: '2rem',
        fontSize: '0.86rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Icon name="shield" size={18} color="var(--color-burgundy)" />
        <span>
          <strong>Notice:</strong> The directory below is an illustrative test network for consultation planning and question organization. It does not process real transactional clinic bookings.
        </span>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search provider name, focus area, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: '220px' }}
        >
          <option value="">All Specialties</option>
          <option value="Gynecologist">Gynecology (OB/GYN)</option>
          <option value="Endocrinologist">Endocrinology</option>
          <option value="Pelvic">Pelvic Floor PT</option>
          <option value="Nutritionist">Clinical Nutrition</option>
        </select>
      </div>

      {/* Providers Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.75rem'
      }}>
        {providers.map((p) => (
          <div key={p.id} className="dhatri-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="pill-badge pill-sage" style={{ fontSize: '0.72rem' }}>
                  Demo Network
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D96F89' }}>
                  ★ {p.rating}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', marginBottom: '2px' }}>{p.name}</h3>
              <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-sage)', marginBottom: '0.4rem' }}>{p.specialty}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{p.clinicName} • {p.location}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <strong>Focus:</strong> {p.focusAreas?.join(', ')}
              </p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.experienceYears} yrs experience</span>
              <Link to="/app/care" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
                Prepare Questions
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
