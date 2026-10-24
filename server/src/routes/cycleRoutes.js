import express from 'express';
import { getCycleLogs, logCycle, updateCycle, deleteCycle } from '../controllers/cycleController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getCycleLogs);
router.post('/', logCycle);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;
