import mongoose from 'mongoose';

const cycleLogSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, index: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, default: null },     // YYYY-MM-DD
  flowIntensity: {
    type: String,
    enum: ['spotting', 'light', 'medium', 'heavy', 'variable'],
    default: 'medium'
  },
  painLevel: { type: Number, min: 0, max: 10, default: 2 }, // 0 to 10 scale
  symptoms: [{ type: String }],
  notes: { type: String, default: '' },
  isEstimated: { type: Boolean, default: false } // Clearly marks estimated/projected vs actual logged
}, { timestamps: true });

export const CycleLog = mongoose.model('CycleLog', cycleLogSchema);
