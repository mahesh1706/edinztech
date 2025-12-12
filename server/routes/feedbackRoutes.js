const express = require('express');
const router = express.Router();
const {
    createFeedback,
    getAdminFeedbacks,
    getFeedbackById,
    updateFeedback,
    publishFeedback,
    unpublishFeedback,
    deleteFeedback,
    getMyFeedbacks,
    getFeedbackForSubmission,
    submitFeedback,
    exportFeedbackResponses
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Student Routes
router.get('/me', protect, getMyFeedbacks);
router.get('/me/:id', protect, getFeedbackForSubmission);
router.post('/me/:id', protect, submitFeedback);

// Admin Routes
router.post('/admin', protect, admin, createFeedback);
router.get('/admin', protect, admin, getAdminFeedbacks);
router.get('/admin/:id', protect, admin, getFeedbackById);
router.put('/admin/:id', protect, admin, updateFeedback);
router.delete('/admin/:id', protect, admin, deleteFeedback);
router.patch('/admin/:id/publish', protect, admin, publishFeedback);
router.patch('/admin/:id/unpublish', protect, admin, unpublishFeedback);
router.get('/admin/:id/export', protect, admin, exportFeedbackResponses);

module.exports = router;
