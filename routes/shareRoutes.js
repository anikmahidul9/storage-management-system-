import express from 'express';
import { protect } from '../controllers/authController.js';
const router = express.Router();
import { shareItem, getSharedItems } from '../controllers/shareController.js';
router.post('/', protect, shareItem);
router.get('/', protect, getSharedItems);

export default  router;