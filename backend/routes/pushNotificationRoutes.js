const express = require('express');
const auth = require('../middleware/auth');
const pushNotificationService = require('../utils/pushNotificationService');

const router = express.Router();

// Subscribe to push notifications
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    const result = await pushNotificationService.subscribe(req.user._id, subscription);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const result = await pushNotificationService.unsubscribe(req.user._id, endpoint);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  const publicKey = pushNotificationService.getPublicKey();
  res.json({ success: true, publicKey });
});

module.exports = router;