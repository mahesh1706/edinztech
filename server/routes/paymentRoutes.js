const express = require('express');
const router = express.Router();
const { createOrder, handleWebhook, enrollFree } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-order', createOrder); // Public for Guest Checkout
router.post('/enroll-free', protect, enrollFree);
router.post('/webhook', handleWebhook);

// Diagnostic Route
router.get('/webhook-test', (req, res) => {
    console.log("🔥 [Connectivity Test] GET request received via Ngrok!");
    res.json({ status: "Connectivity OK", timestamp: new Date() });
});

module.exports = router;
