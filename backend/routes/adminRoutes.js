const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

// All admin routes protected and require role 'admin'
router.use(auth, requireRole('admin'));

router.get('/analytics', adminController.analytics);
router.get('/users', adminController.listUsers);
router.put('/users/:userId', adminController.setUserStatus);
router.get('/posts', adminController.listPosts);
router.delete('/posts/:postId', adminController.deletePost);
router.get('/reports', adminController.listReports);
router.put('/reports/:reportId', adminController.updateReportStatus);

module.exports = router;
