import { HealthReport } from '../models/HealthReport.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { CycleLog } from '../models/CycleLog.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

export const getReports = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let reports = [];
    if (isMongoConnected) {
      reports = await HealthReport.find({ userId }).sort({ date: -1 });
    } else {
      reports = fallbackStore.find('reports', { userId }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Aggregate unique historical biomarkers for longitudinal trend charts
    const biomarkerHistory = {};
    for (const report of reports) {
      if (report.biomarkers && Array.isArray(report.biomarkers)) {
        for (const bio of report.biomarkers) {
          if (!biomarkerHistory[bio.name]) {
            biomarkerHistory[bio.name] = [];
          }
          biomarkerHistory[bio.name].push({
            date: report.date,
            value: bio.value,
            unit: bio.unit,
            referenceRange: bio.referenceRange,
            status: bio.status,
            reportTitle: report.title
          });
        }
      }
    }

    // Sort each biomarker's historical points chronologically
    for (const name in biomarkerHistory) {
      biomarkerHistory[name].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    res.json({
      success: true,
      reports,
      biomarkerHistory,
      totalReports: reports.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
};

export const uploadReport = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, date, category, labName, fileType, fileName, fileSize, fileData, biomarkers, patientNotes } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and report date are required.' });
    }

    // File validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (fileType && !allowedTypes.includes(fileType)) {
      return res.status(400).json({ success: false, message: 'Supported formats are PDF, PNG, JPG, and WEBP.' });
    }

    // Parse structured biomarkers if provided
    let processedBiomarkers = [];
    if (biomarkers && Array.isArray(biomarkers)) {
      processedBiomarkers = biomarkers.map(b => ({
        name: b.name.trim(),
        value: Number(b.value),
        unit: b.unit || '',
        referenceRange: b.referenceRange || '',
        status: b.status || 'normal',
        clinicalNote: b.clinicalNote || ''
      }));
    }

    const finalCategory = category || req.body.reportType || 'Complete Blood Count (CBC)';
    const finalLab = labName || req.body.laboratory || '';
    const finalNotes = patientNotes || req.body.notes || '';

    let report;
    if (isMongoConnected) {
      report = await HealthReport.create({
        userId,
        title,
        date,
        category: finalCategory,
        labName: finalLab,
        fileType: fileType || 'application/pdf',
        fileName: fileName || 'health_report.pdf',
        fileSize: fileSize || 0,
        fileData: fileData || '',
        biomarkers: processedBiomarkers,
        doctorSummary: '',
        patientNotes: finalNotes,
        isVerified: false
      });
    } else {
      report = fallbackStore.insert('reports', {
        userId,
        title,
        date,
        category: finalCategory,
        labName: finalLab,
        fileType: fileType || 'application/pdf',
        fileName: fileName || 'health_report.pdf',
        fileSize: fileSize || 0,
        fileData: fileData || '',
        biomarkers: processedBiomarkers,
        doctorSummary: '',
        patientNotes: finalNotes,
        isVerified: false
      });
    }

    res.status(201).json({ success: true, report, message: 'Report uploaded and indexed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload report.' });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (isMongoConnected) {
      const deleted = await HealthReport.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ success: false, message: 'Report not found.' });
    } else {
      fallbackStore.findByIdAndDelete('reports', id);
    }

    res.json({ success: true, message: 'Report removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete report.' });
  }
};

// Generates a doctor-ready SBAR health summary for printing or PDF export
export const generateDoctorSummary = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;

    let reports = [];
    let symptoms = [];
    let cycles = [];

    if (isMongoConnected) {
      reports = await HealthReport.find({ userId }).sort({ date: -1 }).limit(10);
      symptoms = await SymptomLog.find({ userId }).sort({ date: -1 }).limit(10);
      cycles = await CycleLog.find({ userId }).sort({ startDate: -1 }).limit(5);
    } else {
      reports = fallbackStore.find('reports', { userId });
      symptoms = fallbackStore.find('symptoms', { userId });
      cycles = fallbackStore.find('cycles', { userId });
    }

    const recentSymptomsText = symptoms.length > 0
      ? symptoms.slice(0, 4).map(s => `${s.date}: ${s.name || s.category} (severity ${s.severity}/5)`).join('; ')
      : 'No acute symptoms recorded';

    const summary = {
      patientName: user.name,
      birthYear: user.birthYear,
      primaryConcern: user.primaryConcern || 'Longitudinal biological monitoring',
      menstrualStatus: user.isMenstruating ? `Regular (${user.averageCycleLength || 28}d cycle)` : 'Non-menstruating / Other',
      reportCount: reports.length,
      recentBiomarkerHighlights: reports.flatMap(r => r.biomarkers || []).slice(0, 8),
      recentSymptoms: symptoms.slice(0, 5),
      recentCycles: cycles.slice(0, 3),
      sbar: {
        situation: `Patient presents longitudinal review regarding: "${user.primaryConcern || 'General wellness and biomarker trajectory'}". Recent symptom signals: ${recentSymptomsText}.`,
        background: `Logged ${reports.length} diagnostic reports, ${symptoms.length} symptom logs, and ${cycles.length} cycle tracking events. Birth Year: ${user.birthYear}. Cycle length baseline: ${user.averageCycleLength || 28} days.`,
        assessmentReadyData: 'Biomarker trajectories and cyclical symptom clusters synthesized chronologically. Note: Not a diagnostic evaluation.',
        clinicianInquiries: [
          'Review 18-month longitudinal trend of ferritin and iron stores in relation to reported fatigue.',
          'Assess whether current cycle phase timing correlates with neuro-vascular or pelvic complaints.',
          'Determine if additional endocrine or metabolic screening is indicated based on historical variance.'
        ]
      },
      generatedAt: new Date().toISOString()
    };

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate summary.' });
  }
};
