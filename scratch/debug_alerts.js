import mongoose from 'mongoose';
import { User } from '../server/src/models/User.js';
import { CycleLog } from '../server/src/models/CycleLog.js';
import { SymptomLog } from '../server/src/models/SymptomLog.js';
import { HealthReport } from '../server/src/models/HealthReport.js';
import { DailyCheckIn } from '../server/src/models/DailyCheckIn.js';
import { generateHealthAlerts } from '../server/src/services/healthAlertEngine.js';

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/dhatri');
  const userId = 'demo_user_dhatri';
  const cycles = await CycleLog.find({ userId });
  const symptoms = await SymptomLog.find({ userId });
  const reports = await HealthReport.find({ userId });
  const daily = await DailyCheckIn.find({ userId });
  const user = await User.findById(userId);

  console.log('Cycles count:', cycles.length);
  console.log('Symptoms count:', symptoms.length);
  console.log('Reports count:', reports.length);
  console.log('Daily count:', daily.length);
  console.log('User dismissedAlerts:', user?.dismissedAlerts);

  const alerts = generateHealthAlerts({
    symptoms,
    reports,
    cycles,
    daily,
    user,
    dismissedAlertIds: user?.dismissedAlerts || []
  });
  console.log('Generated alerts count:', alerts.length);
  console.log('Alerts:', alerts.map(a => ({ id: a.id, title: a.title, isDismissed: a.isDismissed })));
  process.exit(0);
}

test().catch(console.error);
