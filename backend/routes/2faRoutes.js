// routes/2faRoutes.js
const express = require('express');
const twoFactorController = require('../controllers/2faController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Validation
const tokenValidation = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('Token must be 6 digits')
    .isNumeric()
    .withMessage('Token must contain only numbers')
];

// Enable 2FA
router.post('/enable', auth, twoFactorController.enable2FA);

// Verify 2FA setup
router.post('/verify-setup', auth, tokenValidation, twoFactorController.verify2FASetup);

// Disable 2FA
router.post('/disable', auth, twoFactorController.disable2FA);

// Verify 2FA token (during login)
router.post('/verify', tokenValidation, twoFactorController.verify2FAToken);

// Get backup codes
router.get('/backup-codes', auth, twoFactorController.getBackupCodes);

// Regenerate backup codes
router.post('/regenerate-codes', auth, twoFactorController.regenerateBackupCodes);

module.exports = router;