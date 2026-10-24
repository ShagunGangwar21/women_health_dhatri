import { SymptomLog } from '../models/SymptomLog.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

export const getSymptoms = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { startDate, endDate, category } = req.query;

    let symptoms = [];
    if (isMongoConnected) {
      const query = { userId };
      if (category) query.category = category;
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }
      symptoms = await SymptomLog.find(query).sort({ date: -1 });
    } else {
      symptoms = fallbackStore.find('symptoms', { userId }).sort((a, b) => new Date(b.date) - new Date(a.date));
      if (category) {
        symptoms = symptoms.filter(s => s.category === category);
      }
      if (startDate && endDate) {
        symptoms = symptoms.filter(s => s.date >= startDate && s.date <= endDate);
      }
    }

    // Compute simple category distribution
    const distribution = {};
    for (const item of symptoms) {
      distribution[item.category] = (distribution[item.category] || 0) + 1;
    }

    res.json({
      success: true,
      symptoms,
      distribution,
      totalLogs: symptoms.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve symptoms.' });
  }
};

const categoryMap = {
  cramps: 'cramps',
  pelvic_cramps: 'cramps',
  fatigue: 'fatigue',
  low_energy: 'fatigue',
  migraine: 'headache',
  headache: 'headache',
  bloating: 'bloating',
  mood: 'mood_swings',
  mood_swings: 'mood_swings',
  breast_tenderness: 'breast_tenderness',
  acne: 'acne',
  hot_flash: 'hot_flashes',
  hot_flashes: 'hot_flashes',
  Physical: 'cramps',
  Energy: 'fatigue',
  Neurological: 'headache',
  Digestive: 'bloating',
  Emotional: 'mood_swings',
  Skin: 'acne',
  Vasomotor: 'hot_flashes'
};

const parseDurationHours = (duration, durationHours) => {
  if (durationHours && !isNaN(Number(durationHours))) {
    return Number(durationHours);
  }
  if (duration === 'fleeting') return 1;
  if (duration === 'moderate') return 4;
  if (duration === 'all_day') return 12;
  if (duration === 'multi_day') return 24;
  return 4;
};

const prepareSymptomDoc = (userId, item, defaultDate, defaultPhase) => {
  const date = item.date || defaultDate;
  const name = item.name || item.label || item.category || 'Symptom';
  const rawCategory = item.category || item.id || name;
  const category = categoryMap[rawCategory] || categoryMap[name] || rawCategory || 'other';
  const phase = item.cyclePhase || item.cyclePhaseAtLog || defaultPhase || 'unknown';
  const duration = item.duration || 'moderate';
  const durationHours = parseDurationHours(duration, item.durationHours);
  const severity = item.severity ? Math.min(Math.max(Number(item.severity), 1), 5) : 2;

  return {
    userId,
    date,
    name,
    category,
    severity,
    duration,
    durationHours,
    cyclePhase: phase,
    cyclePhaseAtLog: phase,
    contextTags: Array.isArray(item.contextTags) ? item.contextTags : [],
    notes: item.notes || ''
  };
};

export const logSymptom = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const items = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : Array.isArray(req.body)
      ? req.body
      : null;

    if (items) {
      if (items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one symptom must be selected.' });
      }
      const defaultDate = req.body.date || new Date().toISOString().split('T')[0];
      const defaultPhase = req.body.cyclePhase || req.body.cyclePhaseAtLog || 'unknown';

      const docsToInsert = items.map(item => prepareSymptomDoc(userId, item, defaultDate, defaultPhase));

      let createdList = [];
      if (isMongoConnected) {
        createdList = await SymptomLog.insertMany(docsToInsert);
      } else {
        createdList = docsToInsert.map(doc => fallbackStore.insert('symptoms', doc));
      }

      return res.status(201).json({
        success: true,
        count: createdList.length,
        symptoms: createdList,
        message: `${createdList.length} symptom signal(s) successfully recorded.`
      });
    }

    // Single symptom entry handling
    const { date, category, name, cyclePhase, cyclePhaseAtLog } = req.body;
    if (!date || (!category && !name)) {
      return res.status(400).json({ success: false, message: 'Date and category or symptom name are required.' });
    }

    const docData = prepareSymptomDoc(userId, req.body, date, cyclePhase || cyclePhaseAtLog);

    let created;
    if (isMongoConnected) {
      created = await SymptomLog.create(docData);
    } else {
      created = fallbackStore.insert('symptoms', docData);
    }

    res.status(201).json({ success: true, symptom: created, message: 'Symptom recorded.' });
  } catch (err) {
    console.error('Error logging symptom:', err);
    res.status(500).json({ success: false, message: 'Failed to log symptom: ' + err.message });
  }
};

export const updateSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const updates = req.body;

    let updated;
    if (isMongoConnected) {
      updated = await SymptomLog.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    } else {
      updated = fallbackStore.findByIdAndUpdate('symptoms', id, updates);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Symptom log not found.' });
    }

    res.json({ success: true, symptom: updated, message: 'Symptom updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update symptom.' });
  }
};

export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (isMongoConnected) {
      const deleted = await SymptomLog.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ success: false, message: 'Symptom not found.' });
    } else {
      fallbackStore.findByIdAndDelete('symptoms', id);
    }

    res.json({ success: true, message: 'Symptom removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete symptom.' });
  }
};
