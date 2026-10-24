import express from 'express';
import { getReports, uploadReport, deleteReport, generateDoctorSummary } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getReports);
router.post('/', uploadReport);
router.post('/upload', uploadReport);
router.delete('/:id', deleteReport);
router.get('/doctor-summary', generateDoctorSummary);

export default router;
