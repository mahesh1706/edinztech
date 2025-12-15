const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Program = require('../models/Program');
const Payment = require('../models/Payment');

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

const checkStats = async () => {
    await connectDB();

    try {
        // 1. Total Students
        const totalStudents = await User.countDocuments({ role: 'student' });
        console.log(`Total Students (DB): ${totalStudents}`);

        // 2. Active Programs
        const activePrograms = await Program.countDocuments({ isArchived: false });
        console.log(`Active Programs (DB): ${activePrograms}`);

        // 3. Revenue
        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'captured' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
        console.log(`Revenue (DB): ${revenue}`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

checkStats();
