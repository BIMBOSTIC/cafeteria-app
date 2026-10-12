import express from 'express';
import {
  getMenuItems,
  getMenuItem,
} from '../controllers/menu.controller.js';

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

export default router;
