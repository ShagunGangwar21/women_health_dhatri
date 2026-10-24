import express from 'express';
import { getNearbyFacilities, geocodeLocation } from '../controllers/placesController.js';

const router = express.Router();

// Publicly accessible so women in emergency or unauthenticated visitors can also find care
router.get('/nearby', getNearbyFacilities);
router.get('/geocode', geocodeLocation);

export default router;
