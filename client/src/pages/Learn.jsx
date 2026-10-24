import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function Learn() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const url = `/api/learn/articles?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
          if (data.categories) setCategories(data.categories);
        }
      } catch (err) {
        console.warn('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
        <span className="pill-badge pill-sage" style={{ marginBottom: '0.8rem' }}>
          Evidence-Based Resources
        </span>
        <h1 style={{ color: 'var(--color-burgundy)', marginBottom: '0.8rem' }}>
          Women’s Health & Endocrinology Library
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Demystifying hormonal fluctuations, lab biomarkers, sleep architecture, and reproductive health through peer-reviewed clinical science.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Search ferritin, migraines, endometriosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.6rem' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Icon name="search" size={18} />
          </span>
        </div>

        {/* Categories Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              style={{
                cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid var(--control-active-border)' : '1px solid var(--border-card)',
                backgroundColor: selectedCategory === cat ? 'var(--control-active-bg)' : 'var(--bg-card)',
                color: selectedCategory === cat ? 'var(--control-active-text)' : 'var(--text-secondary)',
                boxShadow: 'var(--shadow-sm)',
                padding: '0.45rem 1rem',
                fontSize: '0.85rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Educational Articles Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading evidence-based articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="dhatri-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No articles found matching "{searchTerm}".</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/learn/${article.slug}`}
              className="dhatri-card dhatri-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '0'
              }}
            >
              {article.image && (
                <div style={{ height: '190px', overflow: 'hidden', backgroundColor: 'var(--bg-accent-soft)' }}>
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span className="pill-badge pill-sage" style={{ fontSize: '0.72rem' }}>
                    {article.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {article.readingTime}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.18rem', marginBottom: '0.6rem', color: 'var(--color-burgundy)', lineHeight: 1.35 }}>
                  {article.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1, lineHeight: 1.5 }}>
                  {article.summary}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-rose)', fontWeight: 600, fontSize: '0.86rem' }}>
                  Read Article →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Medical Disclaimer Banner */}
      <div style={{
        marginTop: '4rem',
        padding: '1.25rem 1.75rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5
      }}>
        <strong>Educational Disclaimer:</strong> All articles published on Dhatri are for educational and body-awareness purposes. They do not substitute for formal medical evaluation, personalized diagnostic testing, or clinical prescriptions.
      </div>
    </div>
  );
}
