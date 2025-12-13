const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');
const { getMyQuizzes, getMyQuiz } = require('../controllers/meQuizController');
const { getMyFeedbacks, getMyFeedback } = require('../controllers/meFeedbackController');

router.use(protect); // All /me routes are protected

// Dashboard
router.get('/dashboard', getDashboard);

// Quizzes
router.get('/quizzes', getMyQuizzes);
router.get('/quizzes/:id', getMyQuiz);

// Feedbacks
router.get('/feedbacks', getMyFeedbacks);
router.get('/feedbacks/:id', getMyFeedback);

module.exports = router;
