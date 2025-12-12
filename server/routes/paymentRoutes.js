const express = require('express');
const router = express.Router();
const { createOrder, handleWebhook, enrollFree } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-order', protect, createOrder); // Should be protected for known users, or public? The frontend uses it authenticated.
router.post('/enroll-free', protect, enrollFree);
router.post('/webhook', handleWebhook);

module.exports = router;
