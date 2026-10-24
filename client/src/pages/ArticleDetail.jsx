import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/learn/articles/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data.article);
          setRelated(data.related || []);
        }
      } catch (err) {
        console.warn('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading article details...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Article not found</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>The article you are looking for does not exist or has been relocated.</p>
        <Link to="/learn" className="btn btn-primary">Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '820px' }}>
      {/* Back Link */}
      <Link to="/learn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-rose)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <Icon name="chevron-left" size={16} /> Back to Health Library
      </Link>

      {/* Article Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
          <span className="pill-badge pill-rose">{article.category}</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{article.readingTime}</span>
        </div>
        <h1 style={{ color: 'var(--color-burgundy)', lineHeight: 1.25, marginBottom: '1rem' }}>
          {article.title}
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {article.summary}
        </p>
      </div>

      {/* Featured Image */}
      {article.image && (
        <div style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <img src={article.image} alt={article.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      )}

      {/* Content Body */}
      <article className="dhatri-card" style={{ padding: '2.5rem', lineHeight: '1.8', fontSize: '1.02rem', marginBottom: '3rem' }}>
        <div style={{ whiteSpace: 'pre-line' }}>
          {article.content}
        </div>

        {/* Reputable Sources */}
        {article.sources && article.sources.length > 0 && (
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.86rem',
            color: 'var(--text-muted)'
          }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Clinical Sources & Literature:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {article.sources.map((src, i) => (
                <li key={i}>{src}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* Related Reading */}
      {related.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '1.25rem' }}>Related Articles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {related.map(r => (
              <Link key={r.id} to={`/learn/${r.slug}`} className="dhatri-card dhatri-card-interactive" style={{ padding: '1.25rem' }}>
                <span className="pill-badge pill-sage" style={{ fontSize: '0.7rem', marginBottom: '0.4rem' }}>{r.category}</span>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', margin: '0.4rem 0' }}>{r.title}</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{r.summary.substring(0, 80)}...</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
