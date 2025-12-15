const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const User = require('../models/User');

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

const checkEnrollments = async () => {
    await connectDB();

    try {
        const enrollments = await Enrollment.find({})
            .populate('program', 'title type')
            .populate('user', 'name email');

        console.log(`Found ${enrollments.length} enrollments.`);

        enrollments.forEach(e => {
            console.log('--------------------------------------------------');
            console.log(`User: ${e.user?.name} (${e.user?.email})`);
            console.log(`Program ID: ${e.program?._id}`);
            console.log(`Program Title: ${e.program?.title}`);
            console.log(`Program Type (from Program): '${e.program?.type}'`);
            console.log(`Program Type (from Enrollment): '${e.programType}'`);
            console.log(`Enrollment Status: ${e.status}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

checkEnrollments();
