const express = require('express');
const { body } = require('express-validator');
const {
  login,
  logout,
  register,
  getCurrentUser,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const requireTwoFactor = require('../middleware/requireTwoFactor');
const twoFactorAuthController = require('../controllers/twoFactorAuthController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName').optional().trim()
];


const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Email verification
router.get('/verify/:token', verifyEmail);
router.post('/verify/resend', auth, resendVerification);

// 2FA routes
router.post('/2fa/enable', auth, twoFactorAuthController.enable);
router.post('/2fa/verify', auth, twoFactorAuthController.verify);
router.post('/2fa/disable', auth, twoFactorAuthController.disable);
router.post('/2fa/validate', twoFactorAuthController.validate);
router.post('/2fa/send-code', twoFactorAuthController.sendCode);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);
router.post('/refresh', refresh);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);

module.exports = router;