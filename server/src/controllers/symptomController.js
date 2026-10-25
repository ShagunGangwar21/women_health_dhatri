import { SymptomLog } from '../models/SymptomLog.js';
import { DailyCheckIn } from '../models/DailyCheckIn.js';
import { CycleLog } from '../models/CycleLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { evaluateClinicalSafety, ALERT_LEVELS } from '../utils/clinicalAlerts.js';
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

      // Prevent duplicate entries for the same user, date, and category/name
      let savedList = [];
      if (isMongoConnected) {
        for (const doc of docsToInsert) {
          const updated = await SymptomLog.findOneAndUpdate(
            { userId, date: doc.date, category: doc.category },
            { $set: doc },
            { upsert: true, new: true }
          );
          savedList.push(updated);
        }
      } else {
        for (const doc of docsToInsert) {
          const existing = fallbackStore.findOne('symptoms', { userId, date: doc.date, category: doc.category });
          if (existing) {
            savedList.push(fallbackStore.findByIdAndUpdate('symptoms', existing._id, doc));
          } else {
            savedList.push(fallbackStore.insert('symptoms', doc));
          }
        }
      }

      return res.status(201).json({
        success: true,
        count: savedList.length,
        symptoms: savedList,
        message: `${savedList.length} symptom signal(s) successfully recorded without duplicates.`
      });
    }

    // Single symptom entry handling with duplicate prevention
    const { date, category, name, cyclePhase, cyclePhaseAtLog } = req.body;
    if (!date || (!category && !name)) {
      return res.status(400).json({ success: false, message: 'Date and category or symptom name are required.' });
    }

    const docData = prepareSymptomDoc(userId, req.body, date, cyclePhase || cyclePhaseAtLog);

    let saved;
    if (isMongoConnected) {
      saved = await SymptomLog.findOneAndUpdate(
        { userId, date: docData.date, category: docData.category },
        { $set: docData },
        { upsert: true, new: true }
      );
    } else {
      const existing = fallbackStore.findOne('symptoms', { userId, date: docData.date, category: docData.category });
      if (existing) {
        saved = fallbackStore.findByIdAndUpdate('symptoms', existing._id, docData);
      } else {
        saved = fallbackStore.insert('symptoms', docData);
      }
    }

    res.status(201).json({ success: true, symptom: saved, message: 'Symptom recorded without duplicates.' });
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

/**
 * Helper to generate an array of YYYY-MM-DD date strings between start and end inclusive
 */
const getDateRangeArray = (startDateStr, endDateStr) => {
  const dates = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

/**
 * Determine trend direction for a numeric series (skipping nulls)
 */
const calculateMetricTrend = (values) => {
  const clean = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (clean.length < 2) return { direction: 'insufficient_data', avg: clean[0] || null };

  const firstHalf = clean.slice(0, Math.floor(clean.length / 2));
  const secondHalf = clean.slice(Math.floor(clean.length / 2));
  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = avg2 - avg1;
  const totalAvg = +(clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(1);

  let direction = 'stable';
  if (diff >= 0.5) direction = 'increasing';
  else if (diff <= -0.5) direction = 'decreasing';
  else {
    // Check variance for fluctuation
    const max = Math.max(...clean);
    const min = Math.min(...clean);
    if (max - min >= 2.0) direction = 'fluctuating';
  }

  return { direction, avg: totalAvg, count: clean.length, min: Math.min(...clean), max: Math.max(...clean) };
};

/**
 * GET /api/symptoms/trends
 * Aggregates symptoms, daily metrics, and cycle history over selectable timeframes
 */
export const getSymptomTrends = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { timeRange = '30d', startDate: qStart, endDate: qEnd, symptomFilter } = req.query;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let startDateStr;
    let endDateStr = todayStr;

    if (qStart && qEnd) {
      startDateStr = qStart;
      endDateStr = qEnd;
    } else if (timeRange === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      startDateStr = d.toISOString().split('T')[0];
    } else if (timeRange === '90d' || timeRange === '3m') {
      const d = new Date();
      d.setDate(d.getDate() - 89);
      startDateStr = d.toISOString().split('T')[0];
    } else {
      // 30 days default
      const d = new Date();
      d.setDate(d.getDate() - 29);
      startDateStr = d.toISOString().split('T')[0];
    }

    // 1. Fetch user's complete symptom history
    let allSymptoms = [];
    let allDaily = [];
    let allCycles = [];
    let allReports = [];

    if (isMongoConnected) {
      allSymptoms = await SymptomLog.find({ userId }).sort({ date: 1 });
      allDaily = await DailyCheckIn.find({ userId }).sort({ date: 1 });
      allCycles = await CycleLog.find({ userId }).sort({ startDate: 1 });
      allReports = await HealthReport.find({ userId }).sort({ date: 1 });
    } else {
      allSymptoms = (fallbackStore.find('symptoms', { userId }) || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      allDaily = (fallbackStore.find('daily', { userId }) || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      allCycles = (fallbackStore.find('cycles', { userId }) || []).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      allReports = (fallbackStore.find('reports', { userId }) || []).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // 2. Separate into Historical Baseline vs Current Window
    const windowSymptoms = allSymptoms.filter(s => s.date >= startDateStr && s.date <= endDateStr);
    const baselineSymptoms = allSymptoms.filter(s => s.date < startDateStr);

    // Compute Baseline Per Category
    const baselineCategoryMap = {};
    baselineSymptoms.forEach(s => {
      const cat = s.category || 'other';
      if (!baselineCategoryMap[cat]) {
        baselineCategoryMap[cat] = { totalSev: 0, count: 0, dates: new Set() };
      }
      baselineCategoryMap[cat].totalSev += Number(s.severity || 2);
      baselineCategoryMap[cat].count += 1;
      baselineCategoryMap[cat].dates.add(s.date);
    });

    // Compute Window Per Category
    const windowCategoryMap = {};
    windowSymptoms.forEach(s => {
      const cat = s.category || 'other';
      if (!windowCategoryMap[cat]) {
        windowCategoryMap[cat] = { totalSev: 0, count: 0, dates: new Set(), logs: [] };
      }
      windowCategoryMap[cat].totalSev += Number(s.severity || 2);
      windowCategoryMap[cat].count += 1;
      windowCategoryMap[cat].dates.add(s.date);
      windowCategoryMap[cat].logs.push(s);
    });

    // 3. Compare Recent Symptoms with Historical Baseline
    const symptomAnalysis = [];
    const allCategories = new Set([...Object.keys(windowCategoryMap), ...Object.keys(baselineCategoryMap)]);

    allCategories.forEach(cat => {
      if (symptomFilter && symptomFilter !== 'all' && symptomFilter !== cat) return;

      const baseData = baselineCategoryMap[cat];
      const winData = windowCategoryMap[cat];

      const baselineDays = baseData ? baseData.dates.size : 0;
      const baselineAvgSev = baseData && baseData.count > 0 ? +(baseData.totalSev / baseData.count).toFixed(1) : null;

      const currentDays = winData ? winData.dates.size : 0;
      const currentAvgSev = winData && winData.count > 0 ? +(winData.totalSev / winData.count).toFixed(1) : null;

      if (!winData && !baseData) return;

      // Status determination
      let status = 'stable';
      let summaryText = '';
      const catLabel = cat.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

      // Check consecutive days in window
      let maxConsecutive = 0;
      if (winData) {
        const sortedDates = Array.from(winData.dates).sort();
        let currStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1]);
          const cur = new Date(sortedDates[i]);
          const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currStreak++;
            if (currStreak > maxConsecutive) maxConsecutive = currStreak;
          } else {
            currStreak = 1;
          }
        }
        if (sortedDates.length === 1) maxConsecutive = 1;
      }

      if (winData && !baseData) {
        status = 'new';
        summaryText = `New symptom signal: ${catLabel} reported on ${currentDays} day(s) this period (average severity: ${currentAvgSev}/5).`;
      } else if (maxConsecutive >= 3 || currentDays >= 4) {
        status = 'persistent';
        summaryText = `Your ${catLabel.toLowerCase()} has been persistent, logged across ${maxConsecutive} consecutive days (${currentDays} total days this period).`;
      } else if (baselineAvgSev !== null && currentAvgSev !== null && (currentAvgSev - baselineAvgSev) >= 1.5) {
        status = 'worsening';
        summaryText = `Your ${catLabel.toLowerCase()} has worsened: recent severity is ${currentAvgSev}/5 compared to your historical baseline of ${baselineAvgSev}/5 (+${(currentAvgSev - baselineAvgSev).toFixed(1)} escalation).`;
      } else if (baselineAvgSev !== null && currentAvgSev !== null && (currentAvgSev - baselineAvgSev) <= -1.5) {
        status = 'improving';
        summaryText = `Your ${catLabel.toLowerCase()} shows noticeable relief: severity dropped from baseline ${baselineAvgSev}/5 to ${currentAvgSev}/5.`;
      } else if (currentDays > (baselineDays * 1.5)) {
        status = 'recurring';
        summaryText = `Your ${catLabel.toLowerCase()} has been reported more frequently this period (${currentDays} days vs typical baseline frequency).`;
      } else {
        status = 'stable';
        summaryText = `Your ${catLabel.toLowerCase()} is tracking within your expected baseline range (${currentDays} days logged).`;
      }

      symptomAnalysis.push({
        category: cat,
        label: catLabel,
        status,
        summaryText,
        currentDays,
        currentAvgSeverity: currentAvgSev,
        baselineDays,
        baselineAvgSeverity: baselineAvgSev,
        maxConsecutive,
        logsCount: winData ? winData.count : 0
      });
    });

    // 4. Construct Aligned Timeline Grid for Graphs
    const dateList = getDateRangeArray(startDateStr, endDateStr);
    const dailyMap = new Map(allDaily.map(d => [d.date, d]));
    
    // Group symptoms by date
    const symptomsByDate = new Map();
    windowSymptoms.forEach(s => {
      if (!symptomsByDate.has(s.date)) symptomsByDate.set(s.date, []);
      symptomsByDate.get(s.date).push(s);
    });

    const timeline = dateList.map(dateStr => {
      const symList = symptomsByDate.get(dateStr) || [];
      const dailyEntry = dailyMap.get(dateStr) || null;

      // Determine cycle phase for this date
      let cyclePhase = 'none';
      let flowIntensity = null;
      for (const c of allCycles) {
        if (c.startDate && dateStr >= c.startDate) {
          const endDate = c.endDate || new Date(new Date(c.startDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          if (dateStr <= endDate) {
            cyclePhase = 'menstrual';
            flowIntensity = c.flowIntensity || 'medium';
            break;
          }
        }
      }

      // If symptom log recorded a phase, respect it
      if (cyclePhase === 'none' && symList.length > 0 && symList[0].cyclePhase && symList[0].cyclePhase !== 'unknown') {
        cyclePhase = symList[0].cyclePhase;
      }

      // Build symptom severity map
      const severities = {};
      let maxSev = null;
      symList.forEach(s => {
        const cat = s.category || 'other';
        severities[cat] = s.severity || 2;
        if (maxSev === null || s.severity > maxSev) maxSev = s.severity;
      });

      const hasSymptomData = symList.length > 0;
      const hasDailyData = dailyEntry !== null;

      return {
        date: dateStr,
        cyclePhase,
        flowIntensity,
        symptoms: symList.map(s => ({
          id: s._id,
          name: s.name,
          category: s.category,
          severity: s.severity,
          duration: s.duration,
          notes: s.notes
        })),
        symptomSeverities: severities,
        maxSymptomSeverity: maxSev,
        // Daily wellness metrics (strictly preserve null for missing data)
        sleepHours: dailyEntry?.sleepHours !== undefined ? dailyEntry.sleepHours : null,
        sleepQuality: dailyEntry?.sleepQuality || null,
        energyLevel: dailyEntry?.energyLevel !== undefined ? dailyEntry.energyLevel : null,
        hydrationGlasses: dailyEntry?.hydrationGlasses !== undefined ? dailyEntry.hydrationGlasses : null,
        nutritionScore: dailyEntry?.nutritionScore !== undefined ? dailyEntry.nutritionScore : null,
        moodScore: dailyEntry?.moodScore !== undefined ? dailyEntry.moodScore : null,
        mood: dailyEntry?.mood || null,
        notes: dailyEntry?.notes || (symList.map(s => s.notes).filter(Boolean).join('; ')) || '',
        hasData: hasSymptomData || hasDailyData,
        hasSymptomData,
        hasDailyData
      };
    });

    // 5. Calculate Summary Insights for Available Metrics
    const sleepTrend = calculateMetricTrend(timeline.map(t => t.sleepHours));
    const energyTrend = calculateMetricTrend(timeline.map(t => t.energyLevel));
    const hydrationTrend = calculateMetricTrend(timeline.map(t => t.hydrationGlasses));
    const nutritionTrend = calculateMetricTrend(timeline.map(t => t.nutritionScore));
    const moodTrend = calculateMetricTrend(timeline.map(t => t.moodScore));
    const severityTrend = calculateMetricTrend(timeline.map(t => t.maxSymptomSeverity));

    const insights = {
      sleep: {
        ...sleepTrend,
        metricLabel: 'Sleep Duration (hrs)',
        insightText: sleepTrend.direction === 'decreasing'
          ? `Sleep has trended downward (recent avg: ${sleepTrend.avg}h). Deficits under 6.5h often intensify cramp and headache sensitivity.`
          : sleepTrend.direction === 'increasing'
          ? `Sleep has trended upward toward restorative baseline (avg: ${sleepTrend.avg}h).`
          : `Sleep duration is stable at ~${sleepTrend.avg || 7}h/night.`
      },
      energy: {
        ...energyTrend,
        metricLabel: 'Energy Level (1–5)',
        insightText: energyTrend.direction === 'decreasing'
          ? `Energy levels have declined (avg: ${energyTrend.avg}/5). Correlates with late luteal phase and sleep changes.`
          : energyTrend.direction === 'increasing'
          ? `Vitality and energy have shown positive recovery (avg: ${energyTrend.avg}/5).`
          : `Energy levels remain steady at ~${energyTrend.avg || 3}/5.`
      },
      hydration: {
        ...hydrationTrend,
        metricLabel: 'Hydration (glasses/day)',
        insightText: hydrationTrend.avg && hydrationTrend.avg < 6
          ? `Hydration has averaged ${hydrationTrend.avg} glasses. Increasing to 8 glasses helps reduce pelvic bloating.`
          : `Hydration is well maintained at ~${hydrationTrend.avg || 6} glasses daily.`
      },
      nutrition: {
        ...nutritionTrend,
        metricLabel: 'Nutrition Nourishment (1–5)',
        insightText: nutritionTrend.avg && nutritionTrend.avg >= 4
          ? `Consistent balanced meals reported (avg: ${nutritionTrend.avg}/5).`
          : `Nutrition score averaged ${nutritionTrend.avg || 3}/5.`
      },
      mood: {
        ...moodTrend,
        metricLabel: 'Mood Balance (1–5)',
        insightText: `Mood stability averaged ${moodTrend.avg || 3}/5 over the selected period.`
      },
      symptomSeverity: {
        ...severityTrend,
        metricLabel: 'Peak Symptom Severity (1–5)',
        insightText: severityTrend.direction === 'increasing'
          ? `Peak symptom severity has increased (+${(severityTrend.max - (severityTrend.min || 0))} pt range).`
          : severityTrend.direction === 'decreasing'
          ? `Peak symptom severity is improving overall.`
          : `Peak symptom severity is stable.`
      }
    };

    // 6. Evaluate Clinical Safety Alerts for the Active User
    const clinicalSafety = evaluateClinicalSafety({
      symptoms: allSymptoms,
      daily: allDaily,
      cycles: allCycles,
      reports: allReports,
      user: req.user
    });

    res.json({
      success: true,
      timeRange,
      startDate: startDateStr,
      endDate: endDateStr,
      totalDaysInRange: dateList.length,
      daysWithData: timeline.filter(t => t.hasData).length,
      missingDaysCount: timeline.filter(t => !t.hasData).length,
      symptomAnalysis,
      timeline,
      insights,
      clinicalAlerts: clinicalSafety.alerts,
      hasEmergencyAlert: clinicalSafety.hasEmergency
    });
  } catch (err) {
    console.error('getSymptomTrends error:', err);
    res.status(500).json({ success: false, message: 'Failed to aggregate symptom trends: ' + err.message });
  }
};

/**
 * GET /api/symptoms/doctor-summary
 * Generates a concise, structured Clinical Dossier (SBAR) for sharing with a doctor
 */
export const getDoctorSummary = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;

    let allSymptoms = [];
    let allDaily = [];
    let allCycles = [];
    let allReports = [];

    if (isMongoConnected) {
      allSymptoms = await SymptomLog.find({ userId }).sort({ date: -1 });
      allDaily = await DailyCheckIn.find({ userId }).sort({ date: -1 });
      allCycles = await CycleLog.find({ userId }).sort({ startDate: -1 });
      allReports = await HealthReport.find({ userId }).sort({ date: -1 });
    } else {
      allSymptoms = (fallbackStore.find('symptoms', { userId }) || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      allDaily = (fallbackStore.find('daily', { userId }) || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      allCycles = (fallbackStore.find('cycles', { userId }) || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      allReports = (fallbackStore.find('reports', { userId }) || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const clinicalSafety = evaluateClinicalSafety({
      symptoms: allSymptoms,
      daily: allDaily,
      cycles: allCycles,
      reports: allReports,
      user
    });

    // 14-day recent window
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recentSymptoms = allSymptoms.filter(s => s.date >= cutoff);
    const recentDaily = allDaily.filter(d => d.date >= cutoff);

    // Group persistent symptoms
    const catCounts = {};
    recentSymptoms.forEach(s => {
      const c = s.category || 'other';
      if (!catCounts[c]) catCounts[c] = { count: 0, severities: [], notes: [] };
      catCounts[c].count++;
      catCounts[c].severities.push(s.severity || 2);
      if (s.notes) catCounts[c].notes.push(s.notes);
    });

    const primaryComplaints = Object.keys(catCounts).map(cat => ({
      category: cat.replace('_', ' ').toUpperCase(),
      frequencyDays: catCounts[cat].count,
      avgSeverity: +(catCounts[cat].severities.reduce((a, b) => a + b, 0) / catCounts[cat].severities.length).toFixed(1),
      maxSeverity: Math.max(...catCounts[cat].severities),
      patientNotes: catCounts[cat].notes.slice(0, 3)
    })).sort((a, b) => b.avgSeverity - a.avgSeverity);

    // Average lifestyle metrics
    const avgSleep = recentDaily.length > 0 ? +(recentDaily.reduce((a, b) => a + (b.sleepHours || 7), 0) / recentDaily.length).toFixed(1) : 7.0;
    const avgEnergy = recentDaily.length > 0 ? +(recentDaily.reduce((a, b) => a + (b.energyLevel || 3), 0) / recentDaily.length).toFixed(1) : 3.0;

    // Biomarkers extraction
    const keyBiomarkers = [];
    allReports.forEach(r => {
      if (r.biomarkers && Array.isArray(r.biomarkers)) {
        r.biomarkers.forEach(b => {
          keyBiomarkers.push({
            name: b.name,
            value: b.value,
            unit: b.unit,
            referenceRange: b.referenceRange,
            reportDate: r.date,
            reportTitle: r.title
          });
        });
      }
    });

    const summaryDossier = {
      generatedAt: new Date().toISOString(),
      patientInfo: {
        name: user.name || 'Dhatri Patient Member',
        birthYear: user.birthYear || 2000,
        biologicalSeason: user.biologicalSeason || 'regulating_exploring',
        isMenstruating: user.isMenstruating !== false,
        totalCyclesLogged: allCycles.length,
        totalSymptomsLogged: allSymptoms.length
      },
      clinicalAlerts: clinicalSafety.alerts,
      primaryComplaints,
      cycleSummary: {
        lastPeriodDate: allCycles[0]?.startDate || 'No cycle records',
        recentCycleLengths: allCycles.slice(0, 3).map(c => c.startDate),
        flowIntensity: allCycles[0]?.flowIntensity || 'medium',
        painLevel: allCycles[0]?.painLevel !== undefined ? `${allCycles[0].painLevel}/10` : 'Not recorded'
      },
      lifestyleBaseline: {
        averageSleepHours: avgSleep,
        averageEnergyLevel: `${avgEnergy}/5`,
        daysTrackedIn14d: recentDaily.length
      },
      biomarkers: keyBiomarkers.slice(0, 5),
      suggestedQuestionsForDoctor: [
        'Could my persistent symptoms correlate with cyclic hormonal shifts or subclinical ferritin depletion?',
        'Are there specific diagnostic imaging (pelvic ultrasound) or laboratory panels indicated for my symptom pattern?',
        'What conservative or pharmacological strategies do you recommend for pain management during peak flare-ups?'
      ],
      legalDisclaimer: 'This Health Summary Dossier is user-generated for clinical consultation advocacy only and does not constitute a formal diagnosis or medical treatment plan.'
    };

    res.json({
      success: true,
      dossier: summaryDossier
    });
  } catch (err) {
    console.error('getDoctorSummary error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate doctor summary: ' + err.message });
  }
};

