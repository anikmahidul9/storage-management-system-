
import express from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/items.js';

import { protect } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getItems).post(createItem);
router.route('/:id').get(getItem).put(updateItem).delete(deleteItem);

export default router;
