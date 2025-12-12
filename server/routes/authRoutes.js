const express = require('express');
const router = express.Router();
const { authUser, authAdmin, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', authUser);
router.post('/admin/login', authAdmin);
router.get('/me', protect, getUserProfile);

module.exports = router;
