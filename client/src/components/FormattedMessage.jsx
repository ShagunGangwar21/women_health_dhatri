import React from 'react';

export default function FormattedMessage({ text, isUser = false }) {
  if (!text) return null;

  if (isUser) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
  }

  // Parse lines for formatting
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`list_${listKey++}`}
          style={{
            margin: '0.4rem 0 0.6rem 1.25rem',
            paddingLeft: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          {currentList.map((item, idx) => (
            <li key={idx} style={{ lineHeight: 1.55 }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInline = (str) => {
    if (!str) return null;

    // Handle bold **text**
    const parts = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIdx = 0;
    let match;

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      parts.push(
        <strong key={`b_${match.index}`} style={{ fontWeight: 600, color: 'inherit' }}>
          {match[1]}
        </strong>
      );
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }
    return parts.length > 0 ? parts : str;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Empty lines
    if (!trimmed) {
      flushList();
      return;
    }

    // Bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.substring(2);
      currentList.push(content);
      return;
    }

    // Numbered list items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      elements.push(
        <div
          key={`num_${idx}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            margin: '0.3rem 0',
            lineHeight: 1.55
          }}
        >
          <span style={{ fontWeight: 700, minWidth: '1.2rem', color: 'var(--color-primary-rose)' }}>
            {numMatch[1]}.
          </span>
          <span style={{ flex: 1 }}>{renderInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    flushList();

    // Headings (### or ## or #)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h3_${idx}`}
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--color-burgundy)',
            marginTop: idx === 0 ? '0' : '0.85rem',
            marginBottom: '0.35rem',
            lineHeight: 1.4
          }}
        >
          {renderInline(trimmed.substring(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h2_${idx}`}
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--color-burgundy)',
            marginTop: idx === 0 ? '0' : '1rem',
            marginBottom: '0.4rem',
            lineHeight: 1.4
          }}
        >
          {renderInline(trimmed.substring(3))}
        </h3>
      );
      return;
    }

    // Warning / Red Flag callout
    if (trimmed.startsWith('⚠️') || trimmed.toLowerCase().includes('urgent medical notice') || trimmed.includes('महत्वपूर्ण')) {
      elements.push(
        <div
          key={`warn_${idx}`}
          style={{
            margin: '0.6rem 0',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(217, 111, 137, 0.12)',
            borderLeft: '4px solid var(--color-rose)',
            fontSize: '0.9rem',
            lineHeight: 1.55
          }}
        >
          {renderInline(trimmed)}
        </div>
      );
      return;
    }

    // Note / Disclaimer line (*Note: or *नोट:)
    if (trimmed.startsWith('*Note:') || trimmed.startsWith('*नोट:') || trimmed.startsWith('*Note :')) {
      elements.push(
        <p
          key={`note_${idx}`}
          style={{
            fontSize: '0.82rem',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            margin: '0.5rem 0',
            lineHeight: 1.5
          }}
        >
          {renderInline(trimmed.replace(/^\*/, ''))}
        </p>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p
        key={`p_${idx}`}
        style={{
          margin: idx === 0 ? '0 0 0.5rem 0' : '0.4rem 0',
          lineHeight: 1.55
        }}
      >
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="formatted-ai-response">{elements}</div>;
}
