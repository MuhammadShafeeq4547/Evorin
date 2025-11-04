// middleware/requireTwoFactor.js
const User = require('../models/User');

const requireTwoFactor = async (req, res, next) => {
  try {
    // Skip if 2FA already verified for this session
    if (req.session?.twoFactorVerified) {
      return next();
    }

    const user = await User.findById(req.user._id);
    
    // Skip if 2FA not enabled
    if (!user.twoFactorAuth.enabled) {
      return next();
    }

    // If 2FA enabled but not verified, require verification
    return res.status(403).json({
      success: false,
      message: '2FA verification required',
      requiresTwoFactor: true,
      userId: user._id
    });
  } catch (error) {
    console.error('2FA middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in 2FA check'
    });
  }
};

module.exports = requireTwoFactor;