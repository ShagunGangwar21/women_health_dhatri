import express from 'express';
import { getAppointments, createAppointment, updateAppointment, cancelAppointment, getProviderDirectory } from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Publicly searchable provider directory
router.get('/directory', getProviderDirectory);

// Authenticated appointment management
router.use(authMiddleware);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);
router.put('/:id/cancel', cancelAppointment);
router.post('/:id/cancel', cancelAppointment);

export default router;
