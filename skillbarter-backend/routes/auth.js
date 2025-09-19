const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadProfilePicture, handleUploadError } = require('../middlewares/uploadMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-password-reset', authController.verifyPasswordResetOTP);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/update-profile', authMiddleware, uploadProfilePicture, handleUploadError, authController.updateProfile);
router.put('/reset-password', authMiddleware, authController.resetPassword);

module.exports = router;