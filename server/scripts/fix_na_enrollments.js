const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const { generateUserCode } = require('../utils/encryption');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixEnrollments = async () => {
    await connectDB();

    try {
        console.log("Starting Fix Process...");
        const enrollments = await Enrollment.find({
            $or: [
                { userCode: { $exists: false } },
                { userCode: null },
                { userCode: 'N/A' },
                { programType: { $exists: false } }
            ]
        }).populate('user').populate('program');

        console.log(`Found ${enrollments.length} enrollments to check.`);

        for (const enrollment of enrollments) {
            let updated = false;

            // 1. Fix User Code
            if (!enrollment.userCode) {
                if (enrollment.user) {
                    let uCode = enrollment.user.userCode;

                    // If User also missing code, generate and save to User
                    if (!uCode) {
                        uCode = generateUserCode();
                        enrollment.user.userCode = uCode;
                        await enrollment.user.save();
                        console.log(`Generated new code for User ${enrollment.user.email}: ${uCode}`);
                    }

                    enrollment.userCode = uCode;
                    updated = true;
                } else {
                    console.warn(`Enrollment ${enrollment._id} has no valid User!`);
                }
            }

            // 2. Fix Program Type
            if (!enrollment.programType) {
                if (enrollment.program) {
                    enrollment.programType = enrollment.program.type || 'Course';
                    updated = true;
                }
            }

            if (updated) {
                await enrollment.save();
                console.log(`Fixed Enrollment ${enrollment._id}: Code=${enrollment.userCode}, Type=${enrollment.programType}`);
            }
        }

        console.log("Fix Process Completed.");
        process.exit();

    } catch (error) {
        console.error("Fix failed", error);
        process.exit(1);
    }
};

fixEnrollments();
