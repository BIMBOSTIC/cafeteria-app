import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getAllOrders,
  updateOrderStatus,
  completeOrder,
  notifyStudent,
} from '../controllers/order.controller.js';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from '../controllers/menu.controller.js';
import { uploadImage } from '../controllers/upload.controller.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect, adminOnly);

// Order routes
router.get('/orders', getAllOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.patch('/orders/:orderId/complete', completeOrder);
router.post('/orders/:orderId/notify', notifyStudent);

// Menu routes
router.post('/menu', createMenuItem);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);
router.patch('/menu/:id/availability', toggleAvailability);

// Image upload
router.post('/upload', upload.single('image'), uploadImage);

export default router;
