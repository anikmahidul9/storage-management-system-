import express from 'express';
import { protect } from '../controllers/authController.js';
const router = express.Router();
import upload from '../utils/upload.js'; 
import {
  uploadFile,
  createNote,
  renameFile,
  toggleFavoriteFile,
  duplicateFile,
  deleteFile,
  getFilesByType,
  getAllOrganizedFiles
} from '../controllers/fileController.js';

router.post('/upload', protect, (req, res, next) => {
  upload(req, res, function (err) {
 if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ success: false, message: err });
    }
    next();
  });
}, uploadFile);
router.post('/notes', protect, createNote);
router.put('/:id/rename', protect, renameFile);
router.put('/:id/favorite', protect, toggleFavoriteFile);
router.post('/:id/duplicate', protect, duplicateFile);
router.delete('/:id', protect, deleteFile);
router.get('/type/:type', protect,getFilesByType);

// Get all organized files
router.get('/all', protect,getAllOrganizedFiles);

export default router;