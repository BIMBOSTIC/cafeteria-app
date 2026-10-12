import express from 'express';
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  registerFCMToken,
  getMe,
} from '../controllers/auth.controller.js';
import { protect, studentOnly } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Student routes
router.post('/student/register', authLimiter, registerStudent);
router.post('/student/login', authLimiter, loginStudent);

// Admin routes
router.post('/admin/login', authLimiter, loginAdmin);

// Protected routes
router.get('/me', protect, getMe);
router.post('/register-fcm-token', protect, studentOnly, registerFCMToken);

export default router;
