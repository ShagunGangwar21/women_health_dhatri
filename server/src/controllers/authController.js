import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dhatri_local_development_jwt_secret_token_2026_recHERsion';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, birthYear, biologicalSeason, isMenstruating, cycleRegularity } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (isMongoConnected) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        birthYear: birthYear || 2000,
        biologicalSeason: biologicalSeason || 'regulating_exploring',
        isMenstruating: isMenstruating !== undefined ? isMenstruating : true,
        cycleRegularity: cycleRegularity || 'regular'
      });
      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          birthYear: user.birthYear,
          biologicalSeason: user.biologicalSeason,
          isMenstruating: user.isMenstruating,
          theme: user.theme,
          language: user.language
        }
      });
    } else {
      const existing = fallbackStore.findOne('users', { email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = fallbackStore.insert('users', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        birthYear: birthYear || 2000,
        biologicalSeason: biologicalSeason || 'regulating_exploring',
        isMenstruating: isMenstruating !== undefined ? isMenstruating : true,
        cycleRegularity: cycleRegularity || 'regular',
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        theme: 'system',
        language: 'en'
      });
      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          birthYear: user.birthYear,
          biologicalSeason: user.biologicalSeason,
          isMenstruating: user.isMenstruating,
          theme: user.theme,
          language: user.language
        }
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    let user = null;
    let isMatch = false;

    if (isMongoConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = fallbackStore.findOne('users', { email: email.toLowerCase() });
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        birthYear: user.birthYear,
        biologicalSeason: user.biologicalSeason,
        isMenstruating: user.isMenstruating,
        averageCycleLength: user.averageCycleLength || 28,
        averagePeriodDuration: user.averagePeriodDuration || 5,
        theme: user.theme,
        language: user.language
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const demoUser = {
      id: 'demo_user_dhatri',
      _id: 'demo_user_dhatri',
      name: 'Priya Sharma',
      email: 'priya.sharma@dhatri.app',
      birthYear: 1998,
      biologicalSeason: 'regulating_exploring',
      primaryConcern: 'Tracking luteal phase energy shifts & ferritin levels',
      isMenstruating: true,
      cycleRegularity: 'regular',
      averageCycleLength: 28,
      averagePeriodDuration: 5,
      theme: 'system',
      language: 'en'
    };
    const token = generateToken(demoUser.id);
    res.json({
      success: true,
      token,
      user: demoUser,
      message: 'Logged in as Demo User (Priya Sharma)'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Demo login error' });
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Do not update password through this route

    if (updates.profile && typeof updates.profile === 'object') {
      Object.assign(updates, updates.profile);
      delete updates.profile;
    }

    let updated = null;
    if (isMongoConnected) {
      updated = await User.findByIdAndUpdate(req.user._id || req.user.id, updates, { new: true }).select('-password');
    } else {
      updated = fallbackStore.findByIdAndUpdate('users', req.user._id || req.user.id, updates);
    }
    res.json({ success: true, user: updated, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed.' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide account email.' });
    }

    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = fallbackStore.findOne('users', { email: email.toLowerCase() });
    }

    if (!user) {
      // Return safe message without user enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, recovery instructions have been sent.'
      });
    }

    // In local dev/hackathon environment, return reset confirmation
    const resetToken = jwt.sign({ id: user._id || user.id, reset: true }, process.env.JWT_SECRET || 'dhatri_secret', { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Password reset link generated. Follow the instructions to choose a new password.',
      devResetToken: resetToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset request failed.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and minimum 6 character password required.' });
    }

    const secret = process.env.JWT_SECRET || 'dhatri_secret';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Reset token has expired or is invalid.' });
    }

    if (isMongoConnected) {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      user.password = newPassword;
      await user.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      fallbackStore.findByIdAndUpdate('users', decoded.id, { password: hashedPassword });
    }

    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};

