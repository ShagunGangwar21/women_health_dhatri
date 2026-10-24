import mongoose from 'mongoose';

const healthReportSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  category: {
    type: String,
    default: 'Complete Blood Count (CBC)'
  },
  labName: { type: String, default: '' },
  fileType: { type: String, default: 'application/pdf' },
  fileName: { type: String, default: 'report.pdf' },
  fileSize: { type: Number, default: 0 },
  fileData: { type: String, default: '' }, // Data URL or base64
  
  // Structured Extracted Lab Biomarkers (Clearly flagged whether manual, extracted, or observed)
  biomarkers: [{
    name: { type: String, required: true },       // e.g. "Ferritin", "TSH", "Hemoglobin"
    value: { type: Number, required: true },      // e.g. 18
    unit: { type: String, required: true },       // e.g. "ng/mL", "mIU/L"
    referenceRange: { type: String, default: '' },// e.g. "12 - 150 ng/mL"
    status: {
      type: String,
      enum: ['optimal', 'normal', 'borderline', 'low', 'high', 'review_needed'],
      default: 'normal'
    },
    clinicalNote: { type: String, default: '' }
  }],
  
  doctorSummary: { type: String, default: '' },
  patientNotes: { type: String, default: '' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const HealthReport = mongoose.model('HealthReport', healthReportSchema);
