// controllers/2faController.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const emailService = require('../utils/emailService');

const twoFactorController = {
  // Enable 2FA - Generate QR code
  enable2FA: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (user.twoFactorAuth?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication is already enabled'
        });
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Instagram (${user.email})`,
        length: 32
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
      }

      // Store temporarily (will be confirmed later)
      user.twoFactorAuth = {
        enabled: false,
        secret: secret.base32,
        backupCodes: backupCodes.map(code => ({
          code,
          used: false
        })),
        tempSecret: secret.base32 // Store temporarily until verified
      };

      await user.save();

      res.json({
        success: true,
        message: 'Scan QR code with your authenticator app',
        qrCode: qrCodeUrl,
        secret: secret.base32,
        backupCodes
      });
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Verify 2FA setup
  verify2FASetup: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }

      const user = await User.findById(req.user._id);

      if (!user.twoFactorAuth?.tempSecret) {
        return res.status(400).json({
          success: false,
          message: 'No pending 2FA setup found'
        });
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.tempSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Enable 2FA
      user.twoFactorAuth.enabled = true;
      user.twoFactorAuth.secret = user.twoFactorAuth.tempSecret;
      user.twoFactorAuth.tempSecret = undefined;

      await user.save();

      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      });
    } catch (error) {
      console.error('Verify 2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Disable 2FA
  disable2FA: async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Disable 2FA
      user.twoFactorAuth = {
        enabled: false,
        secret: undefined,
        backupCodes: []
      };

      await user.save();

      res.json({
        success: true,
        message: 'Two-factor authentication disabled successfully'
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Verify 2FA token during login
  verify2FAToken: async (req, res) => {
    try {
      const { userId, token, isBackupCode = false } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          success: false,
          message: 'User ID and token are required'
        });
      }

      const user = await User.findById(userId);

      if (!user || !user.twoFactorAuth?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request'
        });
      }

      let verified = false;

      if (isBackupCode) {
        // Check backup code
        const backupCode = user.twoFactorAuth.backupCodes.find(
          bc => bc.code === token.toUpperCase() && !bc.used
        );

        if (backupCode) {
          backupCode.used = true;
          await user.save();
          verified = true;
        }
      } else {
        // Verify TOTP token
        verified = speakeasy.totp.verify({
          secret: user.twoFactorAuth.secret,
          encoding: 'base32',
          token: token,
          window: 2
        });
      }

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      res.json({
        success: true,
        message: 'Verification successful',
        verified: true
      });
    } catch (error) {
      console.error('Verify 2FA token error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get backup codes
  getBackupCodes: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.twoFactorAuth?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication is not enabled'
        });
      }

      const backupCodes = user.twoFactorAuth.backupCodes
        .filter(bc => !bc.used)
        .map(bc => bc.code);

      res.json({
        success: true,
        backupCodes,
        count: backupCodes.length
      });
    } catch (error) {
      console.error('Get backup codes error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Regenerate backup codes
  regenerateBackupCodes: async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      if (!user.twoFactorAuth?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Two-factor authentication is not enabled'
        });
      }

      // Generate new backup codes
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
      }

      user.twoFactorAuth.backupCodes = backupCodes.map(code => ({
        code,
        used: false
      }));

      await user.save();

      res.json({
        success: true,
        message: 'Backup codes regenerated successfully',
        backupCodes
      });
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = twoFactorController;