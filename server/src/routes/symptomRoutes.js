import express from 'express';
import { getSymptoms, logSymptom, updateSymptom, deleteSymptom } from '../controllers/symptomController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getSymptoms);
router.post('/', logSymptom);
router.put('/:id', updateSymptom);
router.delete('/:id', deleteSymptom);

export default router;
