import { generateHealthAlerts } from '../services/healthAlertEngine.js';
import { User } from '../models/User.js';
import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { DailyCheckIn } from '../models/DailyCheckIn.js';
import { HealthReport } from '../models/HealthReport.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

export const getHealthAlerts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let user = req.user;
    let cycles = [];
    let symptoms = [];
    let reports = [];
    let daily = [];
    let dismissedAlertIds = [];

    if (isMongoConnected) {
      const dbUser = await User.findById(userId);
      if (dbUser) {
        user = dbUser;
        dismissedAlertIds = dbUser.dismissedAlerts || [];
      }
      cycles = await CycleLog.find({ userId }).sort({ startDate: -1 });
      symptoms = await SymptomLog.find({ userId }).sort({ date: -1 });
      reports = await HealthReport.find({ userId }).sort({ date: -1 });
      daily = await DailyCheckIn.find({ userId }).sort({ date: -1 });
    } else {
      const localUser = fallbackStore.findOne('users', { _id: userId }) || user;
      dismissedAlertIds = localUser?.dismissedAlerts || [];
      cycles = fallbackStore.find('cycles', { userId });
      symptoms = fallbackStore.find('symptoms', { userId });
      reports = fallbackStore.find('reports', { userId });
      daily = fallbackStore.find('daily', { userId });
    }

    const alerts = generateHealthAlerts({
      symptoms,
      reports,
      cycles,
      daily,
      user,
      dismissedAlertIds
    });

    const activeAlerts = alerts.filter(a => !a.isDismissed);
    const dismissedAlerts = alerts.filter(a => a.isDismissed);

    res.json({
      success: true,
      alerts: activeAlerts,
      allAlerts: alerts,
      dismissedCount: dismissedAlerts.length,
      totalCount: alerts.length
    });
  } catch (err) {
    console.error('getHealthAlerts error:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate health alerts.' });
  }
};

export const dismissHealthAlert = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (isMongoConnected) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { dismissedAlerts: id }
      });
    } else {
      const user = fallbackStore.findOne('users', { _id: userId });
      if (user) {
        const current = user.dismissedAlerts || [];
        if (!current.includes(id)) {
          current.push(id);
          fallbackStore.findByIdAndUpdate('users', userId, { dismissedAlerts: current });
        }
      }
    }

    res.json({ success: true, message: 'Alert dismissed.', alertId: id });
  } catch (err) {
    console.error('dismissHealthAlert error:', err);
    res.status(500).json({ success: false, message: 'Failed to dismiss alert.' });
  }
};

export const restoreHealthAlerts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isMongoConnected) {
      await User.findByIdAndUpdate(userId, {
        $set: { dismissedAlerts: [] }
      });
    } else {
      fallbackStore.findByIdAndUpdate('users', userId, { dismissedAlerts: [] });
    }

    res.json({ success: true, message: 'All dismissed alerts restored.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to restore alerts.' });
  }
};
