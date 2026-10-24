import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  category: {
    type: String,
    default: 'Hydration'
  },
  targetValue: { type: Number, default: 8 },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: 'glasses' },
  frequency: { type: String, default: 'daily' },
  streakDays: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Goal = mongoose.model('Goal', goalSchema);
