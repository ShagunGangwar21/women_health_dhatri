import { DailyCheckIn } from '../models/DailyCheckIn.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

export const getDailyLogs = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let logs = [];
    if (isMongoConnected) {
      logs = await DailyCheckIn.find({ userId }).sort({ date: -1 }).limit(30);
    } else {
      logs = fallbackStore.find('daily', { userId }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
    }

    // Today's log if available
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr) || null;

    // Averages over available records
    let avgSleep = 7;
    let avgEnergy = 3;
    let avgWater = 6;
    if (logs.length > 0) {
      avgSleep = +(logs.reduce((acc, c) => acc + (c.sleepHours || 7), 0) / logs.length).toFixed(1);
      avgEnergy = +(logs.reduce((acc, c) => acc + (c.energyLevel || 3), 0) / logs.length).toFixed(1);
      avgWater = +(logs.reduce((acc, c) => acc + (c.hydrationGlasses || 6), 0) / logs.length).toFixed(1);
    }

    res.json({
      success: true,
      logs,
      todayLog,
      stats: { avgSleep, avgEnergy, avgWater, totalLogs: logs.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve daily check-ins.' });
  }
};

export const saveDailyCheckIn = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { date, mood, moodScore, sleepHours, sleepQuality, energyLevel, hydrationGlasses, nutritionScore, nutritionNote, notes } = req.body;

    const targetDate = date || new Date().toISOString().split('T')[0];

    let checkIn;
    if (isMongoConnected) {
      checkIn = await DailyCheckIn.findOneAndUpdate(
        { userId, date: targetDate },
        {
          mood: mood || 'grounded',
          moodScore: moodScore || 3,
          sleepHours: sleepHours !== undefined ? Number(sleepHours) : 7,
          sleepQuality: sleepQuality || 'restful',
          energyLevel: energyLevel !== undefined ? Number(energyLevel) : 3,
          hydrationGlasses: hydrationGlasses !== undefined ? Number(hydrationGlasses) : 6,
          nutritionScore: nutritionScore !== undefined ? Number(nutritionScore) : 3,
          nutritionNote: nutritionNote || '',
          notes: notes || ''
        },
        { upsert: true, new: true }
      );
    } else {
      const existing = fallbackStore.findOne('daily', { userId, date: targetDate });
      if (existing) {
        checkIn = fallbackStore.findByIdAndUpdate('daily', existing._id, {
          mood: mood || 'grounded',
          moodScore: moodScore || 3,
          sleepHours: sleepHours !== undefined ? Number(sleepHours) : 7,
          sleepQuality: sleepQuality || 'restful',
          energyLevel: energyLevel !== undefined ? Number(energyLevel) : 3,
          hydrationGlasses: hydrationGlasses !== undefined ? Number(hydrationGlasses) : 6,
          nutritionScore: nutritionScore !== undefined ? Number(nutritionScore) : 3,
          nutritionNote: nutritionNote || '',
          notes: notes || ''
        });
      } else {
        checkIn = fallbackStore.insert('daily', {
          userId,
          date: targetDate,
          mood: mood || 'grounded',
          moodScore: moodScore || 3,
          sleepHours: sleepHours !== undefined ? Number(sleepHours) : 7,
          sleepQuality: sleepQuality || 'restful',
          energyLevel: energyLevel !== undefined ? Number(energyLevel) : 3,
          hydrationGlasses: hydrationGlasses !== undefined ? Number(hydrationGlasses) : 6,
          nutritionScore: nutritionScore !== undefined ? Number(nutritionScore) : 3,
          nutritionNote: nutritionNote || '',
          notes: notes || ''
        });
      }
    }

    res.json({ success: true, checkIn, message: 'Daily check-in saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record daily check-in.' });
  }
};
