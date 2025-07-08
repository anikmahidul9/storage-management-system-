import express from 'express';
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect
} from '../controllers/authController.js';


const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/logout', logout);


router.use(protect);
router.patch('/update-password', updatePassword);

export default router;