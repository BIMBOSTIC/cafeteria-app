import express from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { upload } from '../config/cloudinary.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Upload image endpoint (admin only)
router.post('/', protect, adminOnly, upload.single('image'), uploadImage);

export default router;
