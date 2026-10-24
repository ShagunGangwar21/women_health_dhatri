import express from 'express';
import { getDailyLogs, saveDailyCheckIn } from '../controllers/dailyController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getDailyLogs);
router.post('/', saveDailyCheckIn);

export default router;
