import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/Icon';

const ARTICLES = [
  {
    slug: 'understanding-ferritin-fatigue',
    title: 'Why Normal Hemoglobin Can Still Mean Depleted Iron Stores',
    category: 'Nutrition & Iron',
    readTime: '6 min read',
    summary: 'Serum ferritin reflects deep bone marrow iron reserves. Learn how heavy cycles silently deplete ferritin long before standard CBC shows anemia.',
    source: 'The Lancet Haematology, 2023',
    featured: true
  },
  {
    slug: 'luteal-phase-progesterone-migraines',
    title: 'The Science of Menstrual Migraines in the Late Luteal Phase',
    category: 'Hormonal Health',
    readTime: '8 min read',
    summary: 'A deep physiological dive into estrogen withdrawal, prostaglandins, and how to calibrate sleep and electrolytes before menstruation.',
    source: 'American Headache Society Review',
    featured: true
  },
  {
    slug: 'endometriosis-early-signals',
    title: 'Beyond Bad Cramps: Differentiating Primary Dysmenorrhea from Endometriosis',
    category: 'Menstrual Health',
    readTime: '10 min read',
    summary: 'How to log symptom duration, gastrointestinal flares, and pelvic floor tension to empower accurate clinical evaluations.',
    source: 'ACOG Practice Bulletin No. 114',
    featured: false
  },
  {
    slug: 'circadian-rhythms-sleep-quality',
    title: 'Syncing Your Circadian Biology Across Your Infradian Cycle',
    category: 'Sleep & Nervous System',
    readTime: '5 min read',
    summary: 'Body temperature fluctuates across the follicular and luteal phases. Tailoring sleep hygiene to your cycle phase optimizes deep REM sleep.',
    source: 'Journal of Sleep Research',
    featured: false
  },
  {
    slug: 'pcos-insulin-resistance-myths',
    title: 'The Metabolic Underpinnings of Polycystic Ovary Syndrome',
    category: 'Hormonal Health',
    readTime: '7 min read',
    summary: 'Why androgen excess and insulin sensitivity require holistic nourishment rather than restrictive calorie counting.',
    source: 'Endocrine Society Clinical Guidelines',
    featured: false
  },
  {
    slug: 'pelvic-floor-hypertonicity-breathing',
    title: 'Diaphragmatic Breathing and Pelvic Floor Tension Release',
    category: 'Pelvic Floor Care',
    readTime: '5 min read',
    summary: 'How chronic sympathetic activation leads to involuntary pelvic floor tightening and exacerbated menstrual cramps.',
    source: 'Physical Therapy in Women\'s Health',
    featured: false
  }
];

const CATEGORIES = ['All Categories', 'Menstrual Health', 'Hormonal Health', 'Nutrition & Iron', 'Sleep & Nervous System', 'Pelvic Floor Care'];

export default function LearnDashboard() {
  const { t, isHindi } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = ARTICLES.filter(art => {
    const matchesCat = selectedCat === 'All Categories' || art.category === selectedCat;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="learn-dashboard-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('learn.badge', null, 'Evidence-Based Wellness Knowledge')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>
            {t('learn.title', null, 'Medical & Holistic Resources')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px' }}>
            {t('learn.subtitle', null, 'Curated clinical insights, peer-reviewed explanations, and physiology guides to empower self-advocacy and health literacy.')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder={t('learn.searchPlaceholder', null, 'Search by topic, symptom, or biomarker (e.g. Ferritin, Cramps, Sleep)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--color-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '1px solid var(--control-active-border)' : '1px solid var(--border-card)',
                  background: selectedCat === cat ? 'var(--control-active-bg)' : 'var(--bg-secondary)',
                  color: selectedCat === cat ? 'var(--control-active-text)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: selectedCat === cat ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat === 'All Categories' ? (isHindi ? 'सभी श्रेणियां' : 'All Categories') : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {filteredArticles.map(art => (
          <div
            key={art.slug}
            className="card card-hover"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>{art.category}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏱ {art.readTime}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-burgundy)', lineHeight: 1.4 }}>
                {art.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {art.summary}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>📚 {art.source}</span>
              <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>
                {t('learn.readArticle', null, 'Read Full Guide →')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
