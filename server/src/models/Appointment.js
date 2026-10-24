import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, index: true },
  providerName: { type: String, required: true },
  specialty: {
    type: String,
    default: 'Obstetrician & Gynecologist (OB/GYN)'
  },
  clinicName: { type: String, default: 'Women’s Wellness Clinic' },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // e.g. "10:30 AM"
  type: { type: String, default: 'in_person' },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  
  // Preparation & Doctor Questions
  visitReason: { type: String, default: '' },
  questionsForDoctor: [{
    question: { type: String },
    answered: { type: Boolean, default: false }
  }],
  prepChecklist: [{
    item: { type: String },
    completed: { type: Boolean, default: false }
  }],
  postVisitSummary: { type: String, default: '' },
  
  isDemoProvider: { type: Boolean, default: true } // Clearly labels simulated demo directory vs verified real providers
}, { timestamps: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
