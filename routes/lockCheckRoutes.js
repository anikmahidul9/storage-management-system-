import express from 'express';
import { lockItem, unlockItem } from '../controllers/lockController.js'
const router = express.Router();
import { protect } from '../controllers/authController.js';


// File locking
router.post('/files/:id/lock', protect, lockItem);
router.post('/files/:id/unlock', protect, unlockItem);

// Folder locking
router.post('/folders/:id/lock', protect, lockItem);
router.post('/folders/:id/unlock', protect, unlockItem);

export default router;