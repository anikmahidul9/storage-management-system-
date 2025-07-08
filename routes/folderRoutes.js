import express from 'express';
import { protect } from '../controllers/authController.js';
const router = express.Router();
import {
  createFolder,
  renameFolder,
  toggleFavoriteFolder,
  deleteFolder,
  getAllFolders
} from '../controllers/folderController.js';

router.route('/').post(protect, createFolder).get(protect, getAllFolders);
router.put('/:id/rename', protect, renameFolder);
router.put('/:id/favorite', protect, toggleFavoriteFolder);
router.delete('/:id', protect, deleteFolder);

export default router;