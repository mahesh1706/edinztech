const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const User = require('../models/User');

/**
 * Calculate validUntil date based on program definition.
 * - If Program has fixed endDate -> min(program.endDate, enrolledAt + duration)
 * - Else (Self-paced) -> enrolledAt + 365 days (default) if no duration fields
 */
const computeValidUntil = (program, enrolledAt = new Date()) => {
    // Default duration if not specified: 1 year (365 days)
    const DEFAULT_VALIDITY_DAYS = 365;

    // Logic: 
    // If program has a strict endDate (e.g. Internship/Workshop), access usually ends there.
    // But we might want to give access for a bit longer.
    // Let's assume strict endDate for now if type != Course.

    let validUntil = new Date(enrolledAt);

    if (program.durationDays) {
        validUntil.setDate(validUntil.getDate() + program.durationDays);
    } else {
        validUntil.setDate(validUntil.getDate() + DEFAULT_VALIDITY_DAYS);
    }

    // Cap at program end date if it's a fixed event and arguably 'over'
    // Actually, for LMS, we often want access to continue. 
    // Plan Logic: "If program has fixed endDate -> validUntil = min(program.endDate, enrolledAt + durationDays)"??
    // Actually, if it's a Cohort based course, endDate is real.
    if (program.endDate) {
        // If the calculated validity exceeds the program end date, clamp it?
        // Or strictly disable access after endDate?
        // Let's go with: Access until End Date + 30 days buffer? 
        // Or strictly EndDate as per plan.
        // Plan said: "validUntil = min(program.endDate, enrolledAt + durationDays)"

        // However, if I enroll today and endDate is tomorrow, I get 1 day. Correct.
        if (validUntil > program.endDate) {
            validUntil = program.endDate;
        }
    }

    return validUntil;
};

/**
 * Create or Update Enrollment
 */
const createOrUpdateEnrollment = async ({ userId, programId, source = 'razorpay', paymentId }) => {
    const program = await Program.findById(programId);
    if (!program) throw new Error('Program not found');

    let enrollment = await Enrollment.findOne({ user: userId, program: programId });

    const now = new Date();
    const validUntil = computeValidUntil(program, now);

    if (enrollment) {
        // Reactivate if expired or update payment info
        enrollment.status = 'active';
        enrollment.validUntil = validUntil; // Extend validity? Or reset? Let's reset/extend.
        enrollment.source = source;
        if (paymentId) enrollment.paymentId = paymentId;
        await enrollment.save();
    } else {
        enrollment = await Enrollment.create({
            user: userId,
            program: programId,
            status: 'active',
            validUntil,
            source,
            paymentId,
            progressPercent: 0
        });
    }

    return enrollment;
};

module.exports = {
    createOrUpdateEnrollment,
    computeValidUntil
};
