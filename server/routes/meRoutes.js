const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getMyEnrollments, getDashboardOverview, getProgramProgress } = require('../controllers/meController');

router.use(protect); // Protect all routes

router.get('/enrollments', getMyEnrollments);
router.get('/dashboard-overview', getDashboardOverview);
router.get('/program/:programId/progress', getProgramProgress);

module.exports = router;
