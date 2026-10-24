import React, { useState } from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import DoctorDossierModal from '../components/DoctorDossierModal';
import NearbyHealthcareMap from '../components/NearbyHealthcareMap';
import Icon from '../components/Icon';

const DEMO_SPECIALISTS = [
  {
    id: 'sp1',
    name: 'Dr. Ananya Roy, MD, DGO',
    title: 'Consultant Obstetrician & Gynecologist',
    specialty: 'Reproductive Endocrinology & Endometriosis',
    experience: '14 years clinical experience',
    location: 'Apollo Cradle, Bangalore / Virtual Consult',
    rating: 4.9,
    reviewCount: 120,
    available: 'Tue, Thu, Sat'
  },
  {
    id: 'sp2',
    name: 'Dr. Sneha Pillai, MBBS, DNB',
    title: "Integrative Women's Health & Functional Medicine",
    specialty: 'Thyroid, PCOS & Micronutrient Deficiencies',
    experience: '11 years clinical practice',
    location: 'Fortis Health, Mumbai / Virtual Consult',
    rating: 4.8,
    reviewCount: 85,
    available: 'Mon, Wed, Fri'
  },
  {
    id: 'sp3',
    name: 'Dr. Meera Nambiar, MPT',
    title: 'Pelvic Floor Physiotherapist & Rehabilitation Specialist',
    specialty: 'Pelvic Pain, Hypertonicity & Postpartum Recovery',
    experience: '9 years clinical practice',
    location: 'Aster CMI, Delhi / Virtual Consult',
    rating: 4.9,
    reviewCount: 94,
    available: 'Mon to Thu'
  }
];

export default function CareDashboard() {
  const { appointments = [], createAppointment, cancelAppointment } = useHealthData();
  const { t, formatDate } = useLanguage();

  const [showDossier, setShowDossier] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [specialty, setSpecialty] = useState('Gynecology & Obstetrics');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);

  // Cancellation Modal State
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Today in YYYY-MM-DD for date input validation
  const todayStr = new Date().toISOString().split('T')[0];

  // Robust date formatting
  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return 'Date confirmed';
    if (formatDate) return formatDate(dateVal);
    const cleanStr = typeof dateVal === 'string' && dateVal.includes('T') ? dateVal.split('T')[0] : String(dateVal);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return cleanStr;
  };

  // Checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Download / Print Doctor Dossier summary', done: true },
    { id: 2, text: 'Note down first day of last 3 menstrual cycles', done: true },
    { id: 3, text: 'Record current supplements (Iron, Vit D, Magnesium)', done: false },
    { id: 4, text: 'List specific triggers noticed during luteal phase', done: false },
  ]);

  const toggleChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field-level validations
    if (!providerName.trim()) {
      setErrorMsg('Please enter a healthcare provider or doctor name.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Please select a valid consultation date.');
      return;
    }
    if (!appointmentTime) {
      setErrorMsg('Please choose a preferred time slot.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please describe the primary reason for consultation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const questionsArray = preparationNotes.trim()
        ? preparationNotes.split('\n').map(q => q.trim()).filter(Boolean)
        : [];

      const payload = {
        providerName: providerName.trim(),
        specialty,
        clinicName: providerName.includes('/') ? providerName.split('/')[1].trim() : 'Clinic / Hospital',
        date: appointmentDate,
        appointmentDate: appointmentDate,
        time: appointmentTime,
        visitReason: reason.trim(),
        reason: reason.trim(),
        questionsForDoctor: questionsArray,
        type: 'in_person'
      };

      const result = await createAppointment(payload);
      if (result && result.success !== false) {
        setSuccessMsg(`Consultation confirmed with ${providerName.trim()} on ${formatDisplayDate(appointmentDate)}!`);
        setProviderName('');
        setAppointmentDate('');
        setReason('');
        setPreparationNotes('');
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setErrorMsg(result?.message || 'Failed to schedule appointment. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network or service error: ' + (err.message || 'Could not reach server'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (apt) => {
    setAppointmentToCancel(apt);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    setErrorMsg('');
    try {
      const aptId = appointmentToCancel._id || appointmentToCancel.id;
      const res = await cancelAppointment(aptId);
      if (res && res.success !== false) {
        setSuccessMsg(`Consultation with ${appointmentToCancel.providerName} was cancelled successfully.`);
        setAppointmentToCancel(null);
        setTimeout(() => setSuccessMsg(''), 5500);
      } else {
        setErrorMsg(res?.message || 'Failed to cancel appointment. Please retry.');
      }
    } catch (err) {
      setErrorMsg('Cancellation error: ' + (err.message || 'Could not complete request'));
      setAppointmentToCancel(null);
      setTimeout(() => setErrorMsg(''), 5500);
    } finally {
      setIsCancelling(false);
    }
  };

  const quickSelectProvider = (spec) => {
    setProviderName(spec.name);
    setSpecialty(spec.title);
    setReason(`Consultation regarding ${spec.specialty}`);
    document.getElementById('schedule-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectNearbyFacility = (fac) => {
    setProviderName(fac.name);
    setSpecialty(fac.type === 'hospital' ? 'Hospital Care / Multi-Specialty' : fac.type === 'clinic' ? 'Outpatient Clinic' : fac.type === 'pharmacy' ? 'Pharmacy Consultation' : 'General Practice / Specialist');
    setReason(`Consultation at ${fac.name} (${fac.address})`);
    document.getElementById('schedule-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeAppointments = appointments.filter(apt => apt.status !== 'cancelled');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  return (
    <div className="care-dashboard-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-rose" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('care.badge', null, 'Continuum Care Navigation')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>
            {t('care.title', null, 'Clinical Care & Appointments')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px' }}>
            {t('care.subtitle', null, 'Bridge personal health logs with professional medical evaluations. Schedule visits, build consultation checklists, and export clinical dossiers.')}
          </p>
        </div>
        <button
          onClick={() => setShowDossier(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <Icon name="file" size={18} />
          {t('reports.generateDossier', null, 'View Doctor Dossier')}
        </button>
      </div>

      {/* Real-time Nearby Healthcare Facility Map (OpenStreetMap) */}
      <NearbyHealthcareMap onSelectProvider={handleSelectNearbyFacility} />

      {/* Main Care Layout: Upcoming Visits + Schedule Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Schedule Form */}
        <div id="schedule-form-section" className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
            <Icon name="calendar" size={20} color="var(--color-rose)" /> {t('care.scheduleTitle', null, 'Schedule Clinical Consultation')}
          </h2>

          {successMsg && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--text-sage)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-sage)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(217, 111, 137, 0.15)', color: 'var(--color-primary-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-primary-rose)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('care.providerLabel', null, 'Healthcare Provider / Doctor Name *')}
              </label>
              <input
                id="provider-name-input"
                type="text"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder={t('care.providerPlaceholder', null, 'E.g., Dr. Ananya Roy / Cloudnine Hospital')}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-card)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('care.specialtyLabel', null, 'Specialty *')}
                </label>
                <select
                  id="specialty-select"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-card)', background: 'var(--input-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                  <option value="Endocrinology">Endocrinology (PCOS / Thyroid)</option>
                  <option value="Pelvic Floor Physical Therapy">Pelvic Floor Therapy</option>
                  <option value="Functional / Clinical Nutrition">Clinical Nutrition</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('care.dateLabel', null, 'Consultation Date *')}
                </label>
                <input
                  id="appointment-date-input"
                  type="date"
                  required
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-card)', background: 'var(--input-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {t('care.timeLabel', null, 'Preferred Time Slot *')}
                </label>
                <select
                  id="appointment-time-select"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-card)', background: 'var(--input-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('care.reasonLabel', null, 'Primary Reason for Consultation *')}
              </label>
              <input
                id="appointment-reason-input"
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('care.reasonPlaceholder', null, 'E.g., Investigate persistent low ferritin & luteal migraines')}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-card)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('care.notesLabel', null, 'Doctor Questions / Preparation Notes')}
              </label>
              <textarea
                id="appointment-notes-input"
                rows="3"
                value={preparationNotes}
                onChange={(e) => setPreparationNotes(e.target.value)}
                placeholder={t('care.notesPlaceholder', null, 'Specific questions to ask during examination...')}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-card)', background: 'var(--input-bg)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            </div>

            <button
              id="book-visit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {isSubmitting ? t('care.bookingVisitBtn', null, 'Booking Visit...') : t('care.bookVisitBtn', null, 'Book Visit')}
            </button>
          </form>
        </div>

        {/* Existing Appointments & Preparation Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Appointments */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
                <Icon name="clock" size={20} color="var(--color-rose)" /> {t('care.scheduledVisitsTitle', null, 'Scheduled Visits')} ({activeAppointments.length})
              </h2>
              {cancelledAppointments.length > 0 && (
                <button
                  id="toggle-cancelled-btn"
                  type="button"
                  onClick={() => setShowCancelled(!showCancelled)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {showCancelled ? t('care.hideCancelled', null, 'Hide Cancelled') : `${t('care.showCancelled', null, 'Show Cancelled')} (${cancelledAppointments.length})`}
                </button>
              )}
            </div>

            {activeAppointments.length === 0 ? (
              <p id="no-upcoming-msg" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1.5rem 0' }}>
                {t('care.noUpcoming', null, 'No upcoming visits scheduled. Use the form or specialist directory below to book.')}
              </p>
            ) : (
              <div id="scheduled-visits-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {activeAppointments.map((apt) => {
                  const aptId = apt._id || apt.id;
                  const displayDate = formatDisplayDate(apt.date || apt.appointmentDate);

                  return (
                    <div
                      key={aptId}
                      id={`appointment-card-${aptId}`}
                      style={{
                        padding: '1.1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-card)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {apt.providerName}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-primary-rose)', fontWeight: 600 }}>
                          {apt.specialty}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>📅 {displayDate}</span>
                          {apt.time && <span>• ⏰ {apt.time}</span>}
                        </div>
                        {(apt.visitReason || apt.reason) && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Reason: {apt.visitReason || apt.reason}
                          </div>
                        )}
                      </div>
                      <button
                        id={`cancel-btn-${aptId}`}
                        type="button"
                        onClick={() => handleCancelClick(apt)}
                        className="btn btn-outline"
                        style={{
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.78rem',
                          color: 'var(--color-primary-rose)',
                          borderColor: 'var(--color-primary-rose)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {t('care.cancelBtn', null, 'Cancel')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cancelled visits section (collapsible) */}
            {showCancelled && cancelledAppointments.length > 0 && (
              <div id="cancelled-visits-list" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Cancelled Consultations ({cancelledAppointments.length})
                </div>
                {cancelledAppointments.map((apt) => {
                  const aptId = apt._id || apt.id;
                  const displayDate = formatDisplayDate(apt.date || apt.appointmentDate);

                  return (
                    <div
                      key={aptId}
                      id={`cancelled-card-${aptId}`}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-accent-soft)',
                        border: '1px dashed var(--border-card)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: 0.85
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {apt.providerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {apt.specialty} • {displayDate}
                        </div>
                      </div>
                      <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(217, 111, 137, 0.2)', color: 'var(--color-primary-rose)' }}>
                        Cancelled
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Checklist */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
              <Icon name="check-square" size={18} color="var(--color-deep-green)" /> Clinical Visit Readiness Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {checklist.map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.88rem',
                    color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: item.done ? 'line-through' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklist(item.id)}
                    style={{ accentColor: 'var(--color-deep-green)', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  {item.text}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Specialist Directory */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
              <Icon name="users" size={20} color="var(--color-rose)" /> Women's Health Specialist Network
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              *Curated clinical partner network for reproductive endocrinology, pelvic therapy, and functional medicine.
            </p>
          </div>
          <span className="badge badge-sage">Verified Practice Partners</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {DEMO_SPECIALISTS.map((spec) => (
            <div
              key={spec.id}
              className="card card-hover"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)', margin: 0, fontWeight: 700 }}>{spec.name}</h3>
                  {spec.rating ? (
                    <span style={{ fontSize: '0.8rem', color: '#E59866', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      ★ {spec.rating.toFixed(1)}
                      {spec.reviewCount ? ` (${spec.reviewCount})` : ''}
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-primary-rose)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {spec.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  🎯 <strong>Focus:</strong> {spec.specialty}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  📍 {spec.location}
                </div>
              </div>

              <button
                type="button"
                onClick={() => quickSelectProvider(spec)}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem' }}
              >
                Select for Consultation
              </button>
            </div>
          ))}
        </div>
      </div>

      {showDossier && <DoctorDossierModal onClose={() => setShowDossier(false)} />}

      {/* Appointment Cancellation Confirmation Modal */}
      {appointmentToCancel && (
        <div
          id="cancel-appointment-modal"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.68)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="calendar" size={20} color="var(--color-primary-rose)" />
              Cancel Scheduled Visit?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to cancel your scheduled consultation with <strong style={{ color: 'var(--text-primary)' }}>{appointmentToCancel.providerName}</strong> on <strong style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(appointmentToCancel.date || appointmentToCancel.appointmentDate)}</strong> at <strong style={{ color: 'var(--text-primary)' }}>{appointmentToCancel.time}</strong>?
            </p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              ℹ️ This consultation will be moved to your cancelled consultations archive and can be viewed anytime under &quot;Show Cancelled&quot;.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                id="cancel-modal-dismiss-btn"
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                disabled={isCancelling}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.1rem', fontSize: '0.88rem' }}
              >
                Keep Appointment
              </button>
              <button
                id="confirm-cancel-visit-btn"
                type="button"
                onClick={confirmCancelAppointment}
                disabled={isCancelling}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.88rem',
                  background: 'var(--color-primary-rose)',
                  borderColor: 'var(--color-primary-rose)',
                  color: '#FFFFFF'
                }}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
