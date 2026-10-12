import express from 'express';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
} from '../controllers/payment.controller.js';
import { protect, studentOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Payment routes
router.post('/initialize', protect, studentOnly, initializePayment);
router.post('/verify', protect, verifyPayment);
router.get('/history/:studentId', protect, getPaymentHistory);

export default router;
