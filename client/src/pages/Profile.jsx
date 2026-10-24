import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/Icon';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { t, isHindi } = useLanguage();

  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [email] = useState(user?.email || 'priya.sharma@dhatri.app');
  const [birthYear, setBirthYear] = useState(user?.birthYear || user?.profile?.birthYear || 1998);
  const [biologicalSeason, setBiologicalSeason] = useState(user?.biologicalSeason || user?.profile?.biologicalSeason || 'cycling');
  const [primaryConcern, setPrimaryConcern] = useState(user?.primaryConcern || user?.profile?.primaryConcern || 'Tracking luteal phase energy shifts & ferritin levels');
  const [cycleRegularity, setCycleRegularity] = useState(user?.cycleRegularity || user?.profile?.cycleRegularity || 'regular');
  const [emergencyContact, setEmergencyContact] = useState(
    typeof user?.emergencyContact === 'string'
      ? user.emergencyContact
      : user?.emergencyContact?.phone || user?.profile?.emergencyContact || '+91 98765 43210 (Dr. Ananya Roy)'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Synchronize state when user is loaded from backend
  React.useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.birthYear || user.profile?.birthYear) setBirthYear(user.birthYear || user.profile?.birthYear);
      if (user.biologicalSeason || user.profile?.biologicalSeason) setBiologicalSeason(user.biologicalSeason || user.profile?.biologicalSeason);
      if (user.primaryConcern || user.profile?.primaryConcern) setPrimaryConcern(user.primaryConcern || user.profile?.primaryConcern);
      if (user.cycleRegularity || user.profile?.cycleRegularity) setCycleRegularity(user.cycleRegularity || user.profile?.cycleRegularity);
      if (user.emergencyContact) {
        setEmergencyContact(typeof user.emergencyContact === 'string' ? user.emergencyContact : user.emergencyContact?.phone || user.profile?.emergencyContact || '');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');

    try {
      await updateProfile({
        name,
        birthYear: Number(birthYear),
        biologicalSeason,
        primaryConcern,
        cycleRegularity,
        emergencyContact: {
          phone: emergencyContact,
          name: emergencyContact
        },
        profile: {
          birthYear: Number(birthYear),
          biologicalSeason,
          primaryConcern,
          cycleRegularity,
          emergencyContact
        }
      });
      setSaveSuccess(isHindi ? 'हेल्थ प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।' : 'Health Profile updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-rose" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('profile.badge', null, 'Biological Persona & Preferences')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>
            {t('profile.title', null, 'Your Health Profile')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px' }}>
            {t('profile.subtitle', null, 'Manage baseline physiological context, life stage markers, and medical contact references.')}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Profile Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
            <Icon name="user" size={20} color="var(--color-rose)" /> {isHindi ? 'व्यक्तिगत व चिकित्सीय जानकारी' : 'Personal & Clinical Baseline'}
          </h2>

          {saveSuccess && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-sage)', fontSize: '0.9rem' }}>
              ✓ {saveSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('profile.name', null, 'Full Name')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('profile.email', null, 'Email Address')}
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-surface)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('profile.birthYear', null, 'Birth Year')}
                </label>
                <input
                  type="number"
                  min="1940"
                  max="2015"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('profile.biologicalSeason', null, 'Biological Season / Life Stage')}
                </label>
                <select
                  value={biologicalSeason}
                  onChange={(e) => setBiologicalSeason(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                >
                  <option value="cycling">{isHindi ? 'प्राकृतिक मासिक धर्म चक्र' : 'Natural Menstrual Cycling'}</option>
                  <option value="perimenopause">{isHindi ? 'पेरीमेनोपॉज़ चरण' : 'Perimenopause Transition'}</option>
                  <option value="postmenopause">{isHindi ? 'पोस्टमेनोपॉज़' : 'Postmenopausal'}</option>
                  <option value="pregnant">{isHindi ? 'गर्भावस्था' : 'Pregnant / Prenatal'}</option>
                  <option value="postpartum">{isHindi ? 'प्रसवोत्तर देखभाल' : 'Postpartum Care'}</option>
                  <option value="not_applicable">{isHindi ? 'लागू नहीं / ट्रैक न करें' : 'Not Applicable / Prefer Not to Track'}</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('profile.cycleRegularity', null, 'Cycle Regularity Assessment')}
              </label>
              <select
                value={cycleRegularity}
                onChange={(e) => setCycleRegularity(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              >
                <option value="regular">{isHindi ? 'नियमित (24–35 दिन अंतराल)' : 'Regular (24–35 day intervals)'}</option>
                <option value="irregular">{isHindi ? 'अनियमित (>7 दिन का अंतर)' : 'Irregular (Varies by >7 days)'}</option>
                <option value="absent">{isHindi ? 'अनुपस्थित (एमेनोरिया)' : 'Absent / Amenorrhea'}</option>
                <option value="on_contraceptive">{isHindi ? 'हार्मोनल गर्भनिरोधक पर' : 'Suppressed / Hormonal Contraceptive'}</option>
                <option value="not_applicable">{isHindi ? 'लागू नहीं' : 'Not Applicable'}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('profile.primaryConcern', null, 'Primary Health Inquiries & Concerns')}
              </label>
              <textarea
                rows="3"
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                placeholder={isHindi ? "उदा. आयरन की कमी, थकान, ल्यूटियल सिरदर्द, पेट में दर्द..." : "E.g., Iron deficiency fatigue, recurrent luteal headaches, pelvic pain..."}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('profile.emergencyContact', null, 'Emergency / Attending Physician Contact')}
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder={isHindi ? "डॉक्टर का नाम एवं इमरजेंसी फोन" : "Doctor name & clinic emergency phone"}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {isSaving ? t('common.submitting', null, 'Updating Profile...') : t('profile.saveProfile', null, 'Save Health Profile')}
            </button>
          </form>
        </div>

        {/* Identity & Health Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-soft-pink), var(--color-rose))',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {name.charAt(0)}
            </div>

            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-burgundy)', marginBottom: '0.2rem' }}>{name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{email}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span className="badge badge-rose" style={{ textTransform: 'capitalize' }}>{biologicalSeason}</span>
              <span className="badge badge-sage">{isHindi ? 'नियमितता:' : 'Regularity:'} {cycleRegularity}</span>
              <span className="badge badge-burgundy">{isHindi ? 'आयु लगभग' : 'Age ~'}{new Date().getFullYear() - birthYear}</span>
            </div>

            <div style={{ textAlign: 'left', background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
                {isHindi ? 'सक्रिय स्वास्थ्य लक्ष्य:' : 'Active Health Focus:'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {primaryConcern}
              </p>
            </div>
          </div>

          {/* Privacy statement */}
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(79, 114, 93, 0.08)', border: '1px solid var(--color-sage)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-deep-green)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
              <Icon name="shield" size={16} /> {isHindi ? 'डेटा संप्रभुता सुरक्षा' : 'Data Sovereignty Notice'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {isHindi
                ? 'आपकी स्वास्थ्य जानकारी सुरक्षित और गोपनीय है। धात्री आपकी मेडिकल हिस्ट्री किसी तीसरे पक्ष को नहीं बेचती। सेटिंग्स में पूरा एक्सपोर्ट उपलब्ध है।'
                : 'Your physiological markers are treated as protected health information. Dhatri does not monetize your medical history. You have full export and purge capabilities in Settings.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
