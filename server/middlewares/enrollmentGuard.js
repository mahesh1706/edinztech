const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');

// @desc    Guard Middleware to check strict enrollment access
// @usage   router.get('/protected-resource/:programId', enrollmentGuard, controller)
const enrollmentGuard = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    // Expect access to be scoped by 'programId' in params or query
    const programId = req.params.programId || req.body.programId || req.query.programId;

    if (!programId) {
        // If not explicit, controller must handle or this middleware is misplaced
        return next();
    }

    const enrollment = await Enrollment.findOne({
        user: userId,
        program: programId,
        status: 'active',
        validUntil: { $gte: new Date() }
    });

    if (!enrollment) {
        res.status(403);
        throw new Error('Access Denied: You are not enrolled in this program.');
    }

    req.enrollment = enrollment; // Pass enrollment to controller
    next();
});

module.exports = { enrollmentGuard };
