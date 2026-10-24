import { connectDB, isMongoConnected, fallbackStore } from '../config/db.js';
import { User } from '../models/User.js';
import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { DailyCheckIn } from '../models/DailyCheckIn.js';
import { HealthReport } from '../models/HealthReport.js';
import { Appointment } from '../models/Appointment.js';
import { Goal } from '../models/Goal.js';

export const seedDatabase = async () => {
  console.log('🌸 [Seed] Checking and seeding initial demo environment...');

  const demoUserId = 'demo_user_dhatri';

  const demoCycles = [
    {
      userId: demoUserId,
      startDate: '2026-09-28',
      endDate: '2026-10-03',
      flowIntensity: 'medium',
      painLevel: 3,
      symptoms: ['Mild lower back cramps', 'Fatigue'],
      notes: 'Cycle started on day 29; smooth recovery by day 4.',
      isEstimated: false
    },
    {
      userId: demoUserId,
      startDate: '2026-08-30',
      endDate: '2026-09-04',
      flowIntensity: 'heavy',
      painLevel: 5,
      symptoms: ['Throbbing headache', 'Pelvic cramps', 'Bloating'],
      notes: 'Heavy flow on day 2. Took warm herbal tea.',
      isEstimated: false
    },
    {
      userId: demoUserId,
      startDate: '2026-08-01',
      endDate: '2026-08-06',
      flowIntensity: 'medium',
      painLevel: 2,
      symptoms: ['Slight mood dip'],
      notes: 'Normal 29-day cycle.',
      isEstimated: false
    }
  ];

  const demoSymptoms = [
    {
      userId: demoUserId,
      date: '2026-10-22',
      category: 'fatigue',
      severity: 3,
      durationHours: 6,
      cyclePhase: 'luteal',
      contextTags: ['poor_sleep', 'work_screen_time'],
      notes: 'Afternoon mental fog and heavy limbs.'
    },
    {
      userId: demoUserId,
      date: '2026-10-20',
      category: 'headache',
      severity: 4,
      durationHours: 5,
      cyclePhase: 'luteal',
      contextTags: ['high_stress'],
      notes: 'Left temple throbbing after lunch.'
    },
    {
      userId: demoUserId,
      date: '2026-10-15',
      category: 'bloating',
      severity: 2,
      durationHours: 4,
      cyclePhase: 'ovulatory',
      contextTags: ['dairy_meal'],
      notes: 'Mild abdominal distension.'
    },
    {
      userId: demoUserId,
      date: '2026-09-26',
      category: 'cramps',
      severity: 3,
      durationHours: 4,
      cyclePhase: 'luteal',
      contextTags: ['pre_menses'],
      notes: 'Pelvic heaviness 48 hours prior to bleed.'
    }
  ];

  const demoDaily = [
    {
      userId: demoUserId,
      date: '2026-10-24',
      mood: 'grounded',
      moodScore: 4,
      sleepHours: 7.5,
      sleepQuality: 'restful',
      energyLevel: 4,
      hydrationGlasses: 7,
      notes: 'Feeling balanced; morning herbal tea and walk.'
    },
    {
      userId: demoUserId,
      date: '2026-10-23',
      mood: 'calm',
      moodScore: 3,
      sleepHours: 6.8,
      sleepQuality: 'interrupted',
      energyLevel: 3,
      hydrationGlasses: 6,
      notes: 'Woke up once around 3 AM.'
    },
    {
      userId: demoUserId,
      date: '2026-10-22',
      mood: 'drained',
      moodScore: 2,
      sleepHours: 6.0,
      sleepQuality: 'restless',
      energyLevel: 2,
      hydrationGlasses: 5,
      notes: 'Work deadlines, late bedtime.'
    }
  ];

  const demoReports = [
    {
      userId: demoUserId,
      title: 'Comprehensive Metabolic & Iron Study',
      date: '2026-10-05',
      category: 'Complete Blood Count (CBC)',
      labName: 'Metropolis Healthcare Diagnostics',
      fileType: 'application/pdf',
      fileName: 'Priya_Iron_CBC_Oct2026.pdf',
      fileSize: 245000,
      biomarkers: [
        { name: 'Serum Ferritin', value: 18, unit: 'ng/mL', referenceRange: '12 - 150 ng/mL', status: 'low', clinicalNote: 'Sub-optimal for cellular vitality despite being in lab range.' },
        { name: 'Hemoglobin', value: 12.2, unit: 'g/dL', referenceRange: '12.0 - 15.5 g/dL', status: 'normal', clinicalNote: 'Low-normal margin.' },
        { name: 'TSH (Thyroid)', value: 2.1, unit: 'mIU/L', referenceRange: '0.4 - 4.2 mIU/L', status: 'optimal', clinicalNote: 'Euthyroid healthy function.' },
        { name: 'Vitamin D3 (25-OH)', value: 24, unit: 'ng/mL', referenceRange: '30 - 100 ng/mL', status: 'borderline', clinicalNote: 'Mild insufficiency common in indoor routines.' }
      ],
      patientNotes: 'Ordered by PCP following complaints of afternoon fatigue.'
    },
    {
      userId: demoUserId,
      title: 'Previous Routine Blood Panel (2025)',
      date: '2025-11-12',
      category: 'Complete Blood Count (CBC)',
      labName: 'Apollo Diagnostics',
      fileType: 'application/pdf',
      fileName: 'Priya_Annual_Checkup_Nov2025.pdf',
      fileSize: 198000,
      biomarkers: [
        { name: 'Serum Ferritin', value: 34, unit: 'ng/mL', referenceRange: '12 - 150 ng/mL', status: 'normal', clinicalNote: 'Down from 34 ng/mL in 2025 to 18 ng/mL in 2026 (18-month downward drift).' },
        { name: 'Hemoglobin', value: 13.0, unit: 'g/dL', referenceRange: '12.0 - 15.5 g/dL', status: 'normal', clinicalNote: 'Adequate red cell count.' },
        { name: 'TSH (Thyroid)', value: 1.9, unit: 'mIU/L', referenceRange: '0.4 - 4.2 mIU/L', status: 'optimal', clinicalNote: 'Healthy.' }
      ],
      patientNotes: 'Baseline checkup prior to switching work schedule.'
    }
  ];

  const demoAppointments = [
    {
      userId: demoUserId,
      providerName: 'Dr. Ananya Sen, MD',
      specialty: 'Obstetrician & Gynecologist (OB/GYN)',
      clinicName: 'Lotus Women’s Health Centre',
      date: '2026-10-30',
      time: '11:00 AM',
      type: 'in_person',
      status: 'upcoming',
      visitReason: 'Review 18-month ferritin drop and luteal phase fatigue patterns',
      questionsForDoctor: [
        { question: 'Given my ferritin dropped from 34 to 18 ng/mL, should we evaluate iron saturation and consider supplementation?', answered: false },
        { question: 'Do my luteal phase temporal headaches correlate with estrogen withdrawal?', answered: false }
      ],
      prepChecklist: [
        { item: 'Export Dhatri 3-Minute Doctor Dossier', completed: true },
        { item: 'Bring previous lab report PDFs on phone', completed: true },
        { item: 'Write down questions on menstrual flow volume', completed: false }
      ],
      isDemoProvider: true
    }
  ];

  const demoGoals = [
    { userId: demoUserId, title: 'Drink 8 glasses of water daily', category: 'Hydration', targetValue: 8, currentValue: 7, unit: 'glasses', streakDays: 6, isCompleted: false },
    { userId: demoUserId, title: '7.5+ hours of restorative sleep', category: 'Sleep Quality', targetValue: 8, currentValue: 7.5, unit: 'hours', streakDays: 4, isCompleted: true },
    { userId: demoUserId, title: 'Gentle 10-minute pelvic stretch', category: 'Movement & Pelvic Care', targetValue: 10, currentValue: 10, unit: 'mins', streakDays: 5, isCompleted: true },
    { userId: demoUserId, title: 'Screen-free evening wind down', category: 'Stress Relief', targetValue: 30, currentValue: 25, unit: 'mins', streakDays: 3, isCompleted: false }
  ];

  try {
    if (isMongoConnected) {
      const existingUser = await User.findById(demoUserId);
      if (!existingUser) {
        await User.create({
          _id: demoUserId,
          name: 'Priya Sharma',
          email: 'priya.sharma@dhatri.app',
          password: 'dhatri_secure_demo_password',
          birthYear: 1998,
          biologicalSeason: 'regulating_exploring',
          primaryConcern: 'Tracking luteal phase energy shifts & ferritin levels',
          isMenstruating: true,
          cycleRegularity: 'regular',
          averageCycleLength: 28,
          averagePeriodDuration: 5,
          theme: 'system',
          language: 'en'
        });
        await CycleLog.insertMany(demoCycles);
        await SymptomLog.insertMany(demoSymptoms);
        await DailyCheckIn.insertMany(demoDaily);
        await HealthReport.insertMany(demoReports);
        await Appointment.insertMany(demoAppointments);
        await Goal.insertMany(demoGoals);
        console.log('🌸 [Seed] MongoDB demo dataset seeded successfully!');
      }
    } else {
      const existingUser = fallbackStore.findOne('users', { _id: demoUserId });
      if (!existingUser) {
        fallbackStore.insert('users', {
          _id: demoUserId,
          id: demoUserId,
          name: 'Priya Sharma',
          email: 'priya.sharma@dhatri.app',
          password: 'dhatri_secure_demo_password',
          birthYear: 1998,
          biologicalSeason: 'regulating_exploring',
          primaryConcern: 'Tracking luteal phase energy shifts & ferritin levels',
          isMenstruating: true,
          cycleRegularity: 'regular',
          averageCycleLength: 28,
          averagePeriodDuration: 5,
          theme: 'system',
          language: 'en'
        });
        demoCycles.forEach(c => fallbackStore.insert('cycles', c));
        demoSymptoms.forEach(s => fallbackStore.insert('symptoms', s));
        demoDaily.forEach(d => fallbackStore.insert('daily', d));
        demoReports.forEach(r => fallbackStore.insert('reports', r));
        demoAppointments.forEach(a => fallbackStore.insert('appointments', a));
        demoGoals.forEach(g => fallbackStore.insert('goals', g));
        console.log('🌸 [Seed] Resilient local file storage demo dataset seeded successfully!');
      }
    }
  } catch (err) {
    console.warn('🌸 [Seed] Seed skipped or completed:', err.message);
  }
};
