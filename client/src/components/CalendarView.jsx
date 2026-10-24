import React, { useState } from 'react';
import Icon from './Icon.jsx';

export default function CalendarView({
  cycleLogs = [],
  symptoms = [],
  estimates = null,
  onDateClick,
  selectedDate
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create date grid
  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ empty: true });
  }
  // Days of this month
  for (let d = 1; d <= daysInMonth; d++) {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Check if period day
    const isPeriod = cycleLogs.some(log => {
      if (!log.startDate) return false;
      const start = new Date(log.startDate);
      const end = log.endDate ? new Date(log.endDate) : new Date(start.getTime() + 4 * 86400000);
      const current = new Date(formatted);
      return current >= start && current <= end;
    });

    // Check if projected estimated period
    const isEstimated = !isPeriod && estimates?.estimatedNextPeriod && (() => {
      const start = new Date(estimates.estimatedNextPeriod.startDate);
      const end = new Date(estimates.estimatedNextPeriod.endDate);
      const current = new Date(formatted);
      return current >= start && current <= end;
    })();

    // Check if fertile window
    const isFertile = !isPeriod && !isEstimated && estimates?.estimatedFertileWindow && (() => {
      const start = new Date(estimates.estimatedFertileWindow.startDate);
      const end = new Date(estimates.estimatedFertileWindow.endDate);
      const current = new Date(formatted);
      return current >= start && current <= end;
    })();

    // Check if symptom logged on this day
    const daySymptoms = symptoms.filter(s => s.date === formatted);

    days.push({
      dateStr: formatted,
      dayNum: d,
      isPeriod,
      isEstimated,
      isFertile,
      hasSymptoms: daySymptoms.length > 0,
      symptomsCount: daySymptoms.length
    });
  }

  return (
    <div className="dhatri-card" style={{ padding: '1.5rem' }}>
      {/* Calendar Header with Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
          {monthNames[month]} {year}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevMonth} className="btn-icon" aria-label="Previous Month">
            <Icon name="chevron-left" size={18} />
          </button>
          <button onClick={nextMonth} className="btn-icon" aria-label="Next Month">
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginBottom: '0.6rem'
      }}>
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {days.map((item, idx) => {
          if (item.empty) {
            return <div key={`empty-${idx}`} style={{ minHeight: '44px' }} />;
          }

          const isSelected = selectedDate === item.dateStr;
          const isToday = item.dateStr === new Date().toISOString().split('T')[0];

          let bg = 'var(--bg-card)';
          let border = '1px solid var(--border-subtle)';
          let textColor = 'var(--text-primary)';

          if (item.isPeriod) {
            bg = 'var(--color-primary-rose)';
            textColor = '#FFFFFF';
            border = '1px solid var(--color-primary-rose)';
          } else if (item.isEstimated) {
            bg = 'var(--bg-accent-soft)';
            border = '1.5px dashed var(--color-primary-rose)';
          } else if (item.isFertile) {
            bg = 'var(--bg-sage-soft)';
            border = '1px solid var(--color-sage)';
          }

          if (isSelected) {
            border = '2px solid var(--color-primary-rose)';
            if (!item.isPeriod) bg = 'var(--bg-accent)';
          }

          return (
            <button
              key={item.dateStr}
              onClick={() => onDateClick && onDateClick(item.dateStr)}
              style={{
                minHeight: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: bg,
                border,
                color: textColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform var(--transition-fast)',
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={`${item.dateStr}${item.isPeriod ? ' (Logged Period)' : item.isEstimated ? ' (Estimated Period)' : item.isFertile ? ' (Fertile Window Estimate)' : ''}`}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: isToday ? 800 : 600 }}>
                {item.dayNum}
              </span>
              
              {/* Symptom Dots */}
              {item.hasSymptoms && (
                <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: item.isPeriod ? '#FFF8F3' : 'var(--color-primary-rose)'
                  }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        marginTop: '1.5rem',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--color-primary-rose)' }} />
          <span>Logged Period</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '4px', border: '1.5px dashed var(--color-primary-rose)', backgroundColor: 'var(--bg-accent-soft)' }} />
          <span>Estimated Period</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--bg-sage-soft)', border: '1px solid var(--color-sage)' }} />
          <span>Fertile Window (Est.)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary-rose)' }} />
          <span>Symptom Logged</span>
        </div>
      </div>
    </div>
  );
}
