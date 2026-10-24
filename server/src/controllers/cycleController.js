import { CycleLog } from '../models/CycleLog.js';
import { User } from '../models/User.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

// Calculate cycle predictions with clear medical humility
function calculateCycleEstimates(cycleLogs, userAvgLength = 28, userAvgDuration = 5) {
  if (!cycleLogs || cycleLogs.length === 0) {
    return {
      hasEnoughData: false,
      message: 'Log at least one period to view estimated calendar projections.',
      estimatedNextPeriod: null,
      estimatedFertileWindow: null,
      estimatedOvulationDate: null,
      disclaimer: 'Projections are mathematical estimates based on averages and should never be used as contraception or diagnostic certainty.'
    };
  }

  // Sort by startDate descending
  const sorted = [...cycleLogs].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const latest = sorted[0];

  // Compute average cycle length if multiple cycles logged
  let cycleLength = userAvgLength || 28;
  if (sorted.length >= 2) {
    let diffSum = 0;
    let count = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].startDate);
      const d2 = new Date(sorted[i + 1].startDate);
      const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
      if (diffDays >= 20 && diffDays <= 50) {
        diffSum += diffDays;
        count++;
      }
    }
    if (count > 0) {
      cycleLength = Math.round(diffSum / count);
    }
  }

  const latestStart = new Date(latest.startDate);
  
  // Next period estimate
  const nextPeriodStart = new Date(latestStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + cycleLength);
  
  const nextPeriodEnd = new Date(nextPeriodStart);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + (userAvgDuration || 5));

  // Ovulation estimate (~14 days before next period start)
  const ovulation = new Date(nextPeriodStart);
  ovulation.setDate(ovulation.getDate() - 14);

  // Fertile window (~5 days before ovulation to 1 day after)
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  // Current cycle day calculation
  const today = new Date();
  const currentDiff = Math.floor((today - latestStart) / (1000 * 60 * 60 * 24)) + 1;
  const currentCycleDay = currentDiff > 0 ? currentDiff : 1;

  // Determine biological phase
  let currentPhase = 'Follicular';
  if (currentCycleDay <= (userAvgDuration || 5)) {
    currentPhase = 'Menstrual';
  } else if (currentCycleDay >= cycleLength - 16 && currentCycleDay <= cycleLength - 12) {
    currentPhase = 'Ovulatory';
  } else if (currentCycleDay > cycleLength - 12) {
    currentPhase = 'Luteal';
  }

  return {
    hasEnoughData: true,
    latestLogDate: latest.startDate,
    averageCycleLength: cycleLength,
    currentCycleDay,
    currentPhase,
    estimatedNextPeriod: {
      startDate: nextPeriodStart.toISOString().split('T')[0],
      endDate: nextPeriodEnd.toISOString().split('T')[0]
    },
    estimatedOvulationDate: ovulation.toISOString().split('T')[0],
    estimatedFertileWindow: {
      startDate: fertileStart.toISOString().split('T')[0],
      endDate: fertileEnd.toISOString().split('T')[0]
    },
    disclaimer: 'Notice: Projections are algorithmic approximations for personal rhythm tracking and are not guarantees or medical confirmation.'
  };
}

export const getCycleLogs = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let logs = [];
    if (isMongoConnected) {
      logs = await CycleLog.find({ userId }).sort({ startDate: -1 });
    } else {
      logs = fallbackStore.find('cycles', { userId }).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }

    const estimates = calculateCycleEstimates(
      logs,
      req.user.averageCycleLength || 28,
      req.user.averagePeriodDuration || 5
    );

    res.json({
      success: true,
      isMenstruating: req.user.isMenstruating !== false,
      cycleLogs: logs,
      estimates
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve cycle logs.' });
  }
};

export const logCycle = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { startDate, endDate, flowIntensity, painLevel, symptoms, notes } = req.body;

    if (!startDate) {
      return res.status(400).json({ success: false, message: 'Start date is required.' });
    }

    let created;
    if (isMongoConnected) {
      created = await CycleLog.create({
        userId,
        startDate,
        endDate: endDate || null,
        flowIntensity: flowIntensity || 'medium',
        painLevel: painLevel !== undefined ? painLevel : 2,
        symptoms: symptoms || [],
        notes: notes || '',
        isEstimated: false
      });
    } else {
      created = fallbackStore.insert('cycles', {
        userId,
        startDate,
        endDate: endDate || null,
        flowIntensity: flowIntensity || 'medium',
        painLevel: painLevel !== undefined ? painLevel : 2,
        symptoms: symptoms || [],
        notes: notes || '',
        isEstimated: false
      });
    }

    res.status(201).json({ success: true, cycleLog: created, message: 'Period cycle logged successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log cycle.' });
  }
};

export const updateCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const updates = req.body;

    let updated;
    if (isMongoConnected) {
      updated = await CycleLog.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    } else {
      updated = fallbackStore.findByIdAndUpdate('cycles', id, updates);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Cycle record not found or unauthorized.' });
    }

    res.json({ success: true, cycleLog: updated, message: 'Cycle updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update cycle.' });
  }
};

export const deleteCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (isMongoConnected) {
      const deleted = await CycleLog.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ success: false, message: 'Cycle record not found.' });
    } else {
      fallbackStore.findByIdAndDelete('cycles', id);
    }

    res.json({ success: true, message: 'Cycle record removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete cycle.' });
  }
};
