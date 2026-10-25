import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  
  // Biological & Wellness Baseline
  birthYear: { type: Number, default: 2000 },
  biologicalSeason: {
    type: String,
    enum: ['persistent_concern', 'regulating_exploring', 'perimenopause', 'postpartum', 'longevity', 'other'],
    default: 'regulating_exploring'
  },
  primaryConcern: { type: String, default: 'Overall hormonal balance and wellness' },
  
  // Menstrual Settings (inclusive of non-menstruating & irregular users)
  isMenstruating: { type: Boolean, default: true },
  cycleRegularity: {
    type: String,
    enum: ['regular', 'irregular', 'not_applicable'],
    default: 'regular'
  },
  averageCycleLength: { type: Number, default: 28, min: 20, max: 60 },
  averagePeriodDuration: { type: Number, default: 5, min: 1, max: 15 },
  contraceptionType: {
    type: String,
    enum: ['none', 'oral_pill', 'hormonal_iud', 'copper_iud', 'implant', 'injection', 'other'],
    default: 'none'
  },
  
  // UI & Preferences
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  language: { type: String, enum: ['en', 'hi', 'hinglish'], default: 'en' },
  
  // Privacy & Consent
  dataSharingConsent: { type: Boolean, default: false },
  aiConsent: { type: Boolean, default: true },
  dismissedAlerts: [{ type: String }],
  alertPreferences: {
    enabled: { type: Boolean, default: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'realtime'], default: 'daily' }
  },
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
