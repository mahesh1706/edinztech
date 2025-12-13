const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find the user from screenshot "Test User"
        // Or we can list recent enrollments
        console.log("Fetching recent enrollments...");
        const enrollments = await Enrollment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user')
            .lean(); // Use lean to see raw data

        for (const e of enrollments) {
            console.log("------------------------------------------");
            console.log(`Enrollment ID: ${e._id}`);
            console.log(`User: ${e.user ? e.user.name : 'N/A'}`);
            console.log(`Raw Program Field:`, e.program); // This is what I want to see
            console.log(`ProgramType: ${e.programType}`);
            console.log(`EnrolledAt: ${e.enrolledAt}`);

            // Check if this program ID exists in Programs collection
            if (e.program) {
                const p = await Program.findById(e.program);
                console.log(`Does Program exist? ${!!p}`);
                if (p) {
                    console.log(`Program Title in DB: ${p.title}`);
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
