import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'dhatri_local_development_jwt_secret_token_2026_recHERsion';
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please sign in again.' });
    }

    let user = null;
    if (isMongoConnected) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = fallbackStore.findOne('users', { _id: decoded.id });
      if (user) {
        const { password, ...safeUser } = user;
        user = safeUser;
      }
    }

    if (!user) {
      // Allow demo user token if generated
      if (decoded.id === 'demo_user_dhatri') {
        req.user = {
          _id: 'demo_user_dhatri',
          id: 'demo_user_dhatri',
          name: 'Priya Sharma',
          email: 'priya.sharma@dhatri.app',
          isMenstruating: true,
          averageCycleLength: 28,
          averagePeriodDuration: 5,
          theme: 'system',
          language: 'en'
        };
        return next();
      }
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Authentication verification failure.' });
  }
};
