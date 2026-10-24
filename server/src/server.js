import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

import authRoutes from './routes/authRoutes.js';
import cycleRoutes from './routes/cycleRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import dailyRoutes from './routes/dailyRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import learnRoutes from './routes/learnRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers with generous limit for document/photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'Dhatri (धात्री)',
    tagline: 'Your Wellness Bestie',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/alerts', alertRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🌸 [Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize database and start listening
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`\n🌸 ========================================================`);
    console.log(`    DHATRI API SERVER RUNNING ON: http://localhost:${PORT}`);
    console.log(`    Health check: http://localhost:${PORT}/api/health`);
    console.log(`========================================================\n`);
  });
};

startServer();
