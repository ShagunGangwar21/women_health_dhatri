import React, { useState } from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/Icon';

export default function MyGoals() {
  const { goals, updateGoalProgress, addGoal } = useHealthData();
  const { t, isHindi } = useLanguage();

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hydration');
  const [newTarget, setNewTarget] = useState(2.4);
  const [newUnit, setNewUnit] = useState('Liters');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleIncrement = async (goal, delta) => {
    const newCurrent = Math.max(0, Number((goal.current + delta).toFixed(1)));
    await updateGoalProgress(goal._id || goal.id, newCurrent);
  };

  const handleToggleCompleted = async (goal) => {
    const isNowDone = goal.current < goal.target;
    const newCurrent = isNowDone ? goal.target : 0;
    await updateGoalProgress(goal._id || goal.id, newCurrent);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    setIsAdding(true);
    try {
      await addGoal({
        title: newTitle,
        category: newCategory,
        target: Number(newTarget),
        current: 0,
        unit: newUnit,
        frequency: 'daily',
        streak: 0
      });
      setNewTitle('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="goals-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('goals.badge', null, 'Action Stage (Observe → Connect → Understand → Act)')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>
            {t('goals.title', null, 'Daily Wellness Intentions & Goals')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px' }}>
            {t('goals.subtitle', null, 'Small, continuous physiological adjustments tailored to your current cycle phase and biological rhythm.')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <Icon name="plus" size={18} />
          {showAddForm ? t('goals.closeForm', null, 'Close Form') : t('goals.setNew', null, 'Set New Intention')}
        </button>
      </div>

      {/* Add Goal Form Accordion */}
      {showAddForm && (
        <div className="card animate-fade-in" style={{ padding: '1.75rem', border: '1px solid var(--color-rose)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--color-burgundy)' }}>
            {t('goals.defineNew', null, 'Define a New Daily Wellness Goal')}
          </h3>
          <form onSubmit={handleCreateGoal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                {t('goals.goalTitle', null, 'Goal Title')}
              </label>
              <input
                type="text"
                required
                placeholder={isHindi ? "उदा. सुबह की धूप और वॉक" : "E.g., Morning Sunlight Exposure"}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                {t('goals.category', null, 'Category')}
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              >
                <option value="Hydration">{isHindi ? 'हाइड्रेशन (जल स्तर)' : 'Hydration'}</option>
                <option value="Sleep & Rest">{isHindi ? 'नींद और विश्राम' : 'Sleep & Rest'}</option>
                <option value="Nourishment & Iron">{isHindi ? 'पोषण एवं आयरन' : 'Nourishment & Iron'}</option>
                <option value="Pelvic Health">{isHindi ? 'पेल्विक स्वास्थ्य' : 'Pelvic Health'}</option>
                <option value="Stress Pacing">{isHindi ? 'तनाव नियंत्रण' : 'Stress Pacing'}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                {t('goals.dailyTarget', null, 'Daily Target & Unit')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  style={{ width: '40%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                />
                <input
                  type="text"
                  placeholder={isHindi ? "लीटर, मिनट, आदि" : "Minutes, Liters, etc."}
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  style={{ width: '60%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1rem' }}
            >
              {isAdding ? t('common.submitting', null, 'Saving...') : t('common.save', null, 'Add to Dashboard')}
            </button>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.current / (goal.target || 1)) * 100));
          const isDone = percent >= 100;

          return (
            <div
              key={goal._id || goal.id}
              className="card card-hover"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                borderLeft: isDone ? '5px solid var(--color-deep-green)' : '5px solid var(--color-rose)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-sage" style={{ fontSize: '0.75rem' }}>{goal.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                    🔥 {t('goals.streak', { count: goal.streak || 3 }, `${goal.streak || 3} Day Streak`)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-burgundy)', marginBottom: '0.25rem' }}>
                  {goal.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t('goals.target', { target: goal.target, unit: goal.unit }, `Target: ${goal.target} ${goal.unit}`)}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span style={{ fontWeight: 700, color: isDone ? 'var(--color-deep-green)' : 'var(--color-rose)' }}>
                    {percent}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: isDone ? 'var(--color-deep-green)' : 'var(--color-rose)',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleIncrement(goal, -0.5)}
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    title="Decrease progress"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleIncrement(goal, 0.5)}
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    title="Increase progress"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleToggleCompleted(goal)}
                  className={`btn ${isDone ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Icon name={isDone ? 'check-circle' : 'circle'} size={15} />
                  {isDone ? t('goals.completed', null, 'Goal Met Today') : t('goals.markDone', null, 'Mark Complete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
