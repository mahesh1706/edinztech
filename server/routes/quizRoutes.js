const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getAllQuizzes,
    getQuizzesByProgram,
    getStudentQuizzes,
    attemptQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz
} = require('../controllers/quizController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, admin, createQuiz);
router.get('/all', protect, admin, getAllQuizzes); // Admin route to get all
router.get('/my-quizzes', protect, getStudentQuizzes); // Specific path before param route
router.get('/:programId', protect, getQuizzesByProgram);
router.patch('/:id', protect, admin, updateQuiz);
router.delete('/:id', protect, admin, deleteQuiz);
router.patch('/:id/publish', protect, admin, publishQuiz);
router.patch('/:id/unpublish', protect, admin, unpublishQuiz);
router.post('/:id/attempt', protect, attemptQuiz);

module.exports = router;
