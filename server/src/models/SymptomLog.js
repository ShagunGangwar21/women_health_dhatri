import mongoose from 'mongoose';

const symptomLogSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String, default: '' },
  category: {
    type: String,
    default: 'other'
  },
  severity: { type: Number, min: 1, max: 5, default: 2 }, // 1 (mild) to 5 (severe)
  duration: { type: String, default: 'moderate' },
  durationHours: { type: Number, default: 4 },
  cyclePhase: {
    type: String,
    default: 'unknown'
  },
  cyclePhaseAtLog: {
    type: String,
    default: 'unknown'
  },
  contextTags: [{ type: String }], // e.g. ["high_stress", "poor_sleep", "caffeine"]
  notes: { type: String, default: '' }
}, { timestamps: true });

export const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);
