const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Program = require('../models/Program');
const Enrollment = require('../models/Enrollment');

const runDebug = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Create Dummy Data
        console.log('Creating dummy data...');
        const program = await Program.create({
            title: 'Debug Program ' + Date.now(),
            description: 'For debugging purposes',
            type: 'Course',
            mode: 'Online',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            paymentMode: 'Free'
        });
        console.log(`Created Program: ${program.title} (${program._id})`);

        const user = await User.create({
            name: 'Debug User',
            email: `debug_${Date.now()}@test.com`,
            password: 'password123'
        });
        console.log(`Created User: ${user.name} (${user._id})`);

        const enrollment = await Enrollment.create({
            user: user._id,
            program: program._id,
            status: 'active'
        });
        console.log(`Created Enrollment: ${enrollment._id}`);

        // 2. Query and Populate (Mimic Admin Controller)
        console.log('Fetching Enrollment with population...');
        const fetchedEnrollment = await Enrollment.findById(enrollment._id)
            .populate('user', 'name email')
            .populate('program', 'title type fee');

        console.log('------------------------------------------------');
        console.log('Fetched Enrollment Result:');
        console.log('Enrollment ID:', fetchedEnrollment._id);

        if (fetchedEnrollment.program) {
            console.log('Program Title (Populated):', fetchedEnrollment.program.title);
            console.log('Program Type:', fetchedEnrollment.program.type);
        } else {
            console.log('Program Field is NULL/Undefined!');
        }

        if (fetchedEnrollment.user) {
            console.log('User Name (Populated):', fetchedEnrollment.user.name);
        } else {
            console.log('User Field is NULL/Undefined!');
        }
        console.log('------------------------------------------------');

        // Cleanup
        console.log('Cleaning up...');
        await Enrollment.deleteOne({ _id: enrollment._id });
        await Program.deleteOne({ _id: program._id });
        await User.deleteOne({ _id: user._id });
        console.log('Done.');

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runDebug();
