// controllers/twoFactorAuthController.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const emailService = require('../utils/emailService');

const twoFactorAuthController = {
  // Enable 2FA for a user
  enable: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      
      // Generate new secret
      const secret = speakeasy.generateSecret({
        name: `InstagramClone:${user.email}`
      });

      // Store temp secret
      user.twoFactorAuth.tempSecret = secret.base32;
      await user.save();

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        success: true,
        tempSecret: secret.base32,
        qrCode,
        message: 'Scan QR code to enable 2FA'
      });
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while enabling 2FA'
      });
    }
  },

  // Verify and activate 2FA
  verify: async (req, res) => {
    try {
      const { token } = req.body;
      const user = await User.findById(req.user._id);

      // Verify token against temp secret
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.tempSecret,
        encoding: 'base32',
        token
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Move temp secret to permanent and generate backup codes
      user.twoFactorAuth.secret = user.twoFactorAuth.tempSecret;
      user.twoFactorAuth.enabled = true;
      user.twoFactorAuth.tempSecret = undefined;
      
      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex')
      );
      user.twoFactorAuth.backupCodes = backupCodes.map(code => ({
        code: crypto.createHash('sha256').update(code).digest('hex'),
        used: false
      }));

      await user.save();

      res.json({
        success: true,
        message: '2FA enabled successfully',
        backupCodes
      });
    } catch (error) {
      console.error('Verify 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while verifying 2FA'
      });
    }
  },

  // Disable 2FA
  disable: async (req, res) => {
    try {
      const { token } = req.body;
      const user = await User.findById(req.user._id);

      // Verify current token before disabling
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Disable 2FA
      user.twoFactorAuth = {
        enabled: false,
        secret: undefined,
        tempSecret: undefined,
        backupCodes: []
      };
      await user.save();

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while disabling 2FA'
      });
    }
  },

  // Validate 2FA token
  validate: async (req, res) => {
    try {
      const { token, userId } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if token matches backup code
      const backupCode = user.twoFactorAuth.backupCodes.find(
        code => code.code === crypto.createHash('sha256').update(token).digest('hex')
      );

      if (backupCode && !backupCode.used) {
        backupCode.used = true;
        await user.save();
        return res.json({
          success: true,
          message: 'Backup code accepted'
        });
      }

      // Verify TOTP
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token,
        window: 1 // Allow 30 seconds clock skew
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      res.json({
        success: true,
        message: 'Code verified successfully'
      });
    } catch (error) {
      console.error('Validate 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while validating 2FA'
      });
    }
  },

  // Send 2FA code via email
  sendCode: async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new TOTP token
      const token = speakeasy.totp({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32'
      });

      // Send via email
      await emailService.send2FACode(user, token);

      res.json({
        success: true,
        message: '2FA code sent successfully'
      });
    } catch (error) {
      console.error('Send 2FA code error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while sending 2FA code'
      });
    }
  }
};

module.exports = twoFactorAuthController;