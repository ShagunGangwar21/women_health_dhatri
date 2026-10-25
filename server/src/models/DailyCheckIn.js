import mongoose from 'mongoose';

const dailyCheckInSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  mood: {
    type: String,
    enum: ['grounded', 'happy', 'calm', 'drained', 'anxious', 'irritable', 'sad'],
    default: 'grounded'
  },
  moodScore: { type: Number, min: 1, max: 5, default: 3 },
  sleepHours: { type: Number, min: 0, max: 24, default: 7 },
  sleepQuality: {
    type: String,
    enum: ['restful', 'interrupted', 'restless', 'deep', 'insomnia'],
    default: 'restful'
  },
  energyLevel: { type: Number, min: 1, max: 5, default: 3 },
  hydrationGlasses: { type: Number, min: 0, max: 20, default: 6 },
  nutritionScore: { type: Number, min: 1, max: 5, default: 3 }, // 1 (poor/skipped) to 5 (balanced/nourishing)
  nutritionNote: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

export const DailyCheckIn = mongoose.model('DailyCheckIn', dailyCheckInSchema);
