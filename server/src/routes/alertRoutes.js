import express from 'express';
import { getHealthAlerts, dismissHealthAlert, restoreHealthAlerts } from '../controllers/alertController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getHealthAlerts);
router.post('/:id/dismiss', dismissHealthAlert);
router.post('/restore', restoreHealthAlerts);

export default router;
