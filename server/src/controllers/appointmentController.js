import { Appointment } from '../models/Appointment.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

// Verified Demo Directory of Medical Specialists (Explicitly labeled as illustrative demo network)
const DEMO_PROVIDERS = [
  {
    id: 'prov_1',
    name: 'Dr. Ananya Sen, MD',
    specialty: 'Obstetrician & Gynecologist (OB/GYN)',
    clinicName: 'Lotus Women’s Health Centre',
    experienceYears: 14,
    education: 'MBBS, MS (OBG) — All India Institute of Medical Sciences',
    location: 'Bangalore, KA',
    rating: 4.9,
    consultationModes: ['In-Person', 'Video Consultation'],
    focusAreas: ['PCOS Management', 'Endometriosis', 'Perimenopause Transition'],
    isDemoProvider: true
  },
  {
    id: 'prov_2',
    name: 'Dr. Meera Nambiar, MD, DM',
    specialty: 'Endocrinologist',
    clinicName: 'Apex Hormone & Metabolic Care',
    experienceYears: 12,
    education: 'MD (Internal Medicine), DM (Endocrinology)',
    location: 'Mumbai, MH',
    rating: 4.8,
    consultationModes: ['In-Person', 'Video Consultation'],
    focusAreas: ['Thyroid Disorders', 'Insulin Resistance', 'Adrenal Fatigue'],
    isDemoProvider: true
  },
  {
    id: 'prov_3',
    name: 'Dr. Sunita Rao, PT, DPT',
    specialty: 'Pelvic Floor Physical Therapist',
    clinicName: 'Core Vitality Pelvic Wellness',
    experienceYears: 9,
    education: 'MPT (Obstetrics & Gynecology), Certified Pelvic Rehab',
    location: 'Delhi NCR',
    rating: 4.9,
    consultationModes: ['In-Person'],
    focusAreas: ['Pelvic Pain', 'Postpartum Core Recovery', 'Vaginismus Care'],
    isDemoProvider: true
  },
  {
    id: 'prov_4',
    name: 'Riddhi Patel, MSc, RD',
    specialty: 'Nutritionist / Dietitian',
    clinicName: 'Dhatri Clinical Nutrition',
    experienceYears: 8,
    education: 'MSc Clinical Nutrition, Registered Dietitian (IDA)',
    location: 'Hyderabad, TS',
    rating: 4.9,
    consultationModes: ['Video Consultation'],
    focusAreas: ['Anti-Inflammatory Nutrition', 'Cycle Pacing', 'Gut Microbiome'],
    isDemoProvider: true
  }
];

export const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let appointments = [];
    if (isMongoConnected) {
      appointments = await Appointment.find({ userId }).sort({ date: 1, time: 1 });
    } else {
      appointments = fallbackStore.find('appointments', { userId }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    res.json({
      success: true,
      appointments,
      totalCount: appointments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      providerName,
      doctorName,
      specialty,
      clinicName,
      date,
      appointmentDate,
      time,
      appointmentTime,
      type,
      mode,
      visitReason,
      reason,
      notes,
      questionsForDoctor,
      prepChecklist
    } = req.body;

    const finalProviderName = (providerName || doctorName || '').trim();
    const finalSpecialty = (specialty || '').trim();
    const rawDate = (date || appointmentDate || '').trim();
    const finalDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    const finalTime = (time || appointmentTime || '').trim();
    const finalReason = (visitReason || reason || notes || '').trim();
    const rawType = (type || mode || 'in_person').toLowerCase().replace('-', '_');

    // 1. Validate required fields
    if (!finalProviderName) {
      return res.status(400).json({ success: false, message: 'Healthcare provider / doctor name is required.' });
    }
    if (!finalSpecialty) {
      return res.status(400).json({ success: false, message: 'Medical specialty is required.' });
    }
    if (!finalDate) {
      return res.status(400).json({ success: false, message: 'Consultation date is required.' });
    }

    // 2. Validate date format (YYYY-MM-DD) and reject past dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(finalDate) || isNaN(new Date(finalDate).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid consultation date format. Expected YYYY-MM-DD.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (finalDate < todayStr) {
      return res.status(400).json({ success: false, message: 'Consultation date cannot be in the past. Please select today or a future date.' });
    }

    // 3. Validate preferred time slot and consultation reason
    if (!finalTime) {
      return res.status(400).json({ success: false, message: 'Preferred consultation time slot is required.' });
    }
    if (!finalReason) {
      return res.status(400).json({ success: false, message: 'Consultation reason is required.' });
    }

    const defaultChecklist = [
      { item: 'Bring previous lab reports (CBC, Thyroid, Hormones)', completed: false },
      { item: 'Prepare list of current supplements and medications', completed: false },
      { item: 'Review cycle dates and recent symptom timeline', completed: false },
      { item: 'Print or export Dhatri 3-Minute Doctor Dossier', completed: false }
    ];

    const defaultQuestions = [
      { question: 'Do my symptom patterns suggest a cyclical hormonal or metabolic correlation?', answered: false },
      { question: 'Should we re-test ferritin, thyroid, or vitamin D levels at this stage?', answered: false }
    ];

    let appointment;
    if (isMongoConnected) {
      appointment = await Appointment.create({
        userId,
        providerName: finalProviderName,
        specialty: finalSpecialty,
        clinicName: clinicName || 'Specialist Clinic',
        date: finalDate,
        time: finalTime,
        type: rawType,
        status: 'upcoming',
        visitReason: finalReason,
        questionsForDoctor: questionsForDoctor && questionsForDoctor.length > 0 ? questionsForDoctor : defaultQuestions,
        prepChecklist: prepChecklist && prepChecklist.length > 0 ? prepChecklist : defaultChecklist,
        isDemoProvider: true
      });
    } else {
      appointment = fallbackStore.insert('appointments', {
        userId,
        providerName: finalProviderName,
        specialty: finalSpecialty,
        clinicName: clinicName || 'Specialist Clinic',
        date: finalDate,
        time: finalTime,
        type: rawType,
        status: 'upcoming',
        visitReason: finalReason,
        questionsForDoctor: questionsForDoctor && questionsForDoctor.length > 0 ? questionsForDoctor : defaultQuestions,
        prepChecklist: prepChecklist && prepChecklist.length > 0 ? prepChecklist : defaultChecklist,
        isDemoProvider: true
      });
    }

    res.status(201).json({
      success: true,
      appointment,
      message: `Consultation with ${finalProviderName} successfully scheduled for ${finalDate}.`
    });
  } catch (err) {
    console.error('createAppointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to create appointment: ' + err.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const updates = req.body;

    let updated;
    if (isMongoConnected) {
      updated = await Appointment.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    } else {
      updated = fallbackStore.findByIdAndUpdate('appointments', id, updates);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized.' });
    }

    res.json({ success: true, appointment: updated, message: 'Appointment updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update appointment.' });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }

    let appointment;
    if (isMongoConnected) {
      appointment = await Appointment.findOne({ _id: id, userId });
    } else {
      const found = fallbackStore.findById('appointments', id);
      if (found && found.userId === userId) {
        appointment = found;
      }
    }

    // 1. Verify existence and ownership
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or you do not have permission to cancel this appointment.'
      });
    }

    // 2. Prevent repeated cancellation
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been cancelled.'
      });
    }

    // 3. Update status to 'cancelled' without deleting
    if (isMongoConnected) {
      appointment.status = 'cancelled';
      await appointment.save();
    } else {
      appointment = fallbackStore.findByIdAndUpdate('appointments', id, { status: 'cancelled' });
    }

    res.json({
      success: true,
      message: `Appointment with ${appointment.providerName} successfully marked as cancelled.`,
      appointment
    });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment: ' + err.message });
  }
};

export const getProviderDirectory = async (req, res) => {
  const { search, specialty } = req.query;
  let filtered = [...DEMO_PROVIDERS];

  if (specialty) {
    filtered = filtered.filter(p => p.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.specialty.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.focusAreas.some(f => f.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    providers: filtered,
    notice: 'Demo directory for testing and consultation preparation. Not affiliated with real clinic bookings.'
  });
};
