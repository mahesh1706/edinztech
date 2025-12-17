const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const Certificate = require('./models/Certificate');
const User = require('./models/User');
const Program = require('./models/Program');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const programId = '6941653c6ada56863d916455';

    // 1. Find Enrollments
    const enrollments = await Enrollment.find({
        program: programId,
        status: { $in: ['active', 'completed'] }
    }).populate('user', 'name email');

    console.log(`Found ${enrollments.length} enrollments.`);

    let triggeredCount = 0;
    let failedCount = 0;

    for (const enrollment of enrollments) {
        try {
            const user = enrollment.user;
            if (!user) {
                console.log(`No user for enrollment ${enrollment._id}`);
                continue;
            }

            console.log(`Processing user: ${user.email}`);

            // Check exists
            const exists = await Certificate.findOne({
                user: user._id,
                program: programId
            });

            console.log(`Exists? ${!!exists}, Status: ${exists?.status}`);

            if (!exists || exists.status === 'failed' || exists.status === 'pending') {
                console.log("Entering Creation Block...");
                // Simulation: Don't actually create to avoid messing DB, just check logic flow
                // Or better: Create it to verify ID generation works

                const year = new Date().getFullYear();
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const certificateId = `EDZ-CERT-SIM-${year}-${user._id.toString().slice(-4)}${randomSuffix}`;

                console.log(`Would create: ${certificateId}`);
            } else {
                console.log("Skipping (Already exists)");
            }

            // The critical increment
            triggeredCount++;

        } catch (err) {
            console.error("Error:", err);
            failedCount++;
        }
    }

    console.log(`Result: Issued=${triggeredCount}, Failed=${failedCount}`);
    await mongoose.disconnect();
}).catch(err => console.error(err));
