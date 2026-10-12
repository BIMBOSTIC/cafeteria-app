import express from 'express';
import {
  createOrder,
  getStudentOrders,
  getOrder,
  cancelOrder,
} from '../controllers/order.controller.js';
import { protect, studentOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Student routes
router.post('/', protect, studentOnly, createOrder);
router.get('/student/:studentId', protect, getStudentOrders);
router.get('/:orderId', protect, getOrder);
router.delete('/:orderId', protect, studentOnly, cancelOrder);

export default router;
