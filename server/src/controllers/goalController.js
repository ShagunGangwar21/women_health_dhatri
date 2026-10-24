import { Goal } from '../models/Goal.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

const DEFAULT_GOALS = [
  { title: 'Drink 8 glasses of water daily', category: 'Hydration', targetValue: 8, currentValue: 6, unit: 'glasses', streakDays: 4 },
  { title: '7.5+ hours of restorative sleep', category: 'Sleep Quality', targetValue: 8, currentValue: 7, unit: 'hours', streakDays: 3 },
  { title: 'Mindful 10-minute pelvic stretch', category: 'Movement & Pelvic Care', targetValue: 10, currentValue: 10, unit: 'mins', streakDays: 5, isCompleted: true },
  { title: 'Evening screen-free wind down', category: 'Stress Relief', targetValue: 30, currentValue: 20, unit: 'mins', streakDays: 2 }
];

export const getGoals = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let goals = [];
    if (isMongoConnected) {
      goals = await Goal.find({ userId });
      if (goals.length === 0) {
        // Seed default goals for user
        const seeded = await Goal.insertMany(DEFAULT_GOALS.map(g => ({ ...g, userId })));
        goals = seeded;
      }
    } else {
      goals = fallbackStore.find('goals', { userId });
      if (goals.length === 0) {
        goals = DEFAULT_GOALS.map(g => fallbackStore.insert('goals', { ...g, userId }));
      }
    }

    const normalized = goals.map(g => {
      const obj = g.toObject ? g.toObject() : { ...g };
      obj.target = obj.targetValue;
      obj.current = obj.currentValue;
      return obj;
    });

    res.json({ success: true, goals: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve goals.' });
  }
};

export const createGoal = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, category, targetValue, target, unit, frequency } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Goal title is required.' });

    const finalTarget = targetValue !== undefined ? Number(targetValue) : target !== undefined ? Number(target) : 8;

    let goal;
    if (isMongoConnected) {
      goal = await Goal.create({
        userId,
        title,
        category: category || 'Hydration',
        targetValue: finalTarget,
        currentValue: 0,
        unit: unit || 'times',
        frequency: frequency || 'daily',
        streakDays: 0,
        isCompleted: false
      });
    } else {
      goal = fallbackStore.insert('goals', {
        userId,
        title,
        category: category || 'Hydration',
        targetValue: finalTarget,
        currentValue: 0,
        unit: unit || 'times',
        frequency: frequency || 'daily',
        streakDays: 0,
        isCompleted: false
      });
    }

    const obj = goal.toObject ? goal.toObject() : { ...goal };
    obj.target = obj.targetValue;
    obj.current = obj.currentValue;

    res.status(201).json({ success: true, goal: obj, message: 'Goal created.' });
  } catch (err) {
    console.error('🌸 [createGoal Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to create goal: ' + err.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const updates = { ...req.body };

    if (updates.target !== undefined && updates.targetValue === undefined) {
      updates.targetValue = Number(updates.target);
    }
    if (updates.current !== undefined && updates.currentValue === undefined) {
      updates.currentValue = Number(updates.current);
    }

    let updated;
    if (isMongoConnected) {
      updated = await Goal.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    } else {
      updated = fallbackStore.findByIdAndUpdate('goals', id, updates);
    }

    if (!updated) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const obj = updated.toObject ? updated.toObject() : { ...updated };
    obj.target = obj.targetValue;
    obj.current = obj.currentValue;

    res.json({ success: true, goal: obj, message: 'Goal updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update goal.' });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (isMongoConnected) {
      await Goal.findOneAndDelete({ _id: id, userId });
    } else {
      fallbackStore.findByIdAndDelete('goals', id);
    }

    res.json({ success: true, message: 'Goal removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete goal.' });
  }
};
